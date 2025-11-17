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
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: `0 0 0 0.5px ${tokens.colorNeutralStroke1}, 0 12px 48px ${tokens.colorNeutralShadowKey}, 0 4px 16px ${tokens.colorNeutralShadowAmbient}, inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.08)`,
    backdropFilter: 'blur(60px) saturate(200%)',
    WebkitBackdropFilter: 'blur(60px) saturate(200%)',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'grab',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: `radial-gradient(circle at 20% 20%, ${tokens.colorBrandBackground}08 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${tokens.colorBrandBackground2}06 0%, transparent 50%)`,
      pointerEvents: 'none',
      opacity: 0.6,
      zIndex: -1,
    },
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
      boxShadow: `0 0 0 0.5px ${tokens.colorBrandStroke1}, 0 20px 80px ${tokens.colorBrandShadowKey}, 0 8px 32px ${tokens.colorBrandShadowAmbient}, inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1)`,
      backdropFilter: 'blur(80px) saturate(220%)',
      WebkitBackdropFilter: 'blur(80px) saturate(220%)',
      '&::after': {
        opacity: 0.8,
        background: `radial-gradient(circle at 20% 20%, ${tokens.colorBrandBackground}12 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${tokens.colorBrandBackground2}10 0%, transparent 50%)`,
      },
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: '4px',
      background: `linear-gradient(90deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
      borderRadius: `${tokens.borderRadiusLarge} ${tokens.borderRadiusLarge} 0 0`,
      pointerEvents: 'none',
      zIndex: 2,
    },
  },
  cardHeader: {
    background: `linear-gradient(135deg, ${tokens.colorNeutralBackground3} 0%, ${tokens.colorNeutralBackground2} 100%)`,
    color: tokens.colorNeutralForeground1,
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    position: 'relative',
    zIndex: 3,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    flex: 1,
    position: 'relative',
    zIndex: 3,
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
    backgroundColor: tokens.colorNeutralBackground2,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:focus': {
      ...shorthands.border("1px", "solid", tokens.colorBrandStroke1),
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}20`,
      backgroundColor: tokens.colorNeutralBackground1,
    },
    '&:focus-visible': {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '2px',
    },
  },
  textarea: {
    fontSize: tokens.fontSizeBase200,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    fontFamily: 'ui-monospace, "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
    backgroundColor: tokens.colorNeutralBackground2,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:focus': {
      ...shorthands.border("1px", "solid", tokens.colorBrandStroke1),
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}20`,
      backgroundColor: tokens.colorNeutralBackground1,
    },
    '&:focus-visible': {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '2px',
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
    border: `2px solid ${tokens.colorPalettePurpleBorder1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    '&:hover': {
      boxShadow: `0 0 0 3px ${tokens.colorPalettePurpleBorder1}40`,
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
    backgroundColor: `${tokens.colorPalettePurpleBackground}20`,
    color: tokens.colorPalettePurpleForeground1,
    ...shorthands.border('1px', 'solid', `${tokens.colorPalettePurpleBorder1}40`),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
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
      <CardHeader className={styles.cardHeader}>
        <span>🧠</span>
        <span>Claude Agent</span>
      </CardHeader>
      <div className={styles.cardContent}>
        <div className={styles.inputGroup}>
          <Label className={styles.label}>Name</Label>
          <Input
            defaultValue={name}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Claude Assistant"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Role</Label>
          <Input
            defaultValue={role}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Assistant"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Description</Label>
          <Textarea
            defaultValue={description}
            className={`${styles.textarea} ${styles.nodrag}`}
            placeholder="Advanced reasoning and code generation"
            rows={2}
            resize="vertical"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>System Prompt</Label>
          <Textarea
            defaultValue={systemPrompt}
            className={`${styles.textarea} ${styles.nodrag}`}
            placeholder="You are a helpful AI assistant with advanced reasoning capabilities..."
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

export default ClaudeAgentNode;