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
  Dropdown,
  Option,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    width: '320px',
    ...shorthands.border('1px', 'solid', tokens.colorPaletteRedBorder1),
  },
  cardHeader: {
    backgroundColor: tokens.colorPaletteRedBorder2,
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
  toolsSection: {
    ...shorthands.border('1px', 'solid', tokens.colorPaletteRedBorder1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingVerticalS),
    backgroundColor: tokens.colorPaletteRedBackground1,
  },
});

interface CustomAgentNodeData {
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  capabilities: string[];
  tools: string[];
  workflow: string;
}

const CustomAgentNode = memo(({ id, data }: NodeProps<CustomAgentNodeData>) => {
  const styles = useStyles();

  const { 
    name, 
    role, 
    description, 
    systemPrompt, 
    temperature,
    capabilities,
    tools,
    workflow
  } = data;

  const defaultCapabilities = ["custom-logic", "flexible-processing"];
  const defaultTools = ["create_file", "read_file", "execute_bash", "list_directory"];

  return (
    <Card className={styles.card}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader
        className={styles.cardHeader}
        header={<b>🔧 Custom Agent</b>}
      />
      <div className={styles.cardContent}>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          defaultValue={name}
          className={styles.nodrag}
          placeholder="e.g., Custom Processing Agent"
        />

        <Label htmlFor={`role-${id}`}>Role</Label>
        <Input
          id={`role-${id}`}
          defaultValue={role}
          className={styles.nodrag}
          placeholder="e.g., Specialist Agent"
        />

        <Label htmlFor={`description-${id}`}>Description</Label>
        <Textarea
          id={`description-${id}`}
          defaultValue={description}
          className={styles.nodrag}
          placeholder="Custom agent with configurable capabilities and tools"
          rows={2}
          resize="vertical"
        />

        <Label htmlFor={`workflow-${id}`}>Workflow Type</Label>
        <Dropdown
          id={`workflow-${id}`}
          defaultValue={workflow}
          className={styles.nodrag}
        >
          <Option value="sequential">Sequential</Option>
          <Option value="round_robin">Round Robin</Option>
          <Option value="hierarchical">Hierarchical</Option>
          <Option value="graph">Graph</Option>
          <Option value="custom">Custom</Option>
        </Dropdown>

        <Label htmlFor={`system-prompt-${id}`}>System Prompt</Label>
        <Textarea
          id={`system-prompt-${id}`}
          defaultValue={systemPrompt}
          className={styles.nodrag}
          placeholder="Define your custom agent's behavior and responsibilities..."
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

        <div className={styles.toolsSection}>
          <Label>Available Tools</Label>
          <div className={styles.capabilityChips}>
            {(tools || defaultTools).map((tool) => (
              <span key={tool} className={styles.chip}>
                {tool}
              </span>
            ))}
          </div>
        </div>

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

export default CustomAgentNode;