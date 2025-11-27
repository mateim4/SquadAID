import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Body1,
  Caption1,
  Title3,
  Divider,
  tokens,
  Input,
} from '@fluentui/react-components';
import {
  Save24Regular,
  PlayCircle24Regular,
} from '@fluentui/react-icons';
import { useStyles } from '@/styles/useStyles';
import { useWorkflowStore } from '@/store/workflowStore';
import { NodeSettings } from '@/components/settings/NodeSettings';
// Prefer static imports to avoid mixed static/dynamic chunking and warnings
import { apiService } from '@/services/api';
import {
  upsertProject,
  createWorkflow,
  saveGraph,
  listWorkflows,
  loadGraph,
} from '@/services/surreal';
import { Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogBody, DialogActions, DialogContent, Button as FluentButton } from '@fluentui/react-components';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const SaveWorkflowDialog: React.FC<{ onSaved?: (id: string) => void; projectSlug: string; }> = ({ onSaved, projectSlug }) => {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const viewport = useWorkflowStore((s) => s.viewport);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | undefined>();

  const save = async () => {
    const created = await createWorkflow(projectSlug, name || 'untitled', description || '', viewport);
    const wf = (created.result as any[])[0];
    const id = wf?.id || wf?.[0]?.id;
    await saveGraph(id, { nodes, edges, viewport });
    setStatus(`Saved ${name || 'untitled'}`);
    onSaved?.(id);
    setName(''); setDescription('');
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button icon={<Save24Regular />} style={{ width: '100%' }}>
          Save Current Workflow
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Save Workflow</DialogTitle>
          <DialogContent>
            <Input placeholder="Workflow Name" value={name} onChange={(e, d) => setName(d.value)} style={{ marginBottom: 10 }} />
            <Input placeholder="Workflow Description" value={description} onChange={(e, d) => setDescription(d.value)} />
            {status && <Caption1 style={{ display: 'block', marginTop: 6, color: tokens.colorNeutralForeground2 }}>{status}</Caption1>}
          </DialogContent>
          <DialogActions>
            <DialogTrigger>
              <FluentButton appearance="secondary">Cancel</FluentButton>
            </DialogTrigger>
            <DialogTrigger>
              <PrimaryButton onClick={save}>Save</PrimaryButton>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export const WorkflowLibrary: React.FC = () => {
  const styles = useStyles();
  const isMobile = useMediaQuery('(max-width: 700px)');
  const setFlow = useWorkflowStore(s => s.setFlow);
  const nodes = useWorkflowStore(s => s.nodes);
  const edges = useWorkflowStore(s => s.edges);
  const viewport = useWorkflowStore(s => s.viewport);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | undefined>(undefined);
  const [dbMsg, setDbMsg] = useState<string | undefined>();
  const [dbId, setDbId] = useState<string>('1');
  const [surMsg, setSurMsg] = useState<string | undefined>();
  const [projectSlug, setProjectSlug] = useState<string>('default');
  const [workflowName, setWorkflowName] = useState<string>('current');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const refreshWorkflows = useCallback(async () => {
    try {
      const res = await listWorkflows(projectSlug);
      setWorkflows((res.result as any[]) || []);
      setSurMsg(undefined);
    } catch (err: any) {
      // Gracefully handle Surreal not running
      setWorkflows([]);
      setSurMsg('SurrealDB not reachable (set VITE_SURREAL_URL or start the DB)');
    }
  }, [projectSlug]);
  useEffect(() => { refreshWorkflows(); }, [refreshWorkflows]);
  const runWorkflow = async () => {
    setRunning(true);
    setLastRun(undefined);
    try {
      const res = await apiService.executeWorkflow({ nodes, edges });
      setLastRun(res.error ? `Error: ${res.error}` : res.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={styles.sidebar} aria-label="Workflow library">
      <div className={styles.sidebarHeader}>
        <Title3>Workflow Library</Title3>
      </div>
      <div style={{ padding: isMobile ? '0 12px 8px' : '0 16px 12px' }}>
  <SaveWorkflowDialog projectSlug={projectSlug} onSaved={() => { setSurMsg('Saved'); refreshWorkflows(); }} />
        <div style={{ marginTop: isMobile ? 6 : 8, display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
          <PrimaryButton icon={<PlayCircle24Regular />} onClick={runWorkflow} disabled={running}>
            {running ? 'Running…' : 'Run Workflow'}
          </PrimaryButton>
          {lastRun && (
            <Caption1 style={{ display: 'block', marginTop: 6, color: tokens.colorNeutralForeground2 }}>
              {lastRun}
            </Caption1>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: isMobile ? 6 : 10, alignItems: 'center' }}>
            <Input style={{ width: isMobile ? 90 : 100 }} value={dbId} onChange={(e, d) => setDbId(d.value)} contentBefore={<span>ID</span>} />
            <Button
              onClick={async () => {
                const { saveWorkflowToDb } = await import('@/services/persistence');
                const id = parseInt(dbId || '1', 10);
                const res = await saveWorkflowToDb(id, { nodes, edges, viewport });
                setDbMsg(res.ok ? `Saved to DB (ID=${id})` : `Save error: ${res.error}`);
              }}
            >
              Save to DB
            </Button>
            <Button
              onClick={async () => {
                const { loadWorkflowFromDb } = await import('@/services/persistence');
                const id = parseInt(dbId || '1', 10);
                const res = await loadWorkflowFromDb(id);
                if (res.ok && res.graph) {
                  setFlow(res.graph.nodes as any, res.graph.edges as any);
                  setDbMsg(`Loaded from DB (ID=${id})`);
                } else {
                  setDbMsg(`Load error: ${res.error}`);
                }
              }}
            >
              Load from DB
            </Button>
          </div>
          {dbMsg && (
            <Caption1 style={{ display: 'block', marginTop: 6, color: tokens.colorNeutralForeground2 }}>
              {dbMsg}
            </Caption1>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: isMobile ? 8 : 14, alignItems: 'center' }}>
            <Input style={{ width: isMobile ? 130 : 140 }} value={projectSlug} onChange={(e, d) => setProjectSlug(d.value)} placeholder="project slug" />
            <Input style={{ width: isMobile ? 140 : 160 }} value={workflowName} onChange={(e, d) => setWorkflowName(d.value)} placeholder="workflow name" />
            <Button
              onClick={async () => {
                try {
                  await upsertProject(projectSlug, { name: projectSlug });
                  const created = await createWorkflow(projectSlug, workflowName, '', viewport);
                  const wf = (created.result as any[])[0];
                  const id = wf?.id || wf?.[0]?.id;
                  if (!id) throw new Error('Failed to create workflow');
                  await saveGraph(id, { nodes, edges, viewport });
                  setSurMsg(`Saved to Surreal: ${id}`);
                } catch (e: any) {
                  setSurMsg(`Surreal save error: ${String(e)}`);
                }
              }}
            >
              Save to Surreal
            </Button>
            <Button
              onClick={async () => {
                try {
                  const list = await listWorkflows(projectSlug);
                  const wf = (list.result as any[])[0];
                  if (!wf) throw new Error('No workflow found');
                  const loaded = await loadGraph(wf.id);
                  const { nodes: n, edges: e } = loaded.result as any;
                  setFlow(n.map((x: any) => ({ id: x.key, type: x.type, position: x.position, data: x.data })),
                          e.map((x: any) => ({ id: x.id, source: x.source, target: x.target, sourceHandle: x.source_handle, targetHandle: x.target_handle })));
                  setSurMsg(`Loaded from Surreal: ${wf.id}`);
                } catch (err: any) {
                  setSurMsg(`Surreal load error: ${String(err)}`);
                }
              }}
            >
              Load from Surreal
            </Button>
          </div>
          {surMsg && (
            <Caption1 style={{ display: 'block', marginTop: 6, color: tokens.colorNeutralForeground2 }}>
              {surMsg}
            </Caption1>
          )}
        </div>
      </div>
      {!isMobile && <Divider />}
  {/* Node settings section */}
  <div style={isMobile ? { padding: '0 12px 8px' } : undefined}>
        <NodeSettings />
      </div>
      {!isMobile && <Divider />}
  <div className={styles.sidebarContent} style={isMobile ? { padding: '8px 12px 12px' } : undefined}>
        {workflows.map((wf) => (
          <div key={wf.id} className={styles.workflowItem}>
            <div className={styles.workflowItemHeader}>
              <Body1><b>{wf.name}</b></Body1>
              <Button data-appearance="primary" size="small" appearance="primary" onClick={async () => {
                const loaded = await loadGraph(wf.id);
    const { nodes: n, edges: e } = loaded.result as any;
    setFlow(n.map((x: any) => ({ id: x.key, type: x.type, position: x.position, data: x.data })),
      e.map((x: any) => ({ id: x.id, source: x.source, target: x.target, sourceHandle: x.source_handle, targetHandle: x.target_handle, data: { condition: x.condition }, label: x.label, type: 'conditional' })));
              }}>Load</Button>
            </div>
            <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{wf.description}</Caption1>
          </div>
        ))}
      </div>
    </div>
  );
};
