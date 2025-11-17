import { useState, useEffect } from 'react';
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
} from '@fluentui/react-components';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useWorkflowStore } from '@/store/workflowStore';
import { agents } from '@/data/agents';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalL),
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    maxWidth: '400px',
  },
  console: {
    fontFamily: tokens.fontFamilyMonospace,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    minHeight: '200px',
    whiteSpace: 'pre-wrap',
  },
});

interface LogPayload {
  message: string;
}

function PlaygroundPage() {
  const styles = useStyles();
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);

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

  const handleRun = async () => {
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
    // The `finally` block with setTimeout has been removed.
  };

  return (
    <div className={styles.container}>
      <Title1>Playground</Title1>
      <div className={styles.controls}>
        <Text>
          Click the button below to send the current workflow to the Rust backend
          for real-time execution.
        </Text>
            <PrimaryButton onClick={handleRun} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Run Workflow'}
            </PrimaryButton>
      </div>
      <div>
        <Text weight="semibold">Execution Log</Text>
        <pre className={styles.console}>{output}</pre>
      </div>
    </div>
  );
}

export default PlaygroundPage;