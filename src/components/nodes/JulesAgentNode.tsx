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
    width: '320px',
    ...shorthands.border('1px', 'solid', tokens.colorPaletteGreenBorder1),
  },
  cardHeader: {
    backgroundColor: tokens.colorPaletteGreenBorder2,
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
  vmSection: {
    ...shorthands.border('1px', 'solid', tokens.colorPaletteGreenBorder1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingVerticalS),
    backgroundColor: tokens.colorPaletteGreenBackground1,
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
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

  const defaultCapabilities = ["research", "web-search", "analysis", "multi-file-implementation"];

  return (
    <Card className={styles.card}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader
        className={styles.cardHeader}
        header={<b>🔍 Jules Research Agent</b>}
      />
      <div className={styles.cardContent}>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          defaultValue={name}
          className={styles.nodrag}
          placeholder="e.g., Jules Bridge Agent"
        />

        <Label htmlFor={`role-${id}`}>Role</Label>
        <Input
          id={`role-${id}`}
          defaultValue={role}
          className={styles.nodrag}
          placeholder="e.g., Research Assistant"
        />

        <Label htmlFor={`description-${id}`}>Description</Label>
        <Textarea
          id={`description-${id}`}
          defaultValue={description}
          className={styles.nodrag}
          placeholder="Google-powered research and comprehensive analysis"
          rows={2}
          resize="vertical"
        />

        <Label htmlFor={`system-prompt-${id}`}>System Prompt</Label>
        <Textarea
          id={`system-prompt-${id}`}
          defaultValue={systemPrompt}
          className={styles.nodrag}
          placeholder="You are a research agent with access to web search and comprehensive analysis capabilities..."
          rows={3}
          resize="vertical"
        />

        <div className={styles.vmSection}>
          <div className={styles.switchContainer}>
            <Switch 
              defaultChecked={secureVmEnabled}
              className={styles.nodrag}
            />
            <Label>Secure Google Cloud VM</Label>
          </div>
          
          <div className={styles.switchContainer}>
            <Switch 
              defaultChecked={multiFileCapable}
              className={styles.nodrag}
            />
            <Label>Multi-file Implementation</Label>
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

export default JulesAgentNode;