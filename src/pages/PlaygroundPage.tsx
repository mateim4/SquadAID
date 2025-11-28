import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Event, listen } from '@tauri-apps/api/event';
import { isTauri } from '@/services/platform';
import {
  Title1,
  Button,
  makeStyles,
  shorthands,
  tokens,
  Text,
  TabList,
  Tab,
  SelectTabEvent,
  SelectTabData,
} from '@fluentui/react-components';
import { PlayIcon, CodeIcon, TimelineIcon } from '@/components/icons';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useWorkflowStore } from '@/store/workflowStore';
import { useInteractionStore } from '@/store/interactionStore';
import { agents } from '@/data/agents';
import ExecutionDashboard from '@/components/canvas/ExecutionDashboard';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...shorthands.overflow('hidden'),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalM),
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.overflow('hidden'),
  },
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.overflow('auto'),
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    maxWidth: '600px',
  },
  console: {
    fontFamily: tokens.fontFamilyMonospace,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    minHeight: '300px',
    maxHeight: '500px',
    whiteSpace: 'pre-wrap',
    ...shorthands.overflow('auto'),
    flex: 1,
  },
  consoleSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    flex: 1,
  },
});

interface LogPayload {
  message: string;
}

function PlaygroundPage() {
  const styles = useStyles();
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [workflowId] = useState<string>(() => `workflow-${Date.now()}`);
  
  // Interaction store for clearing on restart
  const clearWorkflowInteractions = useInteractionStore(s => s.clearWorkflowInteractions);

  useEffect(() => {
    if (!isTauri()) return;
    const unlistenLogs = listen<LogPayload>('execution-log', (event: Event<LogPayload>) => {
      setOutput((prev) => `${prev}${event.payload.message}\n`);
    });
    const unlistenFinished = listen('execution-finished', () => {
      setIsRunning(false);
    });
    return () => {
      Promise.all([unlistenLogs, unlistenFinished]).then(([ul, uf]) => {
        ul();
        uf();
      });
    };
  }, []);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput('');

    // Pull current graph from the active workflow store (canvas)
    const { nodes, edges } = useWorkflowStore.getState();
    const defaultViewport = { x: 0, y: 0, zoom: 1 };

    // Map nodes to backend types expected by the executor
    const graphState = {
      nodes: nodes.map((n) => {
        const agentId = (n.data as any)?.agentId as string | undefined;
        const agent = agents.find((a) => a.id === agentId);
        const type = agent?.backendType || agentId || n.type;
        return {
          id: n.id,
          type,
          data: n.data,
          position: n.position,
        };
      }),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: (e as any).sourceHandle,
        targetHandle: (e as any).targetHandle,
      })),
      viewport: defaultViewport,
    };

    if (isTauri()) {
      try {
        await invoke('run_workflow', { graphStateJson: JSON.stringify(graphState) });
      } catch (error) {
        setOutput(`[Frontend Error] Failed to start workflow:\n${error}`);
        setIsRunning(false);
      }
    } else {
      setOutput('[Web preview] Tauri runtime not available; skipping native run.');
      setIsRunning(false);
    }
  }, []);

  const handlePause = useCallback(() => {
    // TODO: Implement pause via Tauri command
    setOutput((prev) => `${prev}\n[Paused execution]\n`);
  }, []);

  const handleStop = useCallback(async () => {
    if (isTauri()) {
      try {
        await invoke('stop_workflow');
      } catch (error) {
        setOutput((prev) => `${prev}\n[Error stopping]: ${error}\n`);
      }
    }
    setIsRunning(false);
    setOutput((prev) => `${prev}\n[Stopped]\n`);
  }, []);

  const handleRestart = useCallback(() => {
    // Clear previous interactions
    clearWorkflowInteractions(workflowId);
    setOutput('');
    handleRun();
  }, [workflowId, clearWorkflowInteractions, handleRun]);

  const handleTabSelect = useCallback((_: SelectTabEvent, data: SelectTabData) => {
    setActiveTab(data.value as string);
  }, []);
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Title1>Playground</Title1>
          <TabList
            selectedValue={activeTab}
            onTabSelect={handleTabSelect}
            size="small"
          >
            <Tab value="dashboard" icon={<TimelineIcon />}>
              Dashboard
            </Tab>
            <Tab value="console" icon={<CodeIcon />}>
              Console
            </Tab>
          </TabList>
        </div>
        <PrimaryButton 
          onClick={handleRun} 
          disabled={isRunning}
          icon={<PlayIcon />}
        >
          {isRunning ? 'Running...' : 'Run Workflow'}
        </PrimaryButton>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'dashboard' && (
          <ExecutionDashboard
            workflowId={workflowId}
            isExecuting={isRunning}
            onStart={handleRun}
            onPause={handlePause}
            onStop={handleStop}
            onRestart={handleRestart}
          />
        )}

        {activeTab === 'console' && (
          <div className={styles.consoleSection}>
            <div className={styles.controls}>
              <Text>
                Raw execution log from the Rust backend. Switch to Dashboard 
                for a visual overview of agent interactions.
              </Text>
            </div>
            <Text weight="semibold">Execution Log</Text>
            <pre className={styles.console}>
              {output || 'No output yet. Run a workflow to see logs here.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaygroundPage;