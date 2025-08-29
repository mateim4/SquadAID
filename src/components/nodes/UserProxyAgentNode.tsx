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
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
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
      background: `linear-gradient(90deg, ${tokens.colorNeutralBackground4}, ${tokens.colorNeutralBackground3})`,
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
    transition: 'all 0.2s ease',
    '&:focus': {
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
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
    border: `2px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.3)',
      boxShadow: `0 0 0 3px ${tokens.colorNeutralStroke2}40`,
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