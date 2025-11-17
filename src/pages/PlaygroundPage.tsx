import React, { useState, useEffect } from 'react';
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
import WorkflowLibrary from '../components/WorkflowLibrary';

const useStyles = makeStyles({
  playgroundContainer: {
    display: 'flex',
    height: '100%',
    position: 'relative',
  },
  workflowLibraryLeft: {
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke2),
    '& aside': {
      borderLeft: 'none !important',
      borderRight: '1px solid ' + tokens.colorNeutralStroke2 + ' !important',
    },
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalXL),
    ...shorthands.padding(tokens.spacingVerticalXXL, tokens.spacingHorizontalXXL),
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    position: 'relative',
    overflowY: 'auto',
  },
  pageTitle: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeHero800,
    textShadow: `0 2px 8px ${tokens.colorNeutralShadowAmbient}`,
    marginBottom: tokens.spacingVerticalL,
  },
  section: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalXL),
    backdropFilter: 'blur(60px) saturate(200%)',
    WebkitBackdropFilter: 'blur(60px) saturate(200%)',
    boxShadow: `0 0 0 0.5px ${tokens.colorNeutralStroke1}, 0 12px 48px ${tokens.colorNeutralShadowKey}, 0 4px 16px ${tokens.colorNeutralShadowAmbient}, inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.05)`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: `radial-gradient(circle at 20% 20%, ${tokens.colorBrandBackground}06 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${tokens.colorBrandBackground2}04 0%, transparent 50%)`,
      pointerEvents: 'none',
      opacity: 0.7,
    },
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalL),
    position: 'relative',
    zIndex: 2,
  },
  description: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase400,
    marginBottom: tokens.spacingVerticalM,
  },
  runButton: {
    width: 'fit-content',
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalXL),
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
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
    '&:disabled': {
      opacity: 0.6,
      transform: 'none',
      '&:hover': {
        transform: 'none',
        boxShadow: 'none',
      },
    },
  },
  consoleSection: {
    position: 'relative',
    zIndex: 1,
  },
  consoleTitle: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase500,
    marginBottom: tokens.spacingVerticalM,
    textShadow: `0 1px 3px ${tokens.colorNeutralShadowAmbient}`,
  },
  console: {
    fontFamily: tokens.fontFamilyMonospace,
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground2,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: `inset 0 2px 8px ${tokens.colorNeutralShadowAmbient}, 0 2px 8px rgba(0, 0, 0, 0.05)`,
    minHeight: '300px',
    maxHeight: '500px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase400,
    color: tokens.colorNeutralForeground1,
    position: 'relative',
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.colorBrandBackground2} transparent`,
    '&::-webkit-scrollbar': {
      width: '8px',
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
      },
    },
  },
});

interface LogPayload {
  message: string;
}

interface Workflow {
  id: number;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  viewport: any;
  created_at: string;
  updated_at: string;
}

function PlaygroundPage() {
  const styles = useStyles();
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

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
    if (!selectedWorkflow) {
      setOutput('[Frontend Error] Please select a workflow to run from the library on the left.\n');
      return;
    }

    setIsRunning(true);
    setOutput('');

    // Use the selected workflow's graph state
    const graphState = {
      nodes: selectedWorkflow.nodes,
      edges: selectedWorkflow.edges,
      viewport: selectedWorkflow.viewport,
    };

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

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setOutput(`Selected workflow: ${workflow.name}\nClick "Run Workflow" to execute this workflow.\n`);
  };

  const handlePlayWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setOutput(`Starting workflow: ${workflow.name}\n`);
    
    // Auto-run the workflow when play button is clicked
    setTimeout(async () => {
      setIsRunning(true);
      const graphState = {
        nodes: workflow.nodes,
        edges: workflow.edges,
        viewport: workflow.viewport,
      };

      try {
        await invoke('run_workflow', {
          graphStateJson: JSON.stringify(graphState),
        });
      } catch (error) {
        setOutput(prev => prev + `[Frontend Error] Failed to start workflow:\n${error}`);
        setIsRunning(false);
      }
    }, 100);
  };

  return (
    <div className={styles.playgroundContainer}>
      <div className={styles.workflowLibraryLeft}>
        <WorkflowLibrary
          onWorkflowSelect={handleWorkflowSelect}
          selectedWorkflowId={selectedWorkflow?.id || null}
          showPlayButton={true}
          onPlayWorkflow={handlePlayWorkflow}
        />
      </div>
      
      <div className={styles.content}>
        <Title1 className={styles.pageTitle}>Playground</Title1>
        
        <div className={styles.section}>
          <div className={styles.controls}>
            <Text className={styles.description}>
              {selectedWorkflow 
                ? `Selected: ${selectedWorkflow.name}. Click the button below to execute this workflow.`
                : 'Select a workflow from the library on the left, then click the button below to execute it.'
              }
            </Text>
            <Button 
              appearance="primary" 
              onClick={handleRun} 
              disabled={isRunning || !selectedWorkflow}
              className={styles.runButton}
            >
              {isRunning ? 'Running...' : (selectedWorkflow ? `Run ${selectedWorkflow.name}` : 'Select Workflow')}
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.consoleSection}>
            <Text className={styles.consoleTitle} weight="semibold">Execution Log</Text>
            <pre className={styles.console}>{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaygroundPage;