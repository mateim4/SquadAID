import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import {
  makeStyles,
  shorthands,
  tokens,
  Title3,
  Caption1,
  Card,
  CardHeader,
  Button,
  Input,
  Label,
  Text,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from '@fluentui/react-components';
import {
  Save24Regular,
  Play24Regular,
  Delete24Regular,
  MoreVertical24Regular,
  Folder24Regular,
  Flow24Regular,
  Circle24Filled,
  Pause24Regular,
  Stop24Regular,
  ErrorCircle24Regular,
} from '@fluentui/react-icons';
import useFlowStore from '../store/flow';

const useStyles = makeStyles({
  library: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalL),
    width: '320px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralStroke2),
    backdropFilter: 'blur(80px) saturate(200%)',
    WebkitBackdropFilter: 'blur(80px) saturate(200%)',
    position: 'relative',
    zIndex: 10,
    boxShadow: `0 0 0 0.5px ${tokens.colorNeutralStroke1}, 0 12px 48px ${tokens.colorNeutralShadowKey}, 0 4px 16px ${tokens.colorNeutralShadowAmbient}, inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.05)`,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.colorNeutralStroke2} transparent`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: `linear-gradient(135deg, ${tokens.colorBrandBackground}08 0%, transparent 30%, ${tokens.colorBrandBackground}04 70%, transparent 100%)`,
      pointerEvents: 'none',
      opacity: 0.6,
    },
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: tokens.colorBrandBackground2,
      ...shorthands.borderRadius(tokens.borderRadiusSmall),
      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
      '&:hover': {
        backgroundColor: tokens.colorBrandBackground,
        boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 8px ${tokens.colorBrandShadowAmbient}`,
      },
    },
  },
  header: {
    ...shorthands.margin('0', '0', tokens.spacingVerticalL, '0'),
  },
  title: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase500,
    textShadow: `0 2px 4px ${tokens.colorNeutralShadowAmbient}`,
    position: 'relative',
    transition: 'all 0.3s ease-in-out',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-4px',
      left: '0',
      width: '0%',
      height: '2px',
      background: `linear-gradient(90deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
      transition: 'width 0.3s ease-in-out',
    },
    '&:hover': {
      transform: 'translateY(-1px)',
      textShadow: `0 4px 8px ${tokens.colorBrandShadowAmbient}`,
      '&::after': {
        width: '100%',
      },
    },
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    ...shorthands.margin(tokens.spacingVerticalXS, '0', '0', '0'),
  },
  saveSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    position: 'relative',
    zIndex: 2,
  },
  saveButton: {
    width: '100%',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '0px',
      height: '0px',
      background: `radial-gradient(circle, ${tokens.colorBrandBackground}30, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.4s ease-out',
      zIndex: -1,
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${tokens.colorBrandShadowAmbient}`,
      '&::before': {
        width: '120px',
        height: '120px',
      },
    },
    '&:active': {
      transform: 'translateY(0px) scale(0.98)',
    },
  },
  workflowGrid: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  workflowCard: {
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px) saturate(120%)',
    WebkitBackdropFilter: 'blur(10px) saturate(120%)',
    boxShadow: `0 0 0 0.5px ${tokens.colorNeutralStroke1}, 0 1px 2px ${tokens.colorNeutralShadowAmbient}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${tokens.colorBrandBackground}30, transparent)`,
      transition: 'left 0.6s ease-in-out',
    },
    '&:hover': {
      backgroundColor: `${tokens.colorNeutralBackground1}40`,
      ...shorthands.border('2px', 'solid', tokens.colorBrandStroke2),
      boxShadow: `0 0 0 1px ${tokens.colorBrandStroke1}, 0 4px 12px ${tokens.colorBrandShadowAmbient}, 0 8px 24px ${tokens.colorBrandShadowKey}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
      backdropFilter: 'blur(20px) saturate(150%)',
      WebkitBackdropFilter: 'blur(20px) saturate(150%)',
      '&::before': {
        left: '100%',
      },
    },
    '&:active': {
      transform: 'scale(0.96)',
    },
  },
  selectedCard: {
    backgroundColor: tokens.colorBrandBackground2,
    ...shorthands.border('1px', 'solid', tokens.colorBrandStroke1),
    boxShadow: `0 0 0 0.5px ${tokens.colorBrandStroke1}, 0 4px 12px ${tokens.colorBrandShadowAmbient}, 0 16px 32px ${tokens.colorBrandShadowKey}`,
  },
  workflowHeader: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
  },
  workflowIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    zIndex: 2,
  },
  workflowTitle: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    ...shorthands.margin('0'),
  },
  workflowDescription: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    ...shorthands.margin(tokens.spacingVerticalXS, '0', '0', '0'),
  },
  workflowActions: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalXS),
    position: 'relative',
    zIndex: 2,
  },
  actionButton: {
    minWidth: 'auto',
    width: '28px',
    height: '28px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'scale(1.1)',
    },
    '&:active': {
      transform: 'scale(0.9)',
    },
  },
  emptyState: {
    textAlign: 'center',
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalM),
    color: tokens.colorNeutralForeground3,
    position: 'relative',
    zIndex: 2,
  },
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
    marginBottom: tokens.spacingVerticalM,
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalXS),
    fontSize: '12px',
    fontWeight: tokens.fontWeightMedium,
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    position: 'absolute',
    top: tokens.spacingVerticalS,
    right: tokens.spacingHorizontalS,
    zIndex: 3,
  },
  statusRunning: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground2,
    '& > svg': {
      color: tokens.colorPaletteGreenForeground1,
      animation: 'pulse 2s ease-in-out infinite',
    },
  },
  statusPaused: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground2,
    '& > svg': {
      color: tokens.colorPaletteYellowForeground1,
    },
  },
  statusStopped: {
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground3,
    '& > svg': {
      color: tokens.colorNeutralForeground2,
    },
  },
  statusError: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
    '& > svg': {
      color: tokens.colorPaletteRedForeground1,
      animation: 'shake 0.5s ease-in-out infinite',
    },
  },
});

type WorkflowStatus = 'running' | 'paused' | 'stopped' | 'error';

interface Workflow {
  id: number;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  viewport: any;
  created_at: string;
  updated_at: string;
  status?: WorkflowStatus;
}

interface WorkflowLibraryProps {
  onWorkflowSelect?: (workflow: Workflow) => void;
  selectedWorkflowId?: number | null;
  showPlayButton?: boolean;
  onPlayWorkflow?: (workflow: Workflow) => void;
}

const WorkflowLibrary: React.FC<WorkflowLibraryProps> = ({ 
  onWorkflowSelect, 
  selectedWorkflowId, 
  showPlayButton = false,
  onPlayWorkflow 
}) => {
  const styles = useStyles();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workflowStatuses, setWorkflowStatuses] = useState<Record<number, WorkflowStatus>>({});
  const { nodes, edges, viewport } = useFlowStore();

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'running':
        return <Circle24Filled />;
      case 'paused':
        return <Pause24Regular />;
      case 'stopped':
        return <Stop24Regular />;
      case 'error':
        return <ErrorCircle24Regular />;
      default:
        return <Stop24Regular />;
    }
  };

  const getStatusText = (status: WorkflowStatus) => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'paused':
        return 'Paused';
      case 'stopped':
        return 'Stopped';
      case 'error':
        return 'Error';
      default:
        return 'Stopped';
    }
  };

  const getStatusStyle = (status: WorkflowStatus) => {
    switch (status) {
      case 'running':
        return styles.statusRunning;
      case 'paused':
        return styles.statusPaused;
      case 'stopped':
        return styles.statusStopped;
      case 'error':
        return styles.statusError;
      default:
        return styles.statusStopped;
    }
  };

  const loadWorkflows = async () => {
    try {
      const workflowList = await invoke<Workflow[]>('list_workflows');
      setWorkflows(workflowList);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleSaveWorkflow = async () => {
    if (!newWorkflowName.trim()) return;
    
    setIsLoading(true);
    try {
      const graphState = { nodes, edges, viewport };
      await invoke('save_workflow', {
        name: newWorkflowName.trim(),
        graphStateJson: JSON.stringify(graphState),
      });
      setNewWorkflowName('');
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadWorkflow = (workflow: Workflow) => {
    const { setFlow } = useFlowStore.getState();
    setFlow({
      nodes: workflow.nodes,
      edges: workflow.edges,
      viewport: workflow.viewport,
    });
    onWorkflowSelect?.(workflow);
  };

  const handleDeleteWorkflow = async (workflowId: number) => {
    try {
      await invoke('delete_workflow', { id: workflowId });
      await loadWorkflows();
      if (selectedWorkflowId === workflowId) {
        onWorkflowSelect?.(null as any);
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const handlePlayWorkflow = (workflow: Workflow) => {
    // Update status to running when workflow is triggered
    setWorkflowStatuses(prev => ({
      ...prev,
      [workflow.id]: 'running'
    }));
    onPlayWorkflow?.(workflow);
  };

  // Method to update workflow status from external events
  const updateWorkflowStatus = (workflowId: number, status: WorkflowStatus) => {
    setWorkflowStatuses(prev => ({
      ...prev,
      [workflowId]: status
    }));
  };

  // Expose status update method through ref or callback
  React.useImperativeHandle(React.useRef(), () => ({
    updateWorkflowStatus,
  }));

  return (
    <aside className={styles.library}>
      <div className={styles.header}>
        <Title3 className={styles.title}>Workflow Library</Title3>
        <Caption1 className={styles.subtitle}>
          Save and manage your agent workflows
        </Caption1>
      </div>
      
      <div className={styles.saveSection}>
        <Label htmlFor="workflow-name">Save Current Workflow</Label>
        <Input
          id="workflow-name"
          value={newWorkflowName}
          onChange={(_e, data) => setNewWorkflowName(data.value)}
          placeholder="Enter workflow name..."
        />
        <Button
          appearance="primary"
          onClick={handleSaveWorkflow}
          disabled={!newWorkflowName.trim() || isLoading}
          icon={<Save24Regular />}
          className={styles.saveButton}
        >
          {isLoading ? 'Saving...' : 'Save Workflow'}
        </Button>
      </div>
      
      <div className={styles.workflowGrid}>
        {workflows.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Folder24Regular />
            </div>
            <Text>No workflows saved yet</Text>
            <Caption1>Create your first workflow and save it to get started</Caption1>
          </div>
        ) : (
          workflows.map((workflow) => {
            const currentStatus = workflowStatuses[workflow.id] || workflow.status || 'stopped';
            return (
              <Card
                key={workflow.id}
                className={`${styles.workflowCard} ${
                  selectedWorkflowId === workflow.id ? styles.selectedCard : ''
                }`}
                onClick={() => handleLoadWorkflow(workflow)}
                appearance="filled-alternative"
              >
                <div className={`${styles.statusIndicator} ${getStatusStyle(currentStatus)}`}>
                  {getStatusIcon(currentStatus)}
                  {getStatusText(currentStatus)}
                </div>
                <CardHeader
                  image={<span className={styles.workflowIcon}><Flow24Regular /></span>}
                  header={<div className={styles.workflowTitle}>{workflow.name}</div>}
                  description={
                    <div>
                      <Caption1 className={styles.workflowDescription}>
                        {workflow.description || `${workflow.nodes?.length || 0} nodes, ${workflow.edges?.length || 0} connections`}
                      </Caption1>
                      <Caption1 className={styles.workflowDescription}>
                        Created: {new Date(workflow.created_at).toLocaleDateString()}
                      </Caption1>
                    </div>
                  }
                  action={
                    <div className={styles.workflowActions}>
                      {showPlayButton && (
                        <Button
                          appearance="subtle"
                          icon={<Play24Regular />}
                          className={styles.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayWorkflow(workflow);
                          }}
                          title="Run this workflow"
                        />
                      )}
                      <Menu>
                        <MenuTrigger disableButtonEnhancement>
                          <Button
                            appearance="subtle"
                            icon={<MoreVertical24Regular />}
                            className={styles.actionButton}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem
                              icon={<Delete24Regular />}
                              onClick={() => handleDeleteWorkflow(workflow.id)}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    </div>
                  }
                  className={styles.workflowHeader}
                />
              </Card>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default WorkflowLibrary;