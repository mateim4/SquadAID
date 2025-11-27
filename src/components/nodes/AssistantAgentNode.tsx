import { memo, useMemo, useState } from 'react';
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
  Button,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import { useWorkflowStore } from '@/store/workflowStore';
import { ChevronDown24Regular, ChevronUp24Regular } from '@fluentui/react-icons';
import { useProjectStore } from '@/store/projectStore';

// Lightweight controls embedded in the node for Jules bridge chat
function JulesChatControls({ nodeId, data }: { nodeId: string; data: any }) {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const appendActivity = (text: string) => {
    const prev = (data?.threadActivity as string) || '';
    const next = prev ? `${prev}\n${text}` : text;
    // truncate to ~8k
    const trimmed = next.length > 8000 ? next.slice(-8000) : next;
    updateNodeData(nodeId, { threadActivity: trimmed });
  };

  return (
    <>
      <Input
        value={msg}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onChange={(_e, d) => setMsg(d.value)}
        placeholder="Message to Jules…"
        style={{ flex: 1 }}
      />
      <Button
        appearance="secondary"
        disabled={busy}
        onClick={async (e) => {
          e.stopPropagation();
          if (!data?.jRepo) { appendActivity('Set repo first'); return; }
          if (!msg.trim()) return;
          setBusy(true);
          try {
            const { sendMessage } = await import('@/services/julesBridge');
            const issueNum = await sendMessage({ repo: data.jRepo, issueNumber: data.jIssue === '' ? undefined : Number(data.jIssue), julesActor: data.jActor }, msg.trim(), { createIfMissing: true });
            if (!data.jIssue) updateNodeData(nodeId, { jIssue: issueNum });
            appendActivity(`(you) ${msg.trim()}`);
            setMsg('');
          } catch (e: any) {
            appendActivity(`Send failed: ${e?.message || String(e)}`);
          } finally {
            setBusy(false);
          }
        }}
      >Send</Button>
      <Button
        appearance="secondary"
        disabled={busy}
        onClick={async (e) => {
          e.stopPropagation();
          if (!data?.jRepo || data?.jIssue === '' || !data?.jIssue) { appendActivity('Set repo and issue'); return; }
          setBusy(true);
          try {
            const { fetchNewMessages } = await import('@/services/julesBridge');
            const msgs = await fetchNewMessages({ repo: data.jRepo, issueNumber: Number(data.jIssue), julesActor: data.jActor }, data?.jLastId);
            if (msgs.length) updateNodeData(nodeId, { jLastId: msgs[msgs.length - 1].id });
            if (msgs.length) {
              appendActivity(msgs.map(m => `(${m.author}) ${m.body}`).join('\n'));
            } else {
              appendActivity('No new messages');
            }
          } catch (e: any) {
            appendActivity(`Fetch failed: ${e?.message || String(e)}`);
          } finally {
            setBusy(false);
          }
        }}
      >Fetch</Button>
    </>
  );
}

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
  // This class is essential for React Flow. It prevents the node from being dragged
  // when the user interacts with form elements inside the node.
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
 * @interface AssistantAgentNodeData
 * @description Defines the shape of the data object for an AssistantAgentNode.
 * This ensures type safety for the data passed to the node.
 */
interface AssistantAgentNodeData {
  name: string;
  systemMessage: string;
  expanded?: boolean;
  // Additional optional params may exist on data; we render them when expanded
  [key: string]: any;
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
const AssistantAgentNode = memo(({ id, data, selected }: NodeProps<AssistantAgentNodeData>) => {
  const styles = useStyles();
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const removeNode = useWorkflowStore(s => s.removeNode);
  const projectMode = useProjectStore(s => s.mode);

  // In a future step, we will lift this state up to a global store.
  // For now, it remains local to demonstrate the component's UI.
  const { name, systemMessage, expanded } = data as AssistantAgentNodeData;
  const agentId = (data as any)?.agentId as string | undefined;

  // Decide which extra fields to show when expanded: any keys except name/systemMessage/basic metadata
  const extraEntries = useMemo(() => {
    const baseOmit = new Set(['name','systemMessage','label','icon','agentId','expanded']);
    // Omit any keys that are rendered explicitly by agent-specific sections to prevent duplicates
    const agentSpecificOmit = new Set<string>();
    switch (agentId) {
      case 'group-manager':
        ['maxRounds','selectionStrategy'].forEach(k => agentSpecificOmit.add(k));
        break;
      case 'product-manager':
        ['context'].forEach(k => agentSpecificOmit.add(k));
        break;
      case 'planner':
        ['goal','maxSteps'].forEach(k => agentSpecificOmit.add(k));
        break;
      case 'coder':
      case 'jules-coder':
        ['language'].forEach(k => agentSpecificOmit.add(k));
        break;
      case 'claude':
        ['model','temperature'].forEach(k => agentSpecificOmit.add(k));
        break;
      case 'ollama':
      case 'msty':
        ['model','temperature'].forEach(k => agentSpecificOmit.add(k));
        break;
      case 'custom':
        ['tools'].forEach(k => agentSpecificOmit.add(k));
        break;
      default:
        break;
    }
    const omit = new Set<string>([...baseOmit, ...Array.from(agentSpecificOmit)]);
    return Object.entries(data || {}).filter(([k]) => !omit.has(k));
  }, [data, agentId]);

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
        header={<b>{data.label || 'Assistant Agent'}</b>}
        action={<Button size="small" appearance="subtle" onClick={(e) => { e.stopPropagation(); removeNode(id); }}>✕</Button>}
      />
      <div className={styles.cardContent}>
        <Label htmlFor={`name-${id}`}>Name</Label>
        <Input
          id={`name-${id}`}
          value={name}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onChange={(e, d) => updateNodeData(id, { name: d.value })}
          className={styles.nodrag}
          placeholder="e.g., Researcher"
        />

        <Label htmlFor={`system-message-${id}`}>Instruction Prompt</Label>
        <Textarea
          id={`system-message-${id}`}
          value={systemMessage}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onChange={(e, d) => updateNodeData(id, { systemMessage: d.value })}
          className={styles.nodrag}
          placeholder="You are a helpful assistant..."
          rows={5}
          resize="vertical"
        />

        {expanded && (
          <>
            {/* Agent-specific fields mirroring NodeSettings */}
            {agentId === 'group-manager' && (
              <>
                <Label htmlFor={`maxRounds-${id}`}>Max Rounds</Label>
                <Input
                  id={`maxRounds-${id}`}
                  type="number"
                  value={String((data as any)?.maxRounds ?? '')}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e, d) => {
                    const v = d.value.trim();
                    updateNodeData(id, { maxRounds: v === '' ? '' : Number(v) });
                  }}
                  className={styles.nodrag}
                />
                <Label htmlFor={`selectionStrategy-${id}`}>Selection Strategy</Label>
                <Input
                  id={`selectionStrategy-${id}`}
                  value={(data as any)?.selectionStrategy || ''}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onChange={(e, d) => updateNodeData(id, { selectionStrategy: d.value })}
                  className={styles.nodrag}
                />
              </>
            )}
            {agentId === 'product-manager' && (
              <>
                <Label htmlFor={`context-${id}`}>Context / Brief</Label>
                <Textarea
                  id={`context-${id}`}
                  value={(data as any)?.context || ''}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onChange={(e, d) => updateNodeData(id, { context: d.value })}
                  className={styles.nodrag}
                  rows={4}
                  resize="vertical"
                />
              </>
            )}
            {agentId === 'planner' && (
              <>
                <Label htmlFor={`goal-${id}`}>Goal</Label>
                <Input
                  id={`goal-${id}`}
                  value={(data as any)?.goal || ''}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onChange={(e, d) => updateNodeData(id, { goal: d.value })}
                  className={styles.nodrag}
                />
                <Label htmlFor={`maxSteps-${id}`}>Max Steps</Label>
                <Input
                  id={`maxSteps-${id}`}
                  type="number"
                  value={String((data as any)?.maxSteps ?? '')}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e, d) => {
                    const v = d.value.trim();
                    updateNodeData(id, { maxSteps: v === '' ? '' : Number(v) });
                  }}
                  className={styles.nodrag}
                />
              </>
            )}
            {(agentId === 'coder' || agentId === 'jules-coder') && (
              <>
                <Label htmlFor={`language-${id}`}>Preferred Language</Label>
                <Input
                  id={`language-${id}`}
                  value={(data as any)?.language || ''}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onChange={(e, d) => updateNodeData(id, { language: d.value })}
                  className={styles.nodrag}
                />
                {agentId === 'jules-coder' && (
                  <>
                    {projectMode === 'local' && (
                      <div style={{ color: tokens.colorPaletteRedForeground1 }}>
                        Jules requires GitHub. Switch project to Hybrid or GitHub to use chat.
                      </div>
                    )}
                    <Label htmlFor={`jrepo-${id}`}>Jules Bridge: Repo (owner/name)</Label>
                    <Input
                      id={`jrepo-${id}`}
                      value={(data as any)?.jRepo || ''}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                      onChange={(e, d) => updateNodeData(id, { jRepo: d.value })}
                      className={styles.nodrag}
                      placeholder="owner/repo"
                    />
                    <Label htmlFor={`jissue-${id}`}>Issue Number (chat thread)</Label>
                    <Input
                      id={`jissue-${id}`}
                      type="number"
                      value={String(((data as any)?.jIssue ?? ''))}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                      onChange={(e, d) => {
                        const v = d.value.trim();
                        updateNodeData(id, { jIssue: v === '' ? '' : Number(v) });
                      }}
                      className={styles.nodrag}
                      placeholder="e.g., 123"
                    />
                    <Label htmlFor={`jactor-${id}`}>Jules Actor (GitHub username)</Label>
                    <Input
                      id={`jactor-${id}`}
                      value={(data as any)?.jActor || ''}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                      onChange={(e, d) => updateNodeData(id, { jActor: d.value })}
                      className={styles.nodrag}
                      placeholder="e.g., google-jules-bot"
                    />
                    <Label htmlFor={`jchat-${id}`}>Chat</Label>
                    <div className={styles.nodrag} style={{ display: 'flex', gap: 8 }}>
                      <JulesChatControls nodeId={id} data={data as any} />
                    </div>
                    <Label htmlFor={`jactivity-${id}`}>Thread Activity</Label>
                    <Textarea
                      id={`jactivity-${id}`}
                      value={((data as any)?.threadActivity as string) || ''}
                      readOnly
                      className={styles.nodrag}
                      rows={4}
                      resize="vertical"
                      placeholder="Messages fetched from the issue thread will appear here."
                    />
                  </>
                )}
              </>
            )}
            {agentId === 'claude' && (
              <>
                <Label htmlFor={`model-${id}`}>Model</Label>
                <Dropdown
                  selectedOptions={[((data as any)?.model as string) || 'sonnet-4']}
                  onOptionSelect={(_e, s) => {
                    const val = (s.optionValue as string) || 'sonnet-4';
                    updateNodeData(id, { model: val });
                  }}
                >
                  <Option value="sonnet-4">Sonnet 4</Option>
                  <Option value="opus-4.1">Opus 4.1</Option>
                </Dropdown>
                <Label htmlFor={`temperature-${id}`}>Temperature</Label>
                <Input
                  id={`temperature-${id}`}
                  type="number"
                  value={String((data as any)?.temperature ?? '')}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e, d) => {
                    const v = d.value.trim();
                    updateNodeData(id, { temperature: v === '' ? '' : Number(v) });
                  }}
                  className={styles.nodrag}
                />
              </>
            )}
            {(agentId === 'ollama' || agentId === 'msty') && (
              <>
                <Label htmlFor={`model-${id}`}>Model</Label>
                <Input
                  id={`model-${id}`}
                  value={(data as any)?.model || ''}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onChange={(e, d) => updateNodeData(id, { model: d.value })}
                  className={styles.nodrag}
                />
                <Label htmlFor={`temperature-${id}`}>Temperature</Label>
                <Input
                  id={`temperature-${id}`}
                  type="number"
                  value={String((data as any)?.temperature ?? '')}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e, d) => {
                    const v = d.value.trim();
                    updateNodeData(id, { temperature: v === '' ? '' : Number(v) });
                  }}
                  className={styles.nodrag}
                />
              </>
            )}
            {agentId === 'custom' && (
              <>
                <Label htmlFor={`tools-${id}`}>Tools (comma-separated)</Label>
                <Input
                  id={`tools-${id}`}
                  value={(data as any)?.tools || ''}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onChange={(e, d) => updateNodeData(id, { tools: d.value })}
                  className={styles.nodrag}
                />
              </>
            )}
            {/* Fallback: render any additional dynamic data keys */}
            {extraEntries.length > 0 && (
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
                          rows={4}
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
          </>
        )}
      </div>
      <div className={styles.toggle}>
        <Button appearance="subtle" size="small" icon={expanded ? <ChevronUp24Regular/> : <ChevronDown24Regular/>} onClick={() => updateNodeData(id, { expanded: !expanded })}>
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handle}
      />
    </Card>
  );
});

AssistantAgentNode.displayName = 'AssistantAgentNode';
export default AssistantAgentNode;