import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Event, listen } from '@tauri-apps/api/event';
import {
  Title1,
  Button,
  makeStyles,
  shorthands,
  tokens,
  Text,
} from '@fluentui/react-components';
import useFlowStore from '../store/flow';

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
    // Listener for log messages
    const unlistenLogs = listen<LogPayload>('execution-log', (event: Event<LogPayload>) => {
      setOutput((prev) => `${prev}${event.payload.message}\n`);
    });

    // Listener for the completion signal
    const unlistenFinished = listen('execution-finished', () => {
      setIsRunning(false);
    });

    // Cleanup function to unsubscribe from both listeners
    return () => {
      Promise.all([unlistenLogs, unlistenFinished]).then(([ul, uf]) => {
        ul();
        uf();
      });
    };
  }, []); // Empty array ensures this runs only on mount/unmount

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');

    const { nodes, edges, viewport } = useFlowStore.getState();
    const graphState = { nodes, edges, viewport };

    try {
      await invoke('run_workflow', {
        graphStateJson: JSON.stringify(graphState),
      });
    } catch (error) {
      // If the command fails to start, log the error and stop running.
      setOutput(`[Frontend Error] Failed to start workflow:\n${error}`);
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
        <Button appearance="primary" onClick={handleRun} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run Workflow'}
        </Button>
      </div>
      <div>
        <Text weight="semibold">Execution Log</Text>
        <pre className={styles.console}>{output}</pre>
      </div>
    </div>
  );
}

export default PlaygroundPage;