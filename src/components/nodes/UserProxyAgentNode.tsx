import { memo } from 'react';
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
    width: '300px',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  cardHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
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
      <CardHeader
        className={styles.cardHeader}
        header={<b>User Proxy Agent</b>}
      />
      <div className={styles.cardContent}>
        <Text>
          A proxy agent for the user. This node is the final recipient of the conversation.
        </Text>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          defaultValue={name}
          className={styles.nodrag}
          placeholder="e.g., Human_Admin"
        />
      </div>
    </Card>
  );
});

export default UserProxyAgentNode;