import React, { useState, useMemo } from 'react';
import {
  Body1,
  Caption1,
  Title3,
  Divider,
  Input,
  tokens,
} from '@fluentui/react-components';
import {
  Search24Regular,
} from '@fluentui/react-icons';
import { useStyles } from '@/styles/useStyles';
import { agents } from '@/data/agents';
import { useProjectStore } from '@/store/projectStore';
import { Tooltip } from '@fluentui/react-components';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const AgentLibrary: React.FC = () => {
    const styles = useStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const isMobile = useMediaQuery('(max-width: 700px)');
    const mode = useProjectStore(s => s.mode);

    const handleDragStart = (e: React.DragEvent, agentId: string) => {
        e.dataTransfer.setData("application/squad-agent", agentId);
        e.dataTransfer.effectAllowed = "move";
    };

    const filteredAgents = useMemo(() =>
        agents.filter(agent =>
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm]);

    return (
        <div className={`${styles.sidebar} palette`} aria-label="Agent palette">
            <div className={styles.sidebarHeader}>
                <Title3>Agent Library</Title3>
            </div>
    <div style={{ padding: isMobile ? '0 12px' : '0 16px' }}>
                <Input
                    contentBefore={<Search24Regular />}
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e, data) => setSearchTerm(data.value)}
            className={styles.frostedInput}
                />
            </div>
            {!isMobile && <Divider style={{ marginTop: '12px' }}/>}            
            <div className={styles.sidebarContent} style={isMobile ? { padding: '8px 12px 12px' } : undefined}>
                {filteredAgents.map((agent) => {
                    const requires = (agent as any).requiresRepo === true;
                    const disabled = requires && mode === 'local';
                    const item = (
                        <div 
                            key={agent.id}
                            className={styles.listItem}
                            draggable={!disabled}
                            onDragStart={(e) => !disabled && handleDragStart(e, agent.id)}
                            style={{ ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined), ...(isMobile ? { padding: '10px', gap: '12px' } as any : undefined) }}
                        >
                            <agent.Icon fontSize={28} />
                            <div className={styles.listItemContent}>
                                <Body1><b>{agent.name}</b></Body1>
                                <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{agent.description}{requires ? ' • Requires GitHub' : ''}</Caption1>
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
