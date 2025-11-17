import { memo, useMemo } from 'react';
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
  Textarea,
  Button,
} from '@fluentui/react-components';
import { useWorkflowStore } from '@/store/workflowStore';
import { ChevronDown24Regular, ChevronUp24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  card: {
  width: '300px',
  position: 'relative',
  overflow: 'hidden',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  cardHeader: {
  backgroundColor: tokens.colorNeutralBackground3,
  cursor: 'grab',
  },
  selectionBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundImage: 'linear-gradient(90deg, #f44336, #ff9800, #ffeb3b, #4caf50, #2196f3, #3f51b5, #9c27b0)',
    backgroundSize: '400% 100%',
    animationName: {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    animationDuration: '3s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
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
  toggle: {
    display: 'flex',
    justifyContent: 'center',
    ...shorthands.padding(tokens.spacingVerticalXS),
  },
});

/**
 * @interface UserProxyAgentNodeData
 * @description Defines the shape of the data object for a UserProxyAgentNode.
 */
interface UserProxyAgentNodeData {
  name: string;
  systemMessage?: string;
  expanded?: boolean;
  [key: string]: any;
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
const UserProxyAgentNode = memo(({ id, data, selected }: NodeProps<UserProxyAgentNodeData>) => {
  const styles = useStyles();
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const removeNode = useWorkflowStore(s => s.removeNode);
  const { name, systemMessage = '', expanded } = data as UserProxyAgentNodeData;
  const extraEntries = useMemo(() => {
    const omit = new Set(['name','systemMessage','label','icon','agentId','expanded']);
    return Object.entries(data || {}).filter(([k]) => !omit.has(k));
  }, [data]);

  return (
    <Card className={styles.card}>
      {selected && <div className={styles.selectionBar} />}
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
      <CardHeader
        className={`${styles.cardHeader} drag-handle`}
        header={<b>User Proxy Agent</b>}
        action={<Button size="small" appearance="subtle" onClick={(e) => { e.stopPropagation(); removeNode(id); }}>✕</Button>}
      />
      <div className={styles.cardContent}>
        <Text>
          A proxy agent for the user. This node is the final recipient of the conversation.
        </Text>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          value={name}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onChange={(e, d) => updateNodeData(id, { name: d.value })}
          className={styles.nodrag}
          placeholder="e.g., Human_Admin"
        />
        <Label htmlFor={`system-message-${id}`}>Instruction Prompt</Label>
        <Textarea
          id={`system-message-${id}`}
          value={systemMessage}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onChange={(e, d) => updateNodeData(id, { systemMessage: d.value })}
          className={styles.nodrag}
          placeholder="Guidance for the human-in-the-loop stage..."
          rows={4}
          resize="vertical"
        />
        {expanded && extraEntries.length > 0 && (
          <>
      {extraEntries.map(([key, value]) => (
              <div key={key}>
        <Label htmlFor={`${key}-${id}`}>{key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}</Label>
                {typeof value === 'number' ? (
                  <Input
                    id={`${key}-${id}`}
                    type="number"
                    value={String(value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseMove={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e, d) => {
                      const v = d.value.trim();
                      updateNodeData(id, { [key]: v === '' ? '' : Number(v) });
                    }}
                    className={styles.nodrag}
                  />
                ) : typeof value === 'string' ? (
                  key.toLowerCase().includes('message') || key.toLowerCase().includes('context') || key.toLowerCase().includes('prompt') ? (
                    <Textarea
                      id={`${key}-${id}`}
                      value={value as string}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                      onChange={(e, d) => updateNodeData(id, { [key]: d.value })}
                      className={styles.nodrag}
                      rows={3}
                      resize="vertical"
                    />
                  ) : (
                    <Input
                      id={`${key}-${id}`}
                      value={value as string}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                      onChange={(e, d) => updateNodeData(id, { [key]: d.value })}
                      className={styles.nodrag}
                    />
                  )
                ) : null}
              </div>
            ))}
          </>
        )}
      </div>
      <div className={styles.toggle}>
        <Button appearance="subtle" size="small" icon={expanded ? <ChevronUp24Regular/> : <ChevronDown24Regular/>} onClick={() => updateNodeData(id, { expanded: !expanded })}>
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
    </Card>
  );
});

UserProxyAgentNode.displayName = 'UserProxyAgentNode';
export default UserProxyAgentNode;