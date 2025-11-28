import { memo, useMemo, useState, useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import {
  Card,
  CardHeader,
  Input,
  Textarea,
  makeStyles,
  shorthands,
  tokens,
  Label,
  Button,
  Badge,
  Tooltip,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Divider,
  Text,
  Spinner,
} from '@fluentui/react-components';
import {
  ChevronDown24Regular,
  ChevronUp24Regular,
  Person24Regular,
  Checkmark24Regular,
  Warning24Regular,
  Clock24Regular,
  Dismiss24Regular,
  Settings24Regular,
} from '@fluentui/react-icons';
import { useWorkflowStore } from '@/store/workflowStore';
import { useRoleStore } from '@/store/roleStore';
import { useAgentStore } from '@/store/agentStore';
import { AgentNodeData, AgentStatus, AgentCapability, getStatusLabel } from '@/types/enhanced-agent';
import { AgentMode } from '@/types/provider';
import type { Role } from '@/types/role';

/**
 * Node data interface for EnhancedAgentNode.
 * Uses AgentNodeData but allows partial data for React Flow compatibility.
 */
interface EnhancedAgentNodeData extends Partial<AgentNodeData> {
  /** Display name for the agent */
  name: string;
  /** System message/prompt */
  systemMessage?: string;
  /** Whether the node is expanded */
  expanded?: boolean;
  /** Display label */
  label?: string;
  /** Primary role ID */
  roleId?: string;
  /** Current status (using enum values as strings for UI) */
  status?: AgentStatus;
  /** Agent mode */
  mode?: AgentMode;
  /** Capabilities list */
  capabilities?: AgentCapability[];
  /** Task completion count */
  taskCount?: number;
  /** Success rate (0-1) */
  successRate?: number;
  /** Average response time in ms */
  avgResponseTime?: number;
}

const useStyles = makeStyles({
  card: {
    width: '320px',
    position: 'relative',
    overflow: 'hidden',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: tokens.durationNormal,
    '&:hover': {
      boxShadow: tokens.shadow8,
    },
  },
  cardSelected: {
    ...shorthands.border('2px', 'solid', tokens.colorBrandStroke1),
    boxShadow: tokens.shadow16,
  },
  cardHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  selectionBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundImage: 'linear-gradient(90deg, #f44336, #ff9800, #ffeb3b, #4caf50, #2196f3, #3f51b5, #9c27b0)',
    backgroundSize: '400% 100%',
    animationName: {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    animationDuration: '3s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  statusIndicator: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '12px',
    height: '12px',
    ...shorthands.borderRadius('50%'),
    ...shorthands.border('2px', 'solid', tokens.colorNeutralBackground1),
  },
  statusActive: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
  },
  statusInactive: {
    backgroundColor: tokens.colorNeutralForeground4,
  },
  statusBusy: {
    backgroundColor: tokens.colorPaletteYellowBackground3,
    animationName: {
      '0%': { opacity: 1 },
      '50%': { opacity: 0.5 },
      '100%': { opacity: 1 },
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
  statusError: {
    backgroundColor: tokens.colorPaletteRedBackground3,
  },
  statusConnecting: {
    backgroundColor: tokens.colorPaletteDarkOrangeBorder2,
  },
  statusPaused: {
    backgroundColor: tokens.colorNeutralForeground3,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalM),
  },
  roleSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
  },
  roleInfo: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalXS),
  },
  capabilitiesSection: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap(tokens.spacingHorizontalXS),
    marginTop: tokens.spacingVerticalXS,
  },
  capabilityBadge: {
    fontSize: tokens.fontSizeBase100,
  },
  modeSection: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  modeBadge: {
    textTransform: 'capitalize',
  },
  nodrag: {
    pointerEvents: 'all',
  },
  handle: {
    width: '12px',
    height: '12px',
    backgroundColor: tokens.colorBrandBackground,
    ...shorthands.border('2px', 'solid', tokens.colorNeutralBackground1),
  },
  handleTarget: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
  },
  toggle: {
    display: 'flex',
    justifyContent: 'center',
    ...shorthands.padding(tokens.spacingVerticalXS),
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalXS),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    marginTop: tokens.spacingVerticalXS,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

/**
 * Maps AgentStatus to the appropriate CSS class
 */
const getStatusClass = (status: AgentStatus | undefined, styles: ReturnType<typeof useStyles>): string => {
  if (!status) return styles.statusInactive;
  
  switch (status) {
    case AgentStatus.ACTIVE:
      return styles.statusActive;
    case AgentStatus.BUSY:
      return styles.statusBusy;
    case AgentStatus.ERROR:
      return styles.statusError;
    case AgentStatus.CONNECTING:
      return styles.statusConnecting;
    case AgentStatus.PAUSED:
      return styles.statusPaused;
    case AgentStatus.INACTIVE:
    default:
      return styles.statusInactive;
  }
};

/**
 * Get status icon component
 */
const StatusIcon = ({ status }: { status?: AgentStatus }) => {
  if (!status) return null;
  
  switch (status) {
    case AgentStatus.BUSY:
    case AgentStatus.CONNECTING:
      return <Spinner size="tiny" />;
    case AgentStatus.ACTIVE:
      return <Checkmark24Regular />;
    case AgentStatus.ERROR:
      return <Warning24Regular />;
    case AgentStatus.PAUSED:
      return <Clock24Regular />;
    default:
      return null;
  }
};

/**
 * Get badge appearance based on mode
 */
const getModeAppearance = (mode?: AgentMode): 'filled' | 'outline' | 'tint' | 'ghost' => {
  if (!mode) return 'outline';
  
  switch (mode) {
    case AgentMode.LOCAL:
      return 'filled';
    case AgentMode.REMOTE:
      return 'tint';
    case AgentMode.HYBRID:
      return 'ghost';
    default:
      return 'outline';
  }
};

/**
 * Get human-readable mode label
 */
const getModeLabel = (mode?: AgentMode): string => {
  if (!mode) return 'Local';
  
  switch (mode) {
    case AgentMode.LOCAL:
      return 'Local';
    case AgentMode.REMOTE:
      return 'Remote';
    case AgentMode.HYBRID:
      return 'Hybrid';
    default:
      return mode;
  }
};

/**
 * EnhancedAgentNode - A rich agent node with role assignment, status, and capabilities
 * 
 * This component extends the basic agent node pattern with:
 * - Role assignment from the Role Library
 * - Real-time status indicators
 * - Capability badges
 * - Execution mode control
 * - Performance statistics
 */
const EnhancedAgentNode = memo(({ id, data, selected }: NodeProps<EnhancedAgentNodeData>) => {
  const styles = useStyles();
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const removeNode = useWorkflowStore(s => s.removeNode);
  
  // Role store integration
  const getBuiltInRoles = useRoleStore(s => s.getBuiltInRoles);
  const getCustomRoles = useRoleStore(s => s.getCustomRoles);
  const getRole = useRoleStore(s => s.getRole);
  
  // Get all roles for the dropdown
  const allRoles = useMemo(() => {
    const builtIn = getBuiltInRoles();
    const custom = getCustomRoles();
    return [...builtIn, ...custom];
  }, [getBuiltInRoles, getCustomRoles]);
  
  // Agent store for status updates
  const updateAgentStatus = useAgentStore(s => s.updateAgentStatus);
  
  const [expanded, setExpanded] = useState(data.expanded ?? false);
  
  // Extract data with defaults
  const {
    name = '',
    systemMessage = '',
    roleId,
    status = AgentStatus.INACTIVE,
    mode = AgentMode.LOCAL,
    capabilities = [],
    taskCount = 0,
    successRate,
    avgResponseTime,
  } = data;
  
  // Find assigned role
  const assignedRole = useMemo(() => {
    if (!roleId) return null;
    return getRole(roleId);
  }, [roleId, getRole]);
  
  // Handle role assignment
  const handleAssignRole = useCallback((role: Role) => {
    updateNodeData(id, {
      roleId: role.id,
      // Also update system message if role has attributes and current is empty
      ...(role.attributes?.description && !data.systemMessage 
        ? { systemMessage: role.attributes.description } 
        : {}),
      // Merge capabilities from role skills
      capabilities: (role.attributes?.skills ?? []) as AgentCapability[],
    });
  }, [id, updateNodeData, data.systemMessage]);
  
  // Handle role removal
  const handleRemoveRole = useCallback(() => {
    updateNodeData(id, {
      roleId: undefined,
      capabilities: [],
    });
  }, [id, updateNodeData]);
  
  // Handle mode change
  const handleModeChange = useCallback((newMode: AgentMode) => {
    updateNodeData(id, { mode: newMode });
  }, [id, updateNodeData]);
  
  // Handle status change (for testing/manual override)
  const handleStatusChange = useCallback((newStatus: AgentStatus) => {
    updateNodeData(id, { status: newStatus });
    updateAgentStatus(id, newStatus);
  }, [id, updateNodeData, updateAgentStatus]);
  
  // Calculate display values
  const displaySuccessRate = successRate !== undefined 
    ? `${Math.round(successRate * 100)}%` 
    : '-';
  const displayAvgTime = avgResponseTime !== undefined 
    ? `${Math.round(avgResponseTime / 1000)}s` 
    : '-';
  
  return (
    <Card className={`${styles.card} ${selected ? styles.cardSelected : ''}`}>
      {selected && <div className={styles.selectionBar} />}
      
      {/* Status Indicator */}
      <div 
        className={`${styles.statusIndicator} ${getStatusClass(status, styles)}`}
        title={`Status: ${getStatusLabel(status)}`}
      />
      
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={`${styles.handle} ${styles.handleTarget}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handle}
      />
      
      {/* Header */}
      <CardHeader
        className={`${styles.cardHeader} drag-handle`}
        header={
          <div className={styles.headerContent}>
            <Person24Regular />
            <b>{data.label || name || 'Enhanced Agent'}</b>
            {assignedRole && (
              <Badge size="small" appearance="outline">
                {assignedRole.name}
              </Badge>
            )}
          </div>
        }
        action={
          <Button 
            size="small" 
            appearance="subtle" 
            icon={<Dismiss24Regular />}
            onClick={(e) => { e.stopPropagation(); removeNode(id); }}
          />
        }
      />
      
      <div className={styles.cardContent}>
        {/* Role Section */}
        <div className={styles.roleSection}>
          <div className={styles.roleInfo}>
            <Text size={200} weight="semibold">Role:</Text>
            <Text size={200}>
              {assignedRole ? assignedRole.name : 'No role assigned'}
            </Text>
          </div>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button 
                size="small" 
                appearance="subtle"
                icon={<Settings24Regular />}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {assignedRole ? 'Change' : 'Assign'}
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {assignedRole && (
                  <>
                    <MenuItem onClick={handleRemoveRole}>
                      Remove Role
                    </MenuItem>
                    <Divider />
                  </>
                )}
                {allRoles.map(role => (
                  <MenuItem 
                    key={role.id} 
                    onClick={() => handleAssignRole(role)}
                  >
                    {role.name}
                    {role.category && (
                      <Text size={100} style={{ marginLeft: 8, color: tokens.colorNeutralForeground3 }}>
                        ({role.category})
                      </Text>
                    )}
                  </MenuItem>
                ))}
                {allRoles.length === 0 && (
                  <MenuItem disabled>No roles available</MenuItem>
                )}
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
        
        {/* Mode Section */}
        <div className={styles.modeSection}>
          <Text size={200} weight="semibold">Mode:</Text>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Badge 
                appearance={getModeAppearance(mode)}
                className={styles.modeBadge}
                style={{ cursor: 'pointer' }}
              >
                {getModeLabel(mode)}
              </Badge>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={() => handleModeChange(AgentMode.LOCAL)}>
                  <Tooltip content="Agent runs on local machine" relationship="description">
                    <span>Local</span>
                  </Tooltip>
                </MenuItem>
                <MenuItem onClick={() => handleModeChange(AgentMode.REMOTE)}>
                  <Tooltip content="Agent connects to remote API" relationship="description">
                    <span>Remote</span>
                  </Tooltip>
                </MenuItem>
                <MenuItem onClick={() => handleModeChange(AgentMode.HYBRID)}>
                  <Tooltip content="Combination of local and remote" relationship="description">
                    <span>Hybrid</span>
                  </Tooltip>
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          
          {/* Status with icon */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <StatusIcon status={status} />
            <Text size={200}>{getStatusLabel(status)}</Text>
          </div>
        </div>
        
        {/* Capabilities */}
        {capabilities.length > 0 && (
          <div className={styles.capabilitiesSection}>
            {capabilities.slice(0, expanded ? undefined : 3).map((cap: string, idx: number) => (
              <Badge 
                key={idx} 
                size="small" 
                appearance="outline"
                className={styles.capabilityBadge}
              >
                {cap}
              </Badge>
            ))}
            {!expanded && capabilities.length > 3 && (
              <Badge size="small" appearance="ghost">
                +{capabilities.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Statistics Row */}
        {(taskCount > 0 || successRate !== undefined) && (
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <Text size={100} weight="semibold">Tasks</Text>
              <Text size={200}>{taskCount}</Text>
            </div>
            <div className={styles.statItem}>
              <Text size={100} weight="semibold">Success</Text>
              <Text size={200}>{displaySuccessRate}</Text>
            </div>
            <div className={styles.statItem}>
              <Text size={100} weight="semibold">Avg Time</Text>
              <Text size={200}>{displayAvgTime}</Text>
            </div>
          </div>
        )}
        
        {/* Expanded Section */}
        {expanded && (
          <>
            <Divider />
            
            <Label htmlFor={`name-${id}`}>Agent Name</Label>
            <Input
              id={`name-${id}`}
              value={name}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onChange={(e, d) => updateNodeData(id, { name: d.value })}
              className={styles.nodrag}
              placeholder="e.g., Research Agent"
            />
            
            <Label htmlFor={`system-message-${id}`}>System Prompt</Label>
            <Textarea
              id={`system-message-${id}`}
              value={systemMessage}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onChange={(e, d) => updateNodeData(id, { systemMessage: d.value })}
              className={styles.nodrag}
              placeholder={assignedRole?.attributes?.description || "You are a helpful assistant..."}
              rows={4}
              resize="vertical"
            />
            
            {/* Role-specific fields when a role is assigned */}
            {assignedRole && (
              <>
                <Divider />
                <Text size={200} weight="semibold">Role Details</Text>
                <Text size={200}>{assignedRole.attributes.description}</Text>
                
                {assignedRole.attributes?.skills && assignedRole.attributes.skills.length > 0 && (
                  <>
                    <Label>Skills</Label>
                    <div className={styles.capabilitiesSection}>
                      {assignedRole.attributes.skills.map((skill: string, idx: number) => (
                        <Badge key={idx} size="small" appearance="tint">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
        
        {/* Toggle Button */}
        <div className={styles.toggle}>
          <Button
            appearance="subtle"
            size="small"
            icon={expanded ? <ChevronUp24Regular /> : <ChevronDown24Regular />}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
              updateNodeData(id, { expanded: !expanded });
            }}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </div>
      </div>
    </Card>
  );
});

EnhancedAgentNode.displayName = 'EnhancedAgentNode';

export default EnhancedAgentNode;
