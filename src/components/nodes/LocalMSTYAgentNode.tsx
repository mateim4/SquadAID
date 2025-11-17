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
    width: '360px',
    minHeight: '280px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorPaletteTealBorder1),
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
      background: `linear-gradient(90deg, ${tokens.colorPaletteTealBackground}, ${tokens.colorPaletteGreenBackground})`,
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
    border: `2px solid ${tokens.colorPaletteTealBorder1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    '&:hover': {
      
      boxShadow: `0 0 0 3px ${tokens.colorPaletteTealBorder1}40`,
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
    backgroundColor: `${tokens.colorPaletteTealBackground}20`,
    color: tokens.colorPaletteTealForeground1,
    ...shorthands.border('1px', 'solid', `${tokens.colorPaletteTealBorder1}40`),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  mstySection: {
    ...shorthands.border('1px', 'solid', tokens.colorPaletteTealBorder1),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    backgroundColor: `${tokens.colorPaletteTealBackground1}10`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    marginTop: tokens.spacingVerticalS,
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
      <CardHeader className={styles.cardHeader}>
        <span>⚡</span>
        <span>Local MSTY Agent</span>
      </CardHeader>
      <div className={styles.cardContent}>
        <div className={styles.inputGroup}>
          <Label className={styles.label}>Name</Label>
          <Input
            defaultValue={name}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Local MSTY Assistant"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Role</Label>
          <Input
            defaultValue={role}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., High-Performance Local AI"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Description</Label>
          <Textarea
            defaultValue={description}
            className={`${styles.textarea} ${styles.nodrag}`}
            placeholder="High-performance local AI agent powered by MSTY"
            rows={2}
            resize="vertical"
            size="small"
          />
        </div>

        <div className={styles.mstySection}>
          <div className={styles.inputGroup}>
            <Label className={styles.label}>MSTY Endpoint</Label>
            <Input
              defaultValue={mstyEndpoint}
              className={`${styles.input} ${styles.nodrag}`}
              placeholder="e.g., http://localhost:10000"
              size="small"
            />
          </div>

          <div className={styles.inputGroup}>
            <Label className={styles.label}>Model Name</Label>
            <Input
              defaultValue={modelName}
              className={`${styles.input} ${styles.nodrag}`}
              placeholder="e.g., llama-3.1-70b"
              size="small"
            />
          </div>

          <div className={styles.inputGroup}>
            <Label className={styles.label}>Context Length: {contextLength?.toFixed(0) || '32'}k</Label>
            <Slider
              defaultValue={contextLength || 32}
              min={4}
              max={128}
              step={4}
              className={`${styles.slider} ${styles.nodrag}`}
              size="small"
            />
          </div>

          <div className={styles.switchContainer}>
            <Switch 
              defaultChecked={streamingEnabled}
              className={styles.nodrag}
              size="small"
            />
            <Label className={styles.label}>Streaming Response</Label>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>System Prompt</Label>
          <Textarea
            defaultValue={systemPrompt}
            className={`${styles.textarea} ${styles.nodrag}`}
            placeholder="You are a high-performance local AI assistant with access to long context..."
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

export default LocalMSTYAgentNode;