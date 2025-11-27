import { memo, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import {
  Card,
  Textarea,
  makeStyles,
  shorthands,
  tokens,
  Button,
  Text,
  Spinner,
} from '@fluentui/react-components';
import { useWorkflowStore } from '@/store/workflowStore';
import { Play24Regular } from '@fluentui/react-icons';
import { runGeminiPrompt } from '@/services/geminiBridge';

const useStyles = makeStyles({
  card: {
    width: '320px',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorNeutralForeground1,
    ...shorthands.padding('8px'),
    fontWeight: 'bold',
  },
  body: {
    ...shorthands.padding('10px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  output: {
    marginTop: '10px',
    padding: '8px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    maxHeight: '200px',
    overflowY: 'auto',
    fontSize: '12px',
    fontFamily: 'monospace',
  }
});

const GeminiAgentNode = ({ id, data }: NodeProps) => {
  const styles = useStyles();
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const [prompt, setPrompt] = useState(data?.prompt || '');
  const [output, setOutput] = useState(data?.output || '');
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await runGeminiPrompt(prompt);
      setOutput(result);
      updateNodeData(id, { prompt, output: result });
    } catch (error: any) {
      setOutput(`Error: ${error.message || String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.card}>
      <Handle type="target" position={Position.Top} />
      <div className={styles.header}>Gemini CLI Agent</div>
      <div className={styles.body}>
        <Textarea
          placeholder="Enter prompt for Gemini..."
          value={prompt}
          onChange={(_e, d) => {
            setPrompt(d.value);
            updateNodeData(id, { prompt: d.value });
          }}
          rows={3}
        />
        <Button 
          appearance="primary" 
          icon={loading ? <Spinner size="tiny" /> : <Play24Regular />}
          onClick={handleRun}
          disabled={loading || !prompt.trim()}
        >
          Run
        </Button>
        {output && (
          <div className={styles.output}>
            <Text>{output}</Text>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};

export default memo(GeminiAgentNode);
