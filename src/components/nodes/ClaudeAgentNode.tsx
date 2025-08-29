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
    ...shorthands.border('1px', 'solid', tokens.colorPaletteOrangeBorder1),
  },
  cardHeader: {
    backgroundColor: tokens.colorPaletteOrangeBorder2,
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
});

interface ClaudeAgentNodeData {
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  capabilities: string[];
}

const ClaudeAgentNode = memo(({ id, data }: NodeProps<ClaudeAgentNodeData>) => {
  const styles = useStyles();

  const { 
    name, 
    role, 
    description, 
    systemPrompt, 
    temperature,
    capabilities 
  } = data;

  const defaultCapabilities = ["reasoning", "coding", "analysis", "writing"];

  return (
    <Card className={styles.card}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader
        className={styles.cardHeader}
        header={<b>🧠 Claude Agent</b>}
      />
      <div className={styles.cardContent}>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          defaultValue={name}
          className={styles.nodrag}
          placeholder="e.g., Claude Assistant"
        />

        <Label htmlFor={`role-${id}`}>Role</Label>
        <Input
          id={`role-${id}`}
          defaultValue={role}
          className={styles.nodrag}
          placeholder="e.g., Assistant"
        />

        <Label htmlFor={`description-${id}`}>Description</Label>
        <Textarea
          id={`description-${id}`}
          defaultValue={description}
          className={styles.nodrag}
          placeholder="Advanced reasoning and code generation"
          rows={2}
          resize="vertical"
        />

        <Label htmlFor={`system-prompt-${id}`}>System Prompt</Label>
        <Textarea
          id={`system-prompt-${id}`}
          defaultValue={systemPrompt}
          className={styles.nodrag}
          placeholder="You are a helpful AI assistant with advanced reasoning capabilities..."
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

export default ClaudeAgentNode;