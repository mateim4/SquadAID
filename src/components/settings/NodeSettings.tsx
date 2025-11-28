import React, { useMemo, useState, useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { agents } from '@/data/agents';
import {
  Title3,
  Input,
  Body1,
  Button,
  Caption1,
  tokens,
  Spinner,
  Textarea,
  Label,
  Dropdown,
  Option,
  Select,
  Tooltip,
} from '@fluentui/react-components';
import { PlayIcon, RefreshIcon } from '@/components/icons';
import { apiService } from '@/services/api';
import { testOllamaConnection, listLocalModels } from '@/services/ollama';
import { OllamaModel } from '@/services/ollama';

export const NodeSettings: React.FC = () => {
  const { selectedNodeId, nodes, updateSelectedNodeLabel, updateNodeData } = useWorkflowStore();
  const node = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);
  const [label, setLabel] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  // Additional per-agent fields
  const [maxRounds, setMaxRounds] = useState<number | ''>(''); // group-manager
  const [selectionStrategy, setSelectionStrategy] = useState(''); // group-manager
  const [pmContext, setPmContext] = useState(''); // product-manager
  const [plannerGoal, setPlannerGoal] = useState(''); // planner
  const [plannerMaxSteps, setPlannerMaxSteps] = useState<number | ''>(''); // planner
  const [coderLanguage, setCoderLanguage] = useState(''); // coder
  // Claude / Ollama
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState<number | ''>('');
  // Custom Agent
  const [tools, setTools] = useState('');
  // Jules bridge
  const [jRepo, setJRepo] = useState('');
  const [jIssue, setJIssue] = useState<number | ''>('');
  const [jActor, setJActor] = useState('');
  const [jChatInput, setJChatInput] = useState('');
  const [jLastId, setJLastId] = useState<number | undefined>(undefined);

  // Ollama specific state
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [isOllamaRunning, setIsOllamaRunning] = useState(false);
  const [testingOllama, setTestingOllama] = useState(false);


  useEffect(() => {
    setLabel((node?.data?.label as string) || '');
    setName(((node?.data as any)?.name as string) || '');
    setSystemMessage(((node?.data as any)?.systemMessage as string) || '');
  // hydrate per-agent fields
  setMaxRounds((((node?.data as any)?.maxRounds as number) ?? '') as any);
  setSelectionStrategy(((node?.data as any)?.selectionStrategy as string) || '');
  setPmContext(((node?.data as any)?.context as string) || '');
  setPlannerGoal(((node?.data as any)?.goal as string) || '');
  setPlannerMaxSteps((((node?.data as any)?.maxSteps as number) ?? '') as any);
  setCoderLanguage(((node?.data as any)?.language as string) || '');
  setModel(((node?.data as any)?.model as string) || '');
  setTemperature((((node?.data as any)?.temperature as number) ?? '') as any);
  setTools(((node?.data as any)?.tools as string) || '');
  setJRepo(((node?.data as any)?.jRepo as string) || '');
  setJIssue((((node?.data as any)?.jIssue as number) ?? '') as any);
  setJActor(((node?.data as any)?.jActor as string) || '');
    setResult(undefined);

    // If the agent is an Ollama agent, check for local models
    if (agentId === 'ollama') {
      checkOllamaStatus();
    }
  // Re-run when the selected node or its data ref changes
  }, [node?.id, node?.data]);

  const checkOllamaStatus = async () => {
    setTestingOllama(true);
    const running = await testOllamaConnection();
    setIsOllamaRunning(running);
    if (running) {
      const models = await listLocalModels();
      setOllamaModels(models);
    }
    setTestingOllama(false);
  };

  const agentId = (node?.data as any)?.agentId as string | undefined;
  const agent = agents.find(a => a.id === agentId);

  if (!node) {
    return (
      <div style={{ padding: 16, color: tokens.colorNeutralForeground2 }}>
        <Caption1>Select a node to edit its settings.</Caption1>
      </div>
    );
  }

  const testAgent = async () => {
    if (!agentId) return;
    setTesting(true);
    setResult(undefined);
    const backendType = agent?.backendType || agentId;
    const res = await apiService.testAgent(backendType, `Ping from ${label || 'node'}`);
    setTesting(false);
    setResult(res.error ? `Error: ${res.error}` : res.message);
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Title3>Node Settings</Title3>
      <Body1><b>Agent</b>: {agent ? agent.name : 'Unknown'}</Body1>
      <Input
        value={label}
        onChange={(e, d) => setLabel(d.value)}
        onBlur={() => updateSelectedNodeLabel(label)}
        placeholder="Node label"
      />
      {/* Per-node-type fields */}
      {node?.type === 'assistantAgent' && (
        <>
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e, d) => setName(d.value)}
            onBlur={() => updateNodeData(node.id, { name })}
            placeholder="e.g., Researcher"
          />
          <Label>System Message</Label>
          <Textarea
            value={systemMessage}
            onChange={(e, d) => setSystemMessage(d.value)}
            onBlur={() => updateNodeData(node.id, { systemMessage })}
            placeholder="You are a helpful assistant..."
            rows={4}
            resize="vertical"
          />
        </>
      )}
      {node?.type === 'userProxyAgent' && (
        <>
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e, d) => setName(d.value)}
            onBlur={() => updateNodeData(node.id, { name })}
            placeholder="e.g., Human_Admin"
          />
        </>
      )}
      {/* Per-agent ID fields */}
      {agentId === 'group-manager' && (
        <>
          <Label>Max Rounds</Label>
          <Input
            type="number"
            value={maxRounds === '' ? '' : String(maxRounds)}
            onChange={(e, d) => {
              const v = d.value.trim();
              setMaxRounds(v === '' ? '' : Number(v));
            }}
            onBlur={() => updateNodeData(node.id, { maxRounds: maxRounds === '' ? undefined : Number(maxRounds) })}
            placeholder="e.g., 20"
          />
          <Label>Selection Strategy</Label>
          <Input
            value={selectionStrategy}
            onChange={(e, d) => setSelectionStrategy(d.value)}
            onBlur={() => updateNodeData(node.id, { selectionStrategy })}
            placeholder="e.g., round-robin, longest-waiting"
          />
        </>
      )}
      {agentId === 'product-manager' && (
        <>
          <Label>Context / Brief</Label>
          <Textarea
            value={pmContext}
            onChange={(e, d) => setPmContext(d.value)}
            onBlur={() => updateNodeData(node.id, { context: pmContext })}
            placeholder="Project background, target users, constraints..."
            rows={4}
            resize="vertical"
          />
        </>
      )}
      {agentId === 'planner' && (
        <>
          <Label>Goal</Label>
          <Input
            value={plannerGoal}
            onChange={(e, d) => setPlannerGoal(d.value)}
            onBlur={() => updateNodeData(node.id, { goal: plannerGoal })}
            placeholder="Define the objective to plan for"
          />
          <Label>Max Steps</Label>
          <Input
            type="number"
            value={plannerMaxSteps === '' ? '' : String(plannerMaxSteps)}
            onChange={(e, d) => {
              const v = d.value.trim();
              setPlannerMaxSteps(v === '' ? '' : Number(v));
            }}
            onBlur={() => updateNodeData(node.id, { maxSteps: plannerMaxSteps === '' ? undefined : Number(plannerMaxSteps) })}
            placeholder="e.g., 8"
          />
        </>
      )}
      {(agentId === 'coder' || agentId === 'jules-coder') && (
        <>
          <Label>Preferred Language</Label>
          <Input
            value={coderLanguage}
            onChange={(e, d) => setCoderLanguage(d.value)}
            onBlur={() => updateNodeData(node.id, { language: coderLanguage })}
            placeholder="e.g., TypeScript, Python"
          />
          {agentId === 'jules-coder' && (
            <>
              <Label>Jules Bridge: Repo (owner/name)</Label>
              <Input value={jRepo} onChange={(e, d) => setJRepo(d.value)} onBlur={() => updateNodeData(node.id, { jRepo })} placeholder="owner/repo" />
              <Label>Issue Number (chat thread)</Label>
              <Input type="number" value={jIssue === '' ? '' : String(jIssue)} onChange={(e, d) => setJIssue(d.value ? Number(d.value) : '')} onBlur={() => updateNodeData(node.id, { jIssue: jIssue === '' ? undefined : Number(jIssue) })} placeholder="e.g., 123" />
              <Label>Jules Actor (GitHub username)</Label>
              <Input value={jActor} onChange={(e, d) => setJActor(d.value)} onBlur={() => updateNodeData(node.id, { jActor })} placeholder="e.g., google-jules-bot" />
              <Label>Chat</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input value={jChatInput} onChange={(e, d) => setJChatInput(d.value)} placeholder="Message to Jules…" />
                <Button onClick={async () => {
                  if (!jRepo) { setResult('Set repo first'); return; }
                  const { sendMessage } = await import('@/services/julesBridge');
                  try {
                    const issueNum = await sendMessage({ repo: jRepo, issueNumber: jIssue === '' ? undefined : Number(jIssue), julesActor: jActor }, jChatInput, { createIfMissing: true });
                    setResult(`Sent to issue #${issueNum}`);
                    if (jIssue === '') setJIssue(issueNum);
                    setJChatInput('');
                  } catch (e: any) {
                    setResult(`Send failed: ${e?.message || String(e)}`);
                  }
                }}>Send</Button>
                <Button onClick={async () => {
                  if (!jRepo || jIssue === '') { setResult('Set repo and issue'); return; }
                  const { fetchNewMessages } = await import('@/services/julesBridge');
                  try {
                    const msgs = await fetchNewMessages({ repo: jRepo, issueNumber: Number(jIssue), julesActor: jActor }, jLastId);
                    if (msgs.length) setJLastId(msgs[msgs.length - 1].id);
                    setResult(msgs.length ? msgs.map(m => `(${m.author}) ${m.body}`).join('\n') : 'No new messages');
                  } catch (e: any) {
                    setResult(`Fetch failed: ${e?.message || String(e)}`);
                  }
                }}>Fetch</Button>
              </div>
            </>
          )}
        </>
      )}
      {agentId === 'claude' && (
        <>
          <Label>Model</Label>
          <Dropdown
            selectedOptions={[model || 'sonnet-4']}
            onOptionSelect={(_e, data) => {
              const val = (data.optionValue as string) || 'sonnet-4';
              setModel(val);
              updateNodeData(node.id, { model: val });
            }}
          >
            <Option value="sonnet-4">Sonnet 4</Option>
            <Option value="opus-4.1">Opus 4.1</Option>
          </Dropdown>
          <Label>Temperature</Label>
          <Input
            type="number"
            value={temperature === '' ? '' : String(temperature)}
            onChange={(e, d) => {
              const v = d.value.trim();
              setTemperature(v === '' ? '' : Number(v));
            }}
            onBlur={() => updateNodeData(node.id, { temperature: temperature === '' ? undefined : Number(temperature) })}
            placeholder="0.0 - 1.0"
          />
        </>
      )}
      {agentId === 'ollama' && (
        <>
          <Label>Model</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isOllamaRunning ? (
              <Select
                value={model}
                onChange={(e, d) => {
                  setModel(d.value);
                  updateNodeData(node.id, { model: d.value });
                }}
              >
                {ollamaModels.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                value={model}
                onChange={(e, d) => setModel(d.value)}
                onBlur={() => updateNodeData(node.id, { model })}
                placeholder="e.g., llama3"
              />
            )}
            <Tooltip content="Refresh model list" relationship="label">
              <Button
                icon={testingOllama ? <Spinner size="tiny" /> : <RefreshIcon />}
                onClick={checkOllamaStatus}
                disabled={testingOllama}
              />
            </Tooltip>
          </div>
          {!testingOllama && !isOllamaRunning && (
            <Caption1 style={{ color: tokens.colorPaletteRedForeground1 }}>
              Ollama not detected. Is it running at http://localhost:11434?
            </Caption1>
          )}
          <Label>Temperature</Label>
          <Input
            type="number"
            value={temperature === '' ? '' : String(temperature)}
            onChange={(e, d) => {
              const v = d.value.trim();
              setTemperature(v === '' ? '' : parseFloat(v));
            }}
            onBlur={() => updateNodeData(node.id, { temperature })}
            placeholder="0.7"
          />
        </>
      )}
      {agentId === 'msty' && (
        <>
          <Label>Model</Label>
          <Input
            value={model}
            onChange={(e, d) => setModel(d.value)}
            onBlur={() => updateNodeData(node.id, { model })}
            placeholder={'Your MSTY model id'}
          />
          <Label>Temperature</Label>
          <Input
            type="number"
            value={temperature === '' ? '' : String(temperature)}
            onChange={(e, d) => {
              const v = d.value.trim();
              setTemperature(v === '' ? '' : Number(v));
            }}
            onBlur={() => updateNodeData(node.id, { temperature: temperature === '' ? undefined : Number(temperature) })}
            placeholder="0.0 - 1.0"
          />
        </>
      )}
  {/* Copilot-specific settings removed since duplicate one-word entry was removed */}
      {agentId === 'custom' && (
        <>
          <Label>Tools (comma-separated)</Label>
          <Input
            value={tools}
            onChange={(e, d) => setTools(d.value)}
            onBlur={() => updateNodeData(node.id, { tools })}
            placeholder="search,code,execute"
          />
        </>
      )}
      <div>
  <Button data-appearance="primary" appearance="primary" icon={<PlayIcon />} onClick={testAgent} disabled={!agentId || testing}>
          {testing ? <Spinner size="tiny" /> : 'Test Agent'}
        </Button>
      </div>
      {result && (
        <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
          {result}
        </Caption1>
      )}
    </div>
  );
};

export default NodeSettings;
