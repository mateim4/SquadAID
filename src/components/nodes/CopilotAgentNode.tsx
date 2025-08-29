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
    ...shorthands.border('1px', 'solid', tokens.colorPalettePurpleBorder1),
  },
  cardHeader: {
    backgroundColor: tokens.colorPalettePurpleBorder2,
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
  githubSection: {
    ...shorthands.border('1px', 'solid', tokens.colorPalettePurpleBorder1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingVerticalS),
    backgroundColor: tokens.colorPalettePurpleBackground1,
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
});

interface CopilotAgentNodeData {
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  githubIntegration: boolean;
  autoAssignment: boolean;
  prAnalysis: boolean;
}

const CopilotAgentNode = memo(({ id, data }: NodeProps<CopilotAgentNodeData>) => {
  const styles = useStyles();

  const { 
    name, 
    role, 
    description, 
    systemPrompt, 
    capabilities,
    githubIntegration,
    autoAssignment,
    prAnalysis
  } = data;

  const defaultCapabilities = ["coding", "github-integration", "code-completion", "pr-creation"];

  return (
    <Card className={styles.card}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader
        className={styles.cardHeader}
        header={<b>🚀 GitHub Copilot Agent</b>}
      />
      <div className={styles.cardContent}>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          defaultValue={name}
          className={styles.nodrag}
          placeholder="e.g., Copilot Bridge Agent"
        />

        <Label htmlFor={`role-${id}`}>Role</Label>
        <Input
          id={`role-${id}`}
          defaultValue={role}
          className={styles.nodrag}
          placeholder="e.g., Code Assistant"
        />

        <Label htmlFor={`description-${id}`}>Description</Label>
        <Textarea
          id={`description-${id}`}
          defaultValue={description}
          className={styles.nodrag}
          placeholder="GitHub-integrated coding assistant with PR management"
          rows={2}
          resize="vertical"
        />

        <Label htmlFor={`system-prompt-${id}`}>System Prompt</Label>
        <Textarea
          id={`system-prompt-${id}`}
          defaultValue={systemPrompt}
          className={styles.nodrag}
          placeholder="You are a GitHub Copilot integration agent responsible for code completion and PR management..."
          rows={3}
          resize="vertical"
        />

        <div className={styles.githubSection}>
          <div className={styles.switchContainer}>
            <Switch 
              defaultChecked={githubIntegration}
              className={styles.nodrag}
            />
            <Label>GitHub Integration</Label>
          </div>
          
          <div className={styles.switchContainer}>
            <Switch 
              defaultChecked={autoAssignment}
              className={styles.nodrag}
            />
            <Label>Auto Task Assignment</Label>
          </div>

          <div className={styles.switchContainer}>
            <Switch 
              defaultChecked={prAnalysis}
              className={styles.nodrag}
            />
            <Label>PR Result Analysis</Label>
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

export default CopilotAgentNode;