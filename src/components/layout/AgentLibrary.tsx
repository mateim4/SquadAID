import React, { useState, useMemo, useCallback, useRef, KeyboardEvent } from 'react';
import {
  Body1,
  Caption1,
  Title3,
  Divider,
  Input,
  tokens,
  Badge,
} from '@fluentui/react-components';
import {
  SearchIcon,
  LinkedIcon,
} from '@/components/icons';
import { useStyles } from '@/styles/useStyles';
import { agents } from '@/data/agents';
import { useProjectStore } from '@/store/projectStore';
import { Tooltip } from '@fluentui/react-components';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { iconSizes, touchTargets } from '@/styles/designTokens';

export const AgentLibrary: React.FC = () => {
    const styles = useStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const isMobile = useMediaQuery('(max-width: 700px)');
    const mode = useProjectStore(s => s.mode);
    const listRef = useRef<HTMLDivElement>(null);

    const handleDragStart = (e: React.DragEvent, agentId: string) => {
        e.dataTransfer.setData("application/squad-agent", agentId);
        e.dataTransfer.effectAllowed = "move";
    };

    const filteredAgents = useMemo(() =>
        agents.filter(agent =>
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        if (filteredAgents.length === 0) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => Math.min(prev + 1, filteredAgents.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Home':
                e.preventDefault();
                setFocusedIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setFocusedIndex(filteredAgents.length - 1);
                break;
            case 'Enter':
            case ' ':
                // Allow keyboard users to "activate" the focused agent
                // This announces the agent and could trigger an add-to-canvas action
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < filteredAgents.length) {
                    const agent = filteredAgents[focusedIndex];
                    const requires = (agent as any).requiresRepo === true;
                    if (!(requires && mode === 'local')) {
                        // Dispatch a custom event that the canvas can listen for
                        const event = new CustomEvent('squad-agent-select', {
                            detail: { agentId: agent.id },
                            bubbles: true,
                        });
                        e.currentTarget.dispatchEvent(event);
                    }
                }
                break;
        }
    }, [filteredAgents, focusedIndex, mode]);

    return (
        <div 
            className={`${styles.sidebar} palette`} 
            aria-label="Agent library"
            role="region"
        >
            <div className={styles.sidebarHeader}>
                <Title3 id="agent-library-title">Agent Library</Title3>
            </div>
            <div style={{ padding: isMobile ? '0 12px' : '0 16px' }}>
                <Input
                    contentBefore={<SearchIcon aria-hidden="true" />}
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e, data) => {
                        setSearchTerm(data.value);
                        setFocusedIndex(-1);
                    }}
                    className={styles.frostedInput}
                    aria-label="Search agents"
                />
            </div>
            {!isMobile && <Divider style={{ marginTop: '12px' }}/>}            
            <div 
                ref={listRef}
                className={styles.sidebarContent} 
                style={isMobile ? { padding: '8px 12px 12px' } : undefined}
                role="listbox"
                aria-labelledby="agent-library-title"
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                {filteredAgents.length === 0 && (
                    <Caption1 style={{ color: tokens.colorNeutralForeground3, textAlign: 'center', padding: 16 }}>
                        No agents found matching "{searchTerm}"
                    </Caption1>
                )}
                {filteredAgents.map((agent, index) => {
                    const requires = (agent as any).requiresRepo === true;
                    const disabled = requires && mode === 'local';
                    const isFocused = focusedIndex === index;
                    
                    const item = (
                        <div 
                            key={agent.id}
                            className={styles.listItem}
                            draggable={!disabled}
                            onDragStart={(e) => !disabled && handleDragStart(e, agent.id)}
                            role="option"
                            aria-selected={isFocused}
                            aria-disabled={disabled}
                            tabIndex={isFocused ? 0 : -1}
                            style={{ 
                                ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined), 
                                ...(isMobile ? { padding: '10px', gap: '12px', minHeight: touchTargets.minimum } : undefined),
                                ...(isFocused ? { 
                                    outline: `2px solid ${tokens.colorBrandStroke1}`,
                                    outlineOffset: '-2px',
                                } : undefined)
                            }}
                        >
                            <agent.Icon fontSize={iconSizes.lg} aria-hidden="true" />
                            <div className={styles.listItemContent}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Body1><b>{agent.name}</b></Body1>
                                    {requires && (
                                        <Badge 
                                            appearance="outline" 
                                            size="small"
                                            icon={<LinkedIcon />}
                                            aria-label="Requires GitHub"
                                        >
                                            GitHub
                                        </Badge>
                                    )}
                                </div>
                                <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
                                    {agent.description}
                                </Caption1>
                            </div>
                        </div>
                    );
                    return disabled ? (
                        <Tooltip key={agent.id} content="Requires GitHub (Hybrid or GitHub project)" relationship="description">{item}</Tooltip>
                    ) : item;
                })}
            </div>
        </div>
    );
};
