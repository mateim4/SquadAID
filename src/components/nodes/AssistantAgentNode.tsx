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
  // This class is essential for React Flow. It prevents the node from being dragged
  // when the user interacts with form elements inside the node.
  nodrag: {
    pointerEvents: 'all',
  },
  handle: {
    width: '10px',
    height: '10px',
  },
});

/**
 * @interface AssistantAgentNodeData
 * @description Defines the shape of the data object for an AssistantAgentNode.
 * This ensures type safety for the data passed to the node.
 */
interface AssistantAgentNodeData {
  name: string;
  systemMessage: string;
}

/**
 * The AssistantAgentNode component.
 *
 * @param {NodeProps<AssistantAgentNodeData>} props - The props provided by React Flow,
 * including node id, data, and selection status. The data is typed with our custom interface.
 * @returns {JSX.Element} A custom node component for representing an Assistant Agent.
 *
 * @description This component renders a card-based UI for an "Assistant Agent".
 * It includes input fields for the agent's name and system message.
 * It features two connection points (`Handle` components): one on the left (target)
 * and one on the right (source), allowing it to be connected within a workflow.
 */
const AssistantAgentNode = memo(({ id, data }: NodeProps<AssistantAgentNodeData>) => {
  const styles = useStyles();

  // In a future step, we will lift this state up to a global store.
  // For now, it remains local to demonstrate the component's UI.
  const { name, systemMessage } = data;

  return (
    <Card className={styles.card}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader
        className={styles.cardHeader}
        header={<b>Assistant Agent</b>}
      />
      <div className={styles.cardContent}>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          defaultValue={name}
          className={styles.nodrag}
          placeholder="e.g., Researcher"
        />

        <Label htmlFor={`system-message-${id}`}>System Message</Label>
        <Textarea
          id={`system-message-${id}`}
          defaultValue={systemMessage}
          className={styles.nodrag}
          placeholder="You are a helpful assistant..."
          rows={5}
          resize="vertical"
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handle}
      />
    </Card>
  );
});

export default AssistantAgentNode;