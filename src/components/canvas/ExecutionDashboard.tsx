import React, { useMemo, useState, useCallback } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  CardHeader,
  Text,
  Badge,
  Button,
  Divider,
  ProgressBar,
  Spinner,
  TabList,
  Tab,
  SelectTabEvent,
  SelectTabData,
  Tooltip,
} from '@fluentui/react-components';
import {
  Play24Regular,
  Pause24Regular,
  Stop24Regular,
  ArrowClockwise24Regular,
  Timeline24Regular,
  PersonCircle24Regular,
  DocumentBulletList24Regular,
  Warning24Regular,
  Checkmark24Regular,
  Clock24Regular,
} from '@fluentui/react-icons';
import { useInteractionStore } from '@/store/interactionStore';
import { useAgentStore } from '@/store/agentStore';
import { AgentStatus, getStatusLabel } from '@/types/enhanced-agent';
import { InteractionType, InteractionStatus, AgentInteraction } from '@/types/interaction';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  controls: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  mainPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
  },
  sidebar: {
    width: '320px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
  },
  sidebarContent: {
    flex: 1,
    overflowY: 'auto',
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    ...shorthands.gap(tokens.spacingHorizontalM),
    marginBottom: tokens.spacingVerticalL,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingVerticalM),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  statValue: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  statLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXS,
  },
  timeline: {
    flex: 1,
    overflowY: 'auto',
    ...shorthands.padding(tokens.spacingVerticalS, 0),
  },
  timelineItem: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalM),
    marginBottom: tokens.spacingVerticalM,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '15px',
      top: '32px',
      bottom: '-16px',
      width: '2px',
      backgroundColor: tokens.colorNeutralStroke2,
    },
    '&:last-child::before': {
      display: 'none',
    },
  },
  timelineIcon: {
    width: '32px',
    height: '32px',
    ...shorthands.borderRadius('50%'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  timelineHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalXS,
  },
  agentCard: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    marginBottom: tokens.spacingVerticalS,
  },
  agentStatus: {
    width: '10px',
    height: '10px',
    ...shorthands.borderRadius('50%'),
  },
  progressSection: {
    marginBottom: tokens.spacingVerticalL,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalS,
  },
});

interface ExecutionDashboardProps {
  /** Workflow ID being executed */
  workflowId?: string;
  /** Whether execution is in progress */
  isExecuting?: boolean;
  /** Callback to start execution */
  onStart?: () => void;
  /** Callback to pause execution */
  onPause?: () => void;
  /** Callback to stop execution */
  onStop?: () => void;
  /** Callback to restart execution */
  onRestart?: () => void;
}

/**
 * Get icon for interaction type
 */
const getInteractionIcon = (type: InteractionType) => {
  switch (type) {
    case InteractionType.TASK_ASSIGN:
    case InteractionType.HANDOFF:
      return <PersonCircle24Regular />;
    case InteractionType.NOTIFY:
    case InteractionType.PROGRESS_UPDATE:
      return <DocumentBulletList24Regular />;
    case InteractionType.TASK_COMPLETE:
    case InteractionType.APPROVE:
      return <Checkmark24Regular />;
    case InteractionType.ERROR_REPORT:
    case InteractionType.REJECT:
      return <Warning24Regular />;
    default:
      return <Timeline24Regular />;
  }
};

/**
 * Get status badge appearance
 */
const getStatusBadgeAppearance = (status: InteractionStatus): 'filled' | 'outline' | 'tint' => {
  switch (status) {
    case 'completed':
      return 'filled';
    case 'in_progress':
      return 'tint';
    case 'failed':
      return 'filled';
    default:
      return 'outline';
  }
};

/**
 * Get agent status color
 */
const getAgentStatusColor = (status: AgentStatus): string => {
  switch (status) {
    case AgentStatus.ACTIVE:
      return tokens.colorPaletteGreenBackground3;
    case AgentStatus.BUSY:
      return tokens.colorPaletteYellowBackground3;
    case AgentStatus.ERROR:
      return tokens.colorPaletteRedBackground3;
    case AgentStatus.CONNECTING:
      return tokens.colorPaletteDarkOrangeBorder2;
    case AgentStatus.PAUSED:
      return tokens.colorNeutralForeground3;
    default:
      return tokens.colorNeutralForeground4;
  }
};

/**
 * ExecutionDashboard - Dashboard for monitoring workflow execution
 * 
 * Features:
 * - Real-time execution statistics
 * - Interaction timeline
 * - Agent status monitoring
 * - Execution controls (start, pause, stop, restart)
 * - Progress tracking
 */
export function ExecutionDashboard({
  workflowId,
  isExecuting = false,
  onStart,
  onPause,
  onStop,
  onRestart,
}: ExecutionDashboardProps) {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState<string>('timeline');
  
  // Get interaction data from store
  const interactions = useInteractionStore(s => s.interactions);
  const getInteractionStats = useInteractionStore(s => s.getInteractionStats);
  const stats = useMemo(() => getInteractionStats(workflowId), [workflowId, getInteractionStats]);
  
  // Get agent data from store
  const agentsMap = useAgentStore(s => s.agents);
  const agents = useMemo(() => Array.from(agentsMap.values()), [agentsMap]);
  
  // Calculate progress
  const progress = useMemo(() => {
    if (stats.total === 0) return 0;
    return stats.completed / stats.total;
  }, [stats]);
  
  // Filter interactions for this workflow
  const workflowInteractions = useMemo(() => {
    return Array.from(interactions.values())
      .filter(i => !workflowId || i.workflowId === workflowId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [interactions, workflowId]);
  
  // Handle tab change
  const handleTabSelect = useCallback((_: SelectTabEvent, data: SelectTabData) => {
    setActiveTab(data.value as string);
  }, []);
  
  return (
    <div className={styles.container}>
      {/* Header with controls */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Timeline24Regular />
          <Text size={500} weight="semibold">Execution Dashboard</Text>
          {isExecuting && (
            <Badge appearance="tint" color="brand">
              <Spinner size="tiny" style={{ marginRight: 4 }} />
              Running
            </Badge>
          )}
        </div>
        
        <div className={styles.controls}>
          {!isExecuting ? (
            <Button
              appearance="primary"
              icon={<Play24Regular />}
              onClick={onStart}
              disabled={!onStart}
            >
              Start
            </Button>
          ) : (
            <>
              <Button
                appearance="subtle"
                icon={<Pause24Regular />}
                onClick={onPause}
                disabled={!onPause}
              >
                Pause
              </Button>
              <Button
                appearance="subtle"
                icon={<Stop24Regular />}
                onClick={onStop}
                disabled={!onStop}
              >
                Stop
              </Button>
            </>
          )}
          <Button
            appearance="subtle"
            icon={<ArrowClockwise24Regular />}
            onClick={onRestart}
            disabled={!onRestart}
          >
            Restart
          </Button>
        </div>
      </div>
      
      <div className={styles.content}>
        {/* Main Panel */}
        <div className={styles.mainPanel}>
          {/* Statistics Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total Interactions</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.completed}</span>
              <span className={styles.statLabel}>Completed</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.failed}</span>
              <span className={styles.statLabel}>Failed</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {stats.avgDurationMs ? `${Math.round(stats.avgDurationMs / 1000)}s` : '-'}
              </span>
              <span className={styles.statLabel}>Avg Duration</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <Text size={200} weight="semibold">Overall Progress</Text>
              <Text size={200}>{Math.round(progress * 100)}%</Text>
            </div>
            <ProgressBar value={progress} />
          </div>
          
          {/* Tab Navigation */}
          <TabList selectedValue={activeTab} onTabSelect={handleTabSelect}>
            <Tab value="timeline" icon={<Timeline24Regular />}>Timeline</Tab>
            <Tab value="agents" icon={<PersonCircle24Regular />}>Agents</Tab>
          </TabList>
          
          <Divider style={{ margin: `${tokens.spacingVerticalS} 0` }} />
          
          {/* Timeline View */}
          {activeTab === 'timeline' && (
            <div className={styles.timeline}>
              {workflowInteractions.length === 0 ? (
                <Text style={{ color: tokens.colorNeutralForeground3 }}>
                  No interactions yet. Start the workflow to see activity.
                </Text>
              ) : (
                workflowInteractions.map((interaction) => (
                  <div key={interaction.id} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      {getInteractionIcon(interaction.interactionType)}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <Text size={200} weight="semibold">
                          {interaction.initiatorAgentId} → {interaction.targetAgentId}
                        </Text>
                        <Badge 
                          appearance={getStatusBadgeAppearance(interaction.status)}
                          color={interaction.status === 'failed' ? 'danger' : undefined}
                        >
                          {interaction.status}
                        </Badge>
                      </div>
                      <Text size={200}>{interaction.interactionType}</Text>
                      {interaction.message && (
                        <Text size={100} style={{ color: tokens.colorNeutralForeground3, marginTop: 4 }}>
                          {interaction.message.substring(0, 100)}
                          {interaction.message.length > 100 && '...'}
                        </Text>
                      )}
                      <Text size={100} style={{ color: tokens.colorNeutralForeground4, marginTop: 4 }}>
                        <Clock24Regular style={{ fontSize: 12, marginRight: 4, verticalAlign: 'middle' }} />
                        {new Date(interaction.createdAt).toLocaleTimeString()}
                      </Text>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Agents View */}
          {activeTab === 'agents' && (
            <div className={styles.timeline}>
              {agents.length === 0 ? (
                <Text style={{ color: tokens.colorNeutralForeground3 }}>
                  No agents configured.
                </Text>
              ) : (
                agents.map((agent) => (
                  <div key={agent.agentId} className={styles.agentCard}>
                    <div 
                      className={styles.agentStatus}
                      style={{ backgroundColor: getAgentStatusColor(agent.status) }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text size={200} weight="semibold">{agent.name}</Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                          {getStatusLabel(agent.status)}
                        </Text>
                        {agent.tasksCompleted !== undefined && (
                          <Badge size="small" appearance="outline">
                            {agent.tasksCompleted} tasks
                          </Badge>
                        )}
                        {agent.successRate !== undefined && (
                          <Badge size="small" appearance="outline">
                            {Math.round(agent.successRate * 100)}% success
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Quick Stats */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Text size={300} weight="semibold">Active Agents</Text>
          </div>
          <div className={styles.sidebarContent}>
            {agents.filter(a => a.status === AgentStatus.ACTIVE || a.status === AgentStatus.BUSY).length === 0 ? (
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                No active agents
              </Text>
            ) : (
              agents
                .filter(a => a.status === AgentStatus.ACTIVE || a.status === AgentStatus.BUSY)
                .map((agent) => (
                  <div key={agent.agentId} className={styles.agentCard}>
                    <div 
                      className={styles.agentStatus}
                      style={{ backgroundColor: getAgentStatusColor(agent.status) }}
                    />
                    <div>
                      <Text size={200} weight="semibold">{agent.name}</Text>
                      <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                        {getStatusLabel(agent.status)}
                      </Text>
                    </div>
                    {agent.status === AgentStatus.BUSY && (
                      <Spinner size="tiny" style={{ marginLeft: 'auto' }} />
                    )}
                  </div>
                ))
            )}
            
            <Divider style={{ margin: `${tokens.spacingVerticalM} 0` }} />
            
            <Text size={300} weight="semibold" style={{ marginBottom: tokens.spacingVerticalS }}>
              Pending Interventions
            </Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              No pending interventions
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutionDashboard;
