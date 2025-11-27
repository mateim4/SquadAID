import React from 'react';
import { Card, CardHeader, Caption1, Body1, Button, tokens, Tooltip, Badge, Input, Avatar } from '@fluentui/react-components';
import { Next24Regular, Open24Regular, ArrowSync24Regular } from '@fluentui/react-icons';
import { Project } from '@/types';
import { createTask, updateTask } from '@/services/surreal';
import { createIssue } from '@/services/github';

export type ProjectMetric = {
  label: string;
  value?: string | number;
  hint?: string;
};

function fmtDate(ts?: string) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString(); } catch { return ts; }
}

function MetricRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{label}</Caption1>
      <Body1>{value ?? '—'}</Body1>
    </div>
  );
}

function TokenBar({ used, budget }: { used?: number; budget?: number }) {
  const u = typeof used === 'number' ? used : undefined;
  const b = typeof budget === 'number' ? budget : undefined;
  if (!u || !b || b <= 0) return null;
  const pct = Math.max(0, Math.min(100, Math.round((u / b) * 100)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ height: 8, width: '100%', borderRadius: 6, background: tokens.colorNeutralBackground4, overflow: 'hidden', border: `1px solid ${tokens.colorNeutralStroke2}` }}>
        <div style={{ width: `${pct}%`, height: '100%', background: tokens.colorBrandBackground, borderRight: `1px solid ${tokens.colorNeutralStroke1}` }} />
      </div>
      <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{u.toLocaleString()} / {b.toLocaleString()} tokens ({pct}%)</Caption1>
    </div>
  );
}

export function ProjectCard({ project, stats, onOpen, onProjectChanged, includeClosed }: { project: Project; stats?: any; onOpen?: (slug: string) => void; onProjectChanged?: () => void; includeClosed?: boolean; }) {
  const p = project;
  const tokenBudget = p.props?.tokenBudget ?? '—';
  const tokenUsed = p.props?.tokenUsed ?? 0;
  const tokenRemaining = typeof tokenBudget === 'number' ? Math.max(0, tokenBudget - tokenUsed) : '—';
  const lastAction = p.props?.lastAction || fmtDate(stats?.last_task_update) || fmtDate(p.updated_at) || fmtDate(p.created_at);
  const nextAction = p.props?.nextAction || stats?.next_task_title || '—';
  const team = Array.isArray(p.props?.team) ? p.props?.team.join(', ') : (p.props?.team || 'Unassigned');
  const teamList: string[] = Array.isArray(p.props?.team) ? (p.props?.team as string[]) : (typeof p.props?.team === 'string' ? [p.props?.team as string] : []);
  const [quickTitle, setQuickTitle] = React.useState('');
  const labels: string[] = Array.isArray(p.props?.labels) ? (p.props?.labels as string[]) : [];

  return (
    <Card appearance="filled-alternative" style={{ width: '100%', border: `1px solid ${tokens.colorNeutralStroke2}`, background: tokens.colorNeutralBackground3 }}>
      <CardHeader
        header={<Body1><b>{p.name || p.slug}</b></Body1>}
        description={<Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{p.description || 'No description'}</Caption1>}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Tooltip content="Open board" relationship="label">
              <Button icon={<Next24Regular />} appearance="subtle" onClick={() => onOpen?.(p.slug)} />
            </Tooltip>
            {p.repo && (
              <Tooltip content="Open repo" relationship="label">
                <Button icon={<Open24Regular />} appearance="subtle" onClick={() => window.open(`https://github.com/${p.repo}`, '_blank')} />
              </Tooltip>
            )}
            <Tooltip content="Sync" relationship="label">
              <Button icon={<ArrowSync24Regular />} appearance="subtle" onClick={() => onProjectChanged?.()} />
            </Tooltip>
          </div>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MetricRow label="Mode" value={<Badge appearance="filled" color={p.mode === 'github' ? 'brand' : p.mode === 'hybrid' ? 'important' : 'informative'}>{p.mode}</Badge>} />
        <MetricRow label="Repo" value={p.repo || '—'} />
        <MetricRow label="Stages" value={stats?.stage_count ?? '—'} />
        <MetricRow label="Open tasks" value={stats?.open_tasks ?? '—'} />
        <MetricRow label="Done tasks" value={stats?.done_tasks ?? '—'} />
        <MetricRow label="Tokens used" value={typeof tokenUsed === 'number' ? tokenUsed.toLocaleString() : tokenUsed} />
        <MetricRow label="Tokens remaining" value={typeof tokenRemaining === 'number' ? tokenRemaining.toLocaleString() : tokenRemaining} />
        <MetricRow label="Last action" value={lastAction} />
        <MetricRow label="Next action" value={nextAction} />
        <MetricRow label="Team" value={team} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        {typeof stats?.triage_tasks === 'number' && <Badge appearance="tint">triage: {stats.triage_tasks}</Badge>}
        {typeof stats?.ready_tasks === 'number' && <Badge appearance="tint">ready: {stats.ready_tasks}</Badge>}
        {typeof stats?.in_progress_tasks === 'number' && <Badge appearance="tint">in_progress: {stats.in_progress_tasks}</Badge>}
        {typeof stats?.blocked_tasks === 'number' && <Badge appearance="tint">blocked: {stats.blocked_tasks}</Badge>}
        {typeof stats?.archived_tasks === 'number' && <Badge appearance="tint">archived: {stats.archived_tasks}</Badge>}
      </div>
      <div style={{ marginTop: 8 }}>
        <TokenBar used={typeof tokenUsed === 'number' ? tokenUsed : undefined} budget={typeof tokenBudget === 'number' ? tokenBudget : undefined} />
      </div>
      {teamList.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {teamList.slice(0, 4).map((name) => (
            <Avatar key={name} name={name} color="colorful" size={24} />
          ))}
          {teamList.length > 4 && (
            <Badge appearance="tint">{`+${teamList.length - 4}`}</Badge>
          )}
        </div>
      )}
      {labels.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {labels.slice(0, 5).map((l) => (
            <Badge key={l} appearance="outline">{l}</Badge>
          ))}
          {labels.length > 5 && (
            <Badge appearance="tint">{`+${labels.length - 5}`}</Badge>
          )}
        </div>
      )}
  {typeof stats?.stage_count === 'number' && (
        <div style={{ marginTop: 8 }}>
          <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>Stage distribution</Caption1>
          <div style={{ display: 'flex', height: 6, borderRadius: 4, overflow: 'hidden', border: `1px solid ${tokens.colorNeutralStroke2}` }}>
    {(includeClosed ? ['triage_tasks','ready_tasks','in_progress_tasks','blocked_tasks','done_tasks'] : ['triage_tasks','ready_tasks','in_progress_tasks','blocked_tasks']).map((key, idx) => {
              const val = stats?.[key] || 0;
      const total = (stats?.triage_tasks||0)+(stats?.ready_tasks||0)+(stats?.in_progress_tasks||0)+(stats?.blocked_tasks||0)+ (includeClosed ? (stats?.done_tasks||0) : 0);
              const width = total ? Math.max(1, Math.round((val/total)*100)) : 0;
              const opacities = [0.25, 0.4, 0.6, 0.8, 1];
              return <div key={key} style={{ width: `${width}%`, background: tokens.colorBrandBackground, opacity: opacities[idx] }} />
            })}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <Input size="small" placeholder="Quick add task" value={quickTitle} onChange={(e, d) => setQuickTitle(d.value)} />
  <Button data-appearance="primary" size="small" appearance="primary" disabled={!quickTitle.trim()} onClick={async () => {
          const title = quickTitle.trim();
          setQuickTitle('');
          try {
            const res = await createTask(p.slug, { title });
            if (p.mode === 'hybrid' && p.repo && res?.result?.id) {
              try {
                const created = await createIssue(p.repo, title);
                if (created?.number) {
                  await updateTask(res.result.id, { github_repo: p.repo, github_issue_number: created.number });
                }
              } catch (e) { void e; }
            }
          } finally {
            onProjectChanged?.();
          }
        }}>Add</Button>
      </div>
    </Card>
  );
}

export default function ProjectCards({ projects, statsById, onOpen, onProjectChanged, includeClosed }: { projects: Project[]; statsById?: Record<string, any>; onOpen?: (slug: string) => void; onProjectChanged?: () => void; includeClosed?: boolean; }) {
  if (!projects?.length) return <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>No projects yet. Create one from the left sidebar.</Caption1>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} stats={statsById?.[p.id] || statsById?.[p.slug]} onOpen={onOpen} onProjectChanged={onProjectChanged} includeClosed={includeClosed} />
      ))}
    </div>
  );
}
