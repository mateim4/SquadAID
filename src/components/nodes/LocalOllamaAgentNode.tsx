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
    width: '360px',
    minHeight: '280px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.4)'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: '0 0 0 0.5px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
    backdropFilter: 'blur(40px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'grab',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 0 0 0.5px rgba(255, 255, 255, 1), 0 16px 64px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: '4px',
      background: `linear-gradient(90deg, ${tokens.colorPaletteGreenBackground}, ${tokens.colorPaletteTealBackground})`,
      borderRadius: `${tokens.borderRadiusLarge} ${tokens.borderRadiusLarge} 0 0`,
    },
  },
  cardHeader: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    color: tokens.colorNeutralForeground1,
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    ...shorthands.borderBottom('1px', 'solid', 'rgba(0, 0, 0, 0.05)'),
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
    border: `2px solid ${tokens.colorPaletteGreenBorder1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    '&:hover': {
      boxShadow: `0 0 0 3px ${tokens.colorPaletteGreenBorder1}40`,
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
    backgroundColor: `${tokens.colorPaletteGreenBackground}20`,
    color: tokens.colorPaletteGreenForeground1,
    ...shorthands.border('1px', 'solid', `${tokens.colorPaletteGreenBorder1}40`),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
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
      <CardHeader className={styles.cardHeader}>
        <span>🖥️</span>
        <span>Local Ollama Agent</span>
      </CardHeader>
      <div className={styles.cardContent}>
        <div className={styles.inputGroup}>
          <Label className={styles.label}>Name</Label>
          <Input
            defaultValue={name}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Local Coding Agent"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Role</Label>
          <Input
            defaultValue={role}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Local AI Assistant"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Description</Label>
          <Textarea
            defaultValue={description}
            className={`${styles.textarea} ${styles.nodrag}`}
            placeholder="Local AI agent powered by Ollama models"
            rows={2}
            resize="vertical"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Ollama Model</Label>
          <Input
            defaultValue={modelName}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., qwen2.5-coder:32b"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Ollama Endpoint</Label>
          <Input
            defaultValue={ollamaEndpoint}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., http://localhost:11434"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>System Prompt</Label>
          <Textarea
            defaultValue={systemPrompt}
            className={`${styles.textarea} ${styles.nodrag}`}
            placeholder="You are a comprehensive QA agent focused on code quality, security, and best practices..."
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

export default LocalOllamaAgentNode;