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
  Switch,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    width: '360px',
    minHeight: '280px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorPaletteGreenBorder1),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: '4px',
      background: `linear-gradient(90deg, ${tokens.colorPaletteGreenBackground}, ${tokens.colorPaletteLightGreenBackground})`,
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
  vmSection: {
    ...shorthands.border('1px', 'solid', tokens.colorPaletteGreenBorder1),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    backgroundColor: `${tokens.colorPaletteGreenBackground1}10`,
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

interface JulesAgentNodeData {
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  secureVmEnabled: boolean;
  multiFileCapable: boolean;
}

const JulesAgentNode = memo(({ id, data }: NodeProps<JulesAgentNodeData>) => {
  const styles = useStyles();

  const { 
    name, 
    role, 
    description, 
    systemPrompt, 
    capabilities,
    secureVmEnabled,
    multiFileCapable
  } = data;

  const defaultCapabilities = ["async-coding", "multi-file-implementation", "comprehensive-solutions", "github-integration"];

  return (
    <Card className={styles.card}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader className={styles.cardHeader}>
        <span>🔍</span>
        <span>Jules Coding Agent</span>
      </CardHeader>
      <div className={styles.cardContent}>
        <div className={styles.inputGroup}>
          <Label className={styles.label}>Name</Label>
          <Input
            defaultValue={name}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Jules Coding Agent"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Role</Label>
          <Input
            defaultValue={role}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Async Coding Assistant"
            size="small"
          />
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>Description</Label>
          <Textarea
            defaultValue={description}
            className={`${styles.textarea} ${styles.nodrag}`}
            placeholder="Google-powered async coding agent with comprehensive implementation capabilities"
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
            placeholder="You are an async coding agent that can implement comprehensive multi-file solutions..."
            rows={3}
            resize="vertical"
            size="small"
          />
        </div>

        <div className={styles.vmSection}>
          <div className={styles.switchContainer}>
            <Switch 
              defaultChecked={secureVmEnabled}
              className={styles.nodrag}
              size="small"
            />
            <Label className={styles.label}>Secure Google Cloud VM</Label>
          </div>
          
          <div className={styles.switchContainer}>
            <Switch 
              defaultChecked={multiFileCapable}
              className={styles.nodrag}
              size="small"
            />
            <Label className={styles.label}>Multi-file Implementation</Label>
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

export default JulesAgentNode;