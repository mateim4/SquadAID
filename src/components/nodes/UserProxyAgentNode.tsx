import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import {
  Card,
  CardHeader,
  Input,
  Text,
  makeStyles,
  shorthands,
  tokens,
  Label,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    width: '320px',
    minHeight: '200px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
      background: `linear-gradient(90deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
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
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase300,
    fontStyle: 'italic',
  },
  nodrag: {
    pointerEvents: 'all',
    userSelect: 'text',
  },
  handle: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: `2px solid ${tokens.colorBrandBorder1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    '&:hover': {
      boxShadow: `0 0 0 3px ${tokens.colorBrandBorder1}40`,
    },
  },
});

/**
 * @interface UserProxyAgentNodeData
 * @description Defines the shape of the data object for a UserProxyAgentNode.
 */
interface UserProxyAgentNodeData {
  name: string;
}

/**
 * The UserProxyAgentNode component.
 *
 * @param {NodeProps<UserProxyAgentNodeData>} props - The props provided by React Flow.
 * @returns {JSX.Element} A custom node component for representing a User Proxy Agent.
 *
 * @description This component renders the UI for a "User Proxy Agent". This agent
 * represents the human user in the workflow. Architecturally, it serves as a terminal
 * node in a graph, meaning it can only receive input. Therefore, it exclusively
 * features a 'target' handle and has no 'source' handle.
 */
const UserProxyAgentNode = memo(({ id, data }: NodeProps<UserProxyAgentNodeData>) => {
  const styles = useStyles();
  const { name } = data;

  return (
    <Card className={styles.card}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader className={styles.cardHeader}>
        <span>👤</span>
        <span>User Proxy Agent</span>
      </CardHeader>
      <div className={styles.cardContent}>
        <div className={styles.description}>
          A proxy agent for the user. This node is the final recipient of the conversation.
        </div>
        
        <div className={styles.inputGroup}>
          <Label className={styles.label}>Name</Label>
          <Input
            defaultValue={name}
            className={`${styles.input} ${styles.nodrag}`}
            placeholder="e.g., Human_Admin"
            size="small"
          />
        </div>
      </div>
    </Card>
  );
});

export default UserProxyAgentNode;