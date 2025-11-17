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
    width: '360px',
    minHeight: '280px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorPaletteRedBorder1),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {

      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: '4px',
      background: `linear-gradient(90deg, ${tokens.colorPaletteRedBackground}, ${tokens.colorPaletteOrangeBackground})`,
      borderRadius: `${tokens.borderRadiusLarge} ${tokens.borderRadiusLarge} 0 0`,
    },
  },
  cardHeader: {
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground1,
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    flex: 1,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalXS),
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground2,
  },
  input: {
    fontSize: tokens.fontSizeBase200,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    '&:focus': {
      ...shorthands.border("1px", "solid", tokens.colorBrandStroke1),
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}20`,
    },
  },
  textarea: {
    fontSize: tokens.fontSizeBase200,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    fontFamily: 'ui-monospace, "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
    '&:focus': {
      ...shorthands.border("1px", "solid", tokens.colorBrandStroke1),
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}20`,
    },
  },
  dropdown: {
    fontSize: tokens.fontSizeBase200,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    '&:focus': {
      ...shorthands.border("1px", "solid", tokens.colorBrandStroke1),
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}20`,
    },
  },
  slider: {
    marginTop: tokens.spacingVerticalS,
  },
  nodrag: {
    pointerEvents: 'all',
    userSelect: 'text',
  },
  handle: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: `2px solid ${tokens.colorPaletteRedBorder1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    '&:hover': {
      
      boxShadow: `0 0 0 3px ${tokens.colorPaletteRedBorder1}40`,
    },
  },
  capabilityChips: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap(tokens.spacingHorizontalXS),
    marginTop: tokens.spacingVerticalXS,
  },
  chip: {
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightMedium,
    ...shorthands.padding(tokens.spacingVerticalXXS, tokens.spacingHorizontalS),
    backgroundColor: `${tokens.colorPaletteRedBackground}20`,
    color: tokens.colorPaletteRedForeground1,
    ...shorthands.border('1px', 'solid', `${tokens.colorPaletteRedBorder1}40`),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  toolsSection: {
    ...shorthands.border('1px', 'solid', tokens.colorPaletteRedBorder1),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    backgroundColor: `${tokens.colorPaletteRedBackground1}10`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
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
      <CardHeader className={styles.cardHeader}>
        <span>🔧</span>
        <span>Custom Agent</span>
      </CardHeader>
      <div className={styles.cardContent}>
        <div className={styles.inputGroup}>
          <Label className={styles.label}>Name</Label>
          <Input
            defaultValue={name}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Custom Processing Agent"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Role</Label>
          <Input
            defaultValue={role}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Specialist Agent"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Description</Label>
          <Textarea
            defaultValue={description}
            className={`${styles.textarea} ${styles.nodrag}`}
            placeholder="Custom agent with configurable capabilities and tools"
            rows={2}
            resize="vertical"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Workflow Type</Label>
          <Dropdown
            defaultValue={workflow}
            className={`${styles.dropdown} ${styles.nodrag}`}
            size="small"
          >
            <Option value="sequential">Sequential</Option>
            <Option value="round_robin">Round Robin</Option>
            <Option value="hierarchical">Hierarchical</Option>
            <Option value="graph">Graph</Option>
            <Option value="custom">Custom</Option>
          </Dropdown>
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>System Prompt</Label>
          <Textarea
            defaultValue={systemPrompt}
            className={`${styles.textarea} ${styles.nodrag}`}
            placeholder="Define your custom agent's behavior and responsibilities..."
            rows={3}
            resize="vertical"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Temperature: {temperature?.toFixed(1) || '0.7'}</Label>
          <Slider
            defaultValue={temperature || 0.7}
            min={0}
            max={1}
            step={0.1}
            className={`${styles.slider} ${styles.nodrag}`}
            size="small"
          />
        </div>

        <div className={styles.toolsSection}>
          <div className={styles.inputGroup}>
            <Label className={styles.label}>Available Tools</Label>
            <div className={styles.capabilityChips}>
              {(tools || defaultTools).map((tool) => (
                <span key={tool} className={styles.chip}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Capabilities</Label>
          <div className={styles.capabilityChips}>
            {(capabilities || defaultCapabilities).map((capability) => (
              <span key={capability} className={styles.chip}>
                {capability}
              </span>
            ))}
          </div>
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