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
  Switch,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    width: '320px',
    ...shorthands.border('1px', 'solid', tokens.colorPaletteTealBorder1),
  },
  cardHeader: {
    backgroundColor: tokens.colorPaletteTealBorder2,
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
  mstySection: {
    ...shorthands.border('1px', 'solid', tokens.colorPaletteTealBorder1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingVerticalS),
    backgroundColor: tokens.colorPaletteTealBackground1,
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
});

interface LocalMSTYAgentNodeData {
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  capabilities: string[];
  mstyEndpoint: string;
  modelName: string;
  contextLength: number;
  streamingEnabled: boolean;
}

const LocalMSTYAgentNode = memo(({ id, data }: NodeProps<LocalMSTYAgentNodeData>) => {
  const styles = useStyles();

  const { 
    name, 
    role, 
    description, 
    systemPrompt, 
    temperature,
    capabilities,
    mstyEndpoint,
    modelName,
    contextLength,
    streamingEnabled
  } = data;

  const defaultCapabilities = ["local-inference", "high-performance", "long-context", "streaming"];

  return (
    <Card className={styles.card}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader
        className={styles.cardHeader}
        header={<b>⚡ Local MSTY Agent</b>}
      />
      <div className={styles.cardContent}>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          defaultValue={name}
          className={styles.nodrag}
          placeholder="e.g., Local MSTY Assistant"
        />

        <Label htmlFor={`role-${id}`}>Role</Label>
        <Input
          id={`role-${id}`}
          defaultValue={role}
          className={styles.nodrag}
          placeholder="e.g., High-Performance Local AI"
        />

        <Label htmlFor={`description-${id}`}>Description</Label>
        <Textarea
          id={`description-${id}`}
          defaultValue={description}
          className={styles.nodrag}
          placeholder="High-performance local AI agent powered by MSTY"
          rows={2}
          resize="vertical"
        />

        <div className={styles.mstySection}>
          <Label htmlFor={`msty-endpoint-${id}`}>MSTY Endpoint</Label>
          <Input
            id={`msty-endpoint-${id}`}
            defaultValue={mstyEndpoint}
            className={styles.nodrag}
            placeholder="e.g., http://localhost:10000"
          />

          <Label htmlFor={`model-name-${id}`}>Model Name</Label>
          <Input
            id={`model-name-${id}`}
            defaultValue={modelName}
            className={styles.nodrag}
            placeholder="e.g., llama-3.1-70b"
          />

          <Label htmlFor={`context-length-${id}`}>Context Length: {contextLength}k</Label>
          <Slider
            id={`context-length-${id}`}
            defaultValue={contextLength}
            min={4}
            max={128}
            step={4}
            className={styles.nodrag}
          />

          <div className={styles.switchContainer}>
            <Switch 
              defaultChecked={streamingEnabled}
              className={styles.nodrag}
            />
            <Label>Streaming Response</Label>
          </div>
        </div>

        <Label htmlFor={`system-prompt-${id}`}>System Prompt</Label>
        <Textarea
          id={`system-prompt-${id}`}
          defaultValue={systemPrompt}
          className={styles.nodrag}
          placeholder="You are a high-performance local AI assistant with access to long context..."
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

export default LocalMSTYAgentNode;