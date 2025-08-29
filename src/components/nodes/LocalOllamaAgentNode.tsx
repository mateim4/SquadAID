import React, { memo } from 'react';
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
  Slider,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    width: '320px',
    ...shorthands.border('1px', 'solid', tokens.colorPaletteBlueBorder1),
  },
  cardHeader: {
    backgroundColor: tokens.colorPaletteBlueBorder2,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalM),
  },
  nodrag: {
    pointerEvents: 'all',
  },
  handle: {
    width: '10px',
    height: '10px',
  },
  capabilityChips: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap(tokens.spacingHorizontalXS),
  },
  chip: {
    fontSize: '12px',
    ...shorthands.padding('2px', '6px'),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
  },
  qualitySection: {
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingVerticalS),
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

interface LocalOllamaAgentNodeData {
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  capabilities: string[];
  modelName: string;
  ollamaEndpoint: string;
}

const LocalOllamaAgentNode = memo(({ id, data }: NodeProps<LocalOllamaAgentNodeData>) => {
  const styles = useStyles();

  const { 
    name, 
    role, 
    description, 
    systemPrompt, 
    temperature,
    capabilities,
    modelName,
    ollamaEndpoint
  } = data;

  const defaultCapabilities = ["local-ai", "offline-processing", "privacy-focused", "customizable"];

  return (
    <Card className={styles.card}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader
        className={styles.cardHeader}
        header={<b>🖥️ Local Ollama Agent</b>}
      />
      <div className={styles.cardContent}>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          defaultValue={name}
          className={styles.nodrag}
          placeholder="e.g., Local Coding Agent"
        />

        <Label htmlFor={`role-${id}`}>Role</Label>
        <Input
          id={`role-${id}`}
          defaultValue={role}
          className={styles.nodrag}
          placeholder="e.g., Local AI Assistant"
        />

        <Label htmlFor={`description-${id}`}>Description</Label>
        <Textarea
          id={`description-${id}`}
          defaultValue={description}
          className={styles.nodrag}
          placeholder="Local AI agent powered by Ollama models"
          rows={2}
          resize="vertical"
        />

        <Label htmlFor={`model-name-${id}`}>Ollama Model</Label>
        <Input
          id={`model-name-${id}`}
          defaultValue={modelName}
          className={styles.nodrag}
          placeholder="e.g., qwen2.5-coder:32b"
        />

        <Label htmlFor={`ollama-endpoint-${id}`}>Ollama Endpoint</Label>
        <Input
          id={`ollama-endpoint-${id}`}
          defaultValue={ollamaEndpoint}
          className={styles.nodrag}
          placeholder="e.g., http://localhost:11434"
        />

        <Label htmlFor={`system-prompt-${id}`}>System Prompt</Label>
        <Textarea
          id={`system-prompt-${id}`}
          defaultValue={systemPrompt}
          className={styles.nodrag}
          placeholder="You are a comprehensive QA agent focused on code quality, security, and best practices..."
          rows={3}
          resize="vertical"
        />

        <Label htmlFor={`temperature-${id}`}>Temperature: {temperature}</Label>
        <Slider
          id={`temperature-${id}`}
          defaultValue={temperature}
          min={0}
          max={1}
          step={0.1}
          className={styles.nodrag}
        />

        <Label>Capabilities</Label>
        <div className={styles.capabilityChips}>
          {(capabilities || defaultCapabilities).map((capability) => (
            <span key={capability} className={styles.chip}>
              {capability}
            </span>
          ))}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handle}
      />
    </Card>
  );
});

export default LocalOllamaAgentNode;