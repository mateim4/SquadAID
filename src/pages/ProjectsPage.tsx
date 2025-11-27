import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Body1, Button, Caption1, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Divider, Input, Label, Select, Textarea, Title2, Title3, tokens, Checkbox, Tooltip, RadioGroup, Radio } from '@fluentui/react-components';
import { Dismiss24Regular, Add24Regular } from '@fluentui/react-icons';
import { useStyles } from '@/styles/useStyles';
import { createStage, createTask, getProjectBySlug, listProjects, listStages, listTasks, setProjectMode, upsertProject, updateProject, listWorkflows, updateTask, updateTaskStatus, linkTaskToStage, listProjectStats } from '@/services/surreal';
import { Project, ProjectMode } from '@/types';
import ProjectCards from '@/components/projects/ProjectCards';
import { createIssueComment, createIssue, getRepoIssues, updateIssue, setIssueLabels, getIssueComments, hasGitHubToken, beginDeviceFlow, pollDeviceToken, listViewerRepos, listOrgRepos, listUserOrgs, listBranches, getRepo, createRepoForOrg, createRepoForUser, getUser } from '@/services/github';
import GitHubSignIn from '@/components/auth/GitHubSignIn';
import { useWorkflowStore } from '@/store/workflowStore';
import { agents } from '@/data/agents';
import { useProjectStore } from '@/store/projectStore';
import { invoke } from '@tauri-apps/api/tauri';
import { Event, listen } from '@tauri-apps/api/event';
import { isTauri } from '@/services/platform';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ContentCard from '@/components/layout/ContentCard';

type ProjectsRender = (sections: { left: React.ReactNode; content: React.ReactNode; right: React.ReactNode }) => JSX.Element;
type ProjectsPageProps = { render?: ProjectsRender };

export default function ProjectsPage({ render }: ProjectsPageProps) {
  const styles = useStyles();
  const isMobile = useMediaQuery('(max-width: 700px)');
  const isNarrow = useMediaQuery('(max-width: 1000px)');
  const setProjectInfo = useProjectStore(s => s.setProjectInfo);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState<any[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('default');
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  const [mode, setMode] = useState<ProjectMode>('local');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState<string[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [pulls, setPulls] = useState<any[]>([]);
  const [ghStatus, setGhStatus] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newProjSlug, setNewProjSlug] = useState('');
  const [newProjName, setNewProjName] = useState('');
  const [linkInputs, setLinkInputs] = useState<Record<string, string>>({});
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  // Create Project dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<'local' | 'hybrid' | 'github'>('local');
  const [createName, setCreateName] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [createRepo, setCreateRepo] = useState('');
  const [createBranch, setCreateBranch] = useState('');
  const [ghAuthed, setGhAuthed] = useState<boolean>(false);
  const [repoOptions, setRepoOptions] = useState<any[]>([]);
  const [repoQuery, setRepoQuery] = useState('');
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [isAuthInProgress, setIsAuthInProgress] = useState(false);
  // Create Project dialog – GitHub sign-in status (so users see instructions/errors inline)
  const [createGhMsg, setCreateGhMsg] = useState('');
  // Create-repo modal state
  const [isCreateRepoOpen, setIsCreateRepoOpen] = useState(false);
  const [ownerChoice, setOwnerChoice] = useState<'user' | 'org'>('user');
  const [ownerLogin, setOwnerLogin] = useState('');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [newRepoInit, setNewRepoInit] = useState(true);
  const [createRepoBusy, setCreateRepoBusy] = useState(false);
  const [createRepoError, setCreateRepoError] = useState('');
  const [createError, setCreateError] = useState('');
  const sanitizeSlug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  const titleCase = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  // Sidebars are fixed (non-collapsible) per design guidance
  // Task dialog state
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [taskLogs, setTaskLogs] = useState('');
  const logsRef = useRef('');
  useEffect(() => { logsRef.current = taskLogs; }, [taskLogs]);
  const [isRunning, setIsRunning] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | ''>('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLabels, setEditLabels] = useState('');
  const [editAssignees, setEditAssignees] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [view, setView] = useState<'overview' | 'board'>(() => (localStorage.getItem('projects.view') as any) || 'overview');
  const [overviewSort, setOverviewSort] = useState<'activity' | 'open' | 'name'>(() => (localStorage.getItem('projects.sort') as any) || 'activity');
  const [overviewMode, setOverviewMode] = useState<'all' | ProjectMode>(() => (localStorage.getItem('projects.mode') as any) || 'all');
  const [overviewMember, setOverviewMember] = useState<'all' | string>(() => localStorage.getItem('projects.member') || 'all');
  const [overviewLabel, setOverviewLabel] = useState<string>(() => localStorage.getItem('projects.label') || '');
  const [overviewRepo, setOverviewRepo] = useState<string>(() => localStorage.getItem('projects.repo') || '');
  const [overviewActiveOnly, setOverviewActiveOnly] = useState<boolean>(() => localStorage.getItem('projects.activeOnly') === '1');
  const [overviewIncludeClosed, setOverviewIncludeClosed] = useState<boolean>(() => localStorage.getItem('projects.includeClosed') === '1');
  const [overviewSearch, setOverviewSearch] = useState<string>(() => localStorage.getItem('projects.search') || '');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('projects.mobileFiltersOpen') === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('projects.mobileFiltersOpen', mobileFiltersOpen ? '1' : '0'); } catch {}
  }, [mobileFiltersOpen]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoadingProjects(true);
        const [res, stats] = await Promise.all([listProjects(), listProjectStats().catch(() => ({ result: [] }))]);
  setProjects(res.result || []);
  setProjectStats(stats.result || []);
      } catch (e) {
        // DB offline
  setProjects([]);
  setProjectStats([]);
      } finally {
        setIsLoadingProjects(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProjectBySlug(activeSlug);
        const p = (res.result && res.result[0]) as Project | undefined;
        if (p) {
          setProject(p);
          const nextMode = ((p as any).mode || 'local') as ProjectMode;
          const nextRepo = ((p as any).repo || '') as string;
          const storedBranch = ((p as any).default_branch || '') as string;
          // expose globally for gating
          try { setProjectInfo({ slug: (p as any).slug, mode: nextMode, repo: nextRepo }); } catch {}
          setMode(nextMode);
          setRepo(nextRepo);
          setBranch(storedBranch || '');
          try {
            const st = await listStages(activeSlug);
            setStages(st.result || []);
          } catch { setStages([]); }
          // load branches if repo is present
          if (nextRepo) {
            try {
              const [bs, info] = await Promise.all([
                listBranches(nextRepo).catch(() => []),
                getRepo(nextRepo).catch(() => null),
              ]);
              const names = Array.isArray(bs) ? bs.map((b: any) => b.name) : [];
              setBranches(names);
              if (!storedBranch) {
                const def = (info as any)?.default_branch || 'main';
                setBranch(def);
                try { await updateProject((p as any).slug, { default_branch: def }); } catch {}
              }
            } catch {}
          } else {
            setBranches([]);
          }
          if (nextMode === 'github' && nextRepo) {
            try {
              const issues = await getRepoIssues(repo, 'open');
              setTasks(issues);
              setGhStatus(`Loaded ${issues.length} issue(s) from ${nextRepo}`);
            } catch (e: any) {
              setGhStatus(`GitHub error: ${e?.message || String(e)}`);
              setTasks([]);
            }
          } else {
            try {
              const tk = await listTasks(activeSlug);
              setTasks(tk.result || []);
            } catch { setTasks([]); }
            setGhStatus('');
          }
        } else {
          setProject(null);
          setStages([]);
          setTasks([]);
          setGhStatus('');
          try { setProjectInfo({ slug: undefined, mode: undefined, repo: undefined }); } catch {}
        }
      } catch {
        // DB offline
        setProject(null);
        setStages([]);
        setTasks([]);
        setGhStatus('Database offline');
      }
    })();
  }, [activeSlug]);

  useEffect(() => {
    try { localStorage.setItem('projects.view', view); } catch {}
  }, [view]);

  useEffect(() => {
    try { localStorage.setItem('projects.sort', overviewSort); } catch {}
  }, [overviewSort]);
  useEffect(() => {
    try { localStorage.setItem('projects.mode', overviewMode); } catch {}
  }, [overviewMode]);
  useEffect(() => {
    try { localStorage.setItem('projects.member', overviewMember); } catch {}
  }, [overviewMember]);
  useEffect(() => {
    try { localStorage.setItem('projects.label', overviewLabel); } catch {}
  }, [overviewLabel]);
  useEffect(() => {
    try { localStorage.setItem('projects.repo', overviewRepo); } catch {}
  }, [overviewRepo]);
  useEffect(() => {
    try { localStorage.setItem('projects.activeOnly', overviewActiveOnly ? '1' : '0'); } catch {}
  }, [overviewActiveOnly]);
  useEffect(() => {
    try { localStorage.setItem('projects.includeClosed', overviewIncludeClosed ? '1' : '0'); } catch {}
  }, [overviewIncludeClosed]);
  useEffect(() => {
    try { localStorage.setItem('projects.search', overviewSearch); } catch {}
  }, [overviewSearch]);

  // Determine if the current board (canvas/team) includes agents that require a GitHub repo
  const boardRequiresRepo = useMemo(() => {
    try {
      const { nodes } = useWorkflowStore.getState();
      const requires = new Set(['jules_bridge','copilot_bridge']);
      return nodes.some((n: any) => {
        const agentId = (n.data as any)?.agentId as string | undefined;
        const agent = agents.find((a) => a.id === agentId);
        const type = agent?.backendType || agentId || n.type;
        return requires.has(type);
      });
    } catch { return false; }
  }, [activeSlug, view]);

  const refreshProjectLists = async () => {
    try {
      setIsLoadingProjects(true);
      const [res, stats] = await Promise.all([listProjects(), listProjectStats().catch(() => ({ result: [] }))]);
      setProjects(res.result || []);
      setProjectStats(stats.result || []);
    } finally { setIsLoadingProjects(false); }
  };

  // Load GH auth state when create dialog opens
  useEffect(() => {
    (async () => {
      const ok = await hasGitHubToken().catch(() => false);
      setGhAuthed(ok);
      if (ok) {
        try {
          const u = await getUser();
          setCreateGhMsg(`Connected as ${u.login}`);
        } catch {}
      } else {
        setCreateGhMsg('');
      }
    })();
  }, [isCreateOpen]);

  async function refreshTasks() {
    if (!project) return;
    if (mode === 'github') {
      if (!repo) { setGhStatus('Set repo as owner/name to load issues.'); setTasks([]); return; }
      try {
        const issues = await getRepoIssues(repo, 'open');
        setTasks(issues);
        setGhStatus(`Loaded ${issues.length} issue(s) from ${repo}`);
      } catch (e: any) {
        setGhStatus(`GitHub error: ${e?.message || String(e)}`);
        setTasks([]);
      }
      try {
        const { listPullRequests } = await import('@/services/github');
        const prs = await listPullRequests(repo, 'open');
        setPulls(prs || []);
      } catch { setPulls([]); }
    } else if (mode === 'hybrid') {
      // Load local tasks and reconcile from GitHub for linked issues
      const tk = await listTasks(activeSlug);
      const localTasks = (tk.result || []) as any[];
      setTasks(localTasks);
      if (repo) {
        try {
          // Load all issues (open + closed) to reflect state accurately
          const issues = await getRepoIssues(repo, 'all');
          const byNum = new Map<number, any>();
          for (const i of issues) byNum.set(i.number, i);
          for (const t of localTasks) {
            if (t.github_issue_number && byNum.has(t.github_issue_number)) {
              const gh = byNum.get(t.github_issue_number);
              const desiredStatus = gh.state === 'closed' ? 'done' : (t.status || 'triage');
              const patch: any = {};
              if (t.title !== gh.title) patch.title = gh.title;
              if (t.status !== desiredStatus) patch.status = desiredStatus;
              if (Array.isArray(gh.labels)) {
                const names = gh.labels.map((l: any) => (typeof l === 'string' ? l : l.name)).filter(Boolean);
                if (JSON.stringify(t.labels || []) !== JSON.stringify(names)) patch.labels = names;
              }
              if (Array.isArray(gh.assignees)) {
                const logins = gh.assignees.map((a: any) => a?.login).filter(Boolean);
                if (JSON.stringify(t.assignees || []) !== JSON.stringify(logins)) patch.assignees = logins;
              }
              if (Object.keys(patch).length) {
                try { await updateTask(t.id, patch); } catch {}
              }
            }
          }
        } catch (e: any) {
          setGhStatus(`GitHub error: ${e?.message || String(e)}`);
        }
      }
    } else {
      const tk = await listTasks(activeSlug);
      setTasks(tk.result || []);
    }
  }

  // Poll two-way sync for GitHub-only and Hybrid
  useEffect(() => {
    if (!project) return;
    if (!['github', 'hybrid'].includes(mode)) return;
    const id = setInterval(() => { refreshTasks().catch(() => {}); }, 15000);
    return () => clearInterval(id);
  }, [project?.slug, mode, repo]);

  // When Task dialog is open for a linked GH issue, refresh comments periodically
  useEffect(() => {
    if (!isTaskOpen || !selectedTask || !repo || !selectedTask.github_issue_number) return;
    let active = true;
    const load = async () => {
      try {
        const cs = await getIssueComments(repo, selectedTask.github_issue_number);
        if (active) setComments(cs || []);
      } catch {}
    };
    load();
    const id = setInterval(load, 15000);
    return () => { active = false; clearInterval(id); };
  }, [isTaskOpen, selectedTask?.id, selectedTask?.github_issue_number, repo]);

  const rightSidebar = (
    <aside className={styles.sidebar} aria-label="Tasks sidebar">
      <div className={styles.sidebarHeader}>
        <Title3>Tasks</Title3>
      </div>
      {/* Top padded section (non-scrolling) */}
      <div style={{ padding: isMobile ? '0 12px 8px' : '0 16px 12px' }}>
        {mode === 'github' ? (
          <>
            <Body1 style={{ color: tokens.colorNeutralForeground2 }}>GitHub-only mode: tasks come from repo issues.</Body1>
            <div style={{ display: 'flex', gap: 8, marginTop: isMobile ? 6 : 8 }}>
              <Button className={styles.frostedButtonWide} onClick={refreshTasks}>Refresh</Button>
            </div>
            {ghStatus && <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{ghStatus}</Caption1>}
            {repo && (
              <div style={{ marginTop: 10 }}>
                <Divider style={{ margin: '8px 0' }} />
                <Body1><b>Open Pull Requests</b></Body1>
                {(pulls || []).slice(0, 10).map((pr: any) => (
                  <div key={pr.id} style={{ padding: '8px 10px', border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: 8, marginTop: 6 }}>
                    <a href={pr.html_url} target="_blank" rel="noreferrer">#{pr.number} {pr.title}</a>
                    <div><Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{pr.user?.login} • {pr.state}</Caption1></div>
                  </div>
                ))}
                {pulls?.length === 0 && <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>No open PRs</Caption1>}
              </div>
            )}
          </>
        ) : null}
      </div>
      <Divider style={{ margin: '12px 0' }} />
      {/* Scrollable list */}
      <div className={styles.sidebarContent} style={isMobile ? { padding: '8px 12px 12px' } : undefined}>
        {(tasks || []).map(t => {
          const isGh = mode === 'github' && t.number; // GitHub issue shape
          const title = isGh ? t.title : t.title;
          const status = isGh ? t.state : (t.status || 'triage');
          return (
    <div key={t.id || t.number} style={{ padding: 10, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: 8, marginBottom: 10, cursor: mode !== 'github' ? 'pointer' : 'default' }}
                 onClick={async () => {
                   if (mode === 'github') return; // open dialog only for local/hybrid tasks
                   setSelectedTask(t);
                   setTaskLogs('');
                   setIsTaskOpen(true);
                   try {
                     const w = await listWorkflows(activeSlug);
                     setWorkflows(w.result || []);
                     setSelectedWorkflowId(t.workflow_id || '');
                     setEditTitle(t.title || '');
                     setEditDesc(t.description || '');
                     setEditLabels(Array.isArray(t.labels) ? t.labels.join(', ') : '');
                     setEditAssignees(Array.isArray(t.assignees) ? t.assignees.join(', ') : '');
                     if (t.github_issue_number && repo) {
                       try { const cs = await getIssueComments(repo, t.github_issue_number); setComments(cs || []); } catch { setComments([]); }
                     } else { setComments([]); }
                   } catch {}
                 }}>
              <Body1><b>{title}</b></Body1>
              <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{status}</Caption1>
              {mode === 'hybrid' && !t.github_issue_number && repo && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <Input size="small" placeholder="Link issue #"
                         value={linkInputs[t.id] || ''}
                         onChange={(e, d) => setLinkInputs(prev => ({ ...prev, [t.id]: d.value }))} />
                  <Button size="small" onClick={async () => {
                    const num = parseInt(linkInputs[t.id], 10);
                    if (!Number.isFinite(num)) return;
                    await (await import('@/services/surreal')).updateTask(t.id, { github_repo: repo, github_issue_number: num });
                    setLinkInputs(prev => ({ ...prev, [t.id]: '' }));
                    await refreshTasks();
                  }}>Link</Button>
                </div>
              )}
              {mode === 'github' && t.html_url && (
                <div style={{ marginTop: 6 }}>
                  <a href={t.html_url} target="_blank" rel="noreferrer">Open on GitHub</a>
                </div>
              )}
            </div>
          );
        })}
        {mode !== 'github' && (
          <div style={{ marginTop: 8 }}>
            {!showNewTask ? (
              <Button className={styles.frostedButtonWide} appearance="subtle" icon={<Add24Regular />} onClick={() => setShowNewTask(true)}>Add Task</Button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: 12 }}>
                <Label>Title</Label>
                <Input value={newTaskTitle} onChange={(e, d) => setNewTaskTitle(d.value)} placeholder="Task title" />
                <Label>Description</Label>
                <Textarea value={newTaskDesc} onChange={(e, d) => setNewTaskDesc(d.value)} rows={3} placeholder="Optional details" />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button appearance="secondary" onClick={() => { setShowNewTask(false); setNewTaskTitle(''); setNewTaskDesc(''); }}>Cancel</Button>
                  <Button data-appearance="primary" className={styles.confirmButton} appearance="primary" disabled={!newTaskTitle || !project} onClick={async () => {
                    const res = await createTask(activeSlug, { title: newTaskTitle, description: newTaskDesc });
                    setNewTaskTitle(''); setNewTaskDesc(''); setShowNewTask(false);
                    if (mode === 'hybrid' && repo) {
                      try {
                        const created = await createIssue(repo, res.result?.title || newTaskTitle);
                        if (res.result?.id && created?.number) {
                          await (await import('@/services/surreal')).updateTask(res.result.id, { github_repo: repo, github_issue_number: created.number });
                        }
                      } catch {}
                    }
                    await refreshTasks();
                  }}>Create</Button>
                </div>
              </div>
            )}
          </div>
        )}
  </div>
    </aside>
  );

  const leftSidebar = (
    <aside className={styles.sidebar} aria-label="Projects sidebar">
      <div className={styles.sidebarHeader}>
        <Title3>Projects</Title3>
      </div>
      <div className={styles.sidebarContent}>
  {(projects || []).map(p => {
          const stats = (projectStats || []).find((s: any) => s.id === p.id || s.slug === p.slug);
          const openCount = stats?.open_tasks;
          return (
            <div
              key={p.id}
              style={{
                padding: 8,
                borderRadius: 6,
                cursor: 'pointer',
                background: p.slug === activeSlug ? 'rgba(255,255,255,0.08)' : undefined,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                maxWidth: '100%',
              }}
              onClick={() => { setActiveSlug(p.slug); setView('board'); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, width: '100%' }}>
                <Body1 as="span" style={{
                  fontWeight: 600,
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginRight: 6,
                }}>{p.name || p.slug}</Body1>
                {typeof openCount === 'number' && (
                  <span style={{
                    fontSize: 12,
                    color: tokens.colorNeutralForeground2,
                    flexShrink: 0,
                    background: tokens.colorNeutralBackground4,
                    borderRadius: 8,
                    padding: '0 6px',
                    marginLeft: 2,
                    maxWidth: 48,
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>Open: {openCount}</span>
                )}
              </div>
              <Caption1 style={{
                color: tokens.colorNeutralForeground2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
                maxWidth: '100%',
              }}>{p.description || 'No description'}</Caption1>
            </div>
          );
        })}
        <div style={{ marginTop: 8 }}>
          <Button className={styles.frostedButtonWide} appearance="subtle" icon={<Add24Regular />} onClick={() => {
            setIsCreateOpen(true);
            setCreateType('local');
            setCreateName('');
            setCreateSlug('');
            setCreateRepo('');
            setCreateError('');
          }}>Add Project</Button>
        </div>
      </div>
      {view === 'board' && mode === 'local' && boardRequiresRepo && (
        <div style={{ marginTop: 8, padding: 10, border: `1px solid ${tokens.colorPaletteRedBorder2}`, borderRadius: 8, background: 'rgba(255,0,0,0.05)' }}>
          <Body1 style={{ color: tokens.colorPaletteRedForeground2 }}>
            This team uses agents that require GitHub. Switch the project to Hybrid or GitHub-only and select a repository to run.
          </Body1>
        </div>
      )}
    </aside>
  );

  const content = (
    <ContentCard>
      {view === 'overview' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isLoadingProjects ? (
            <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>Loading projects…</Caption1>
          ) : (() => {
            const statsById: Record<string, any> = {};
            for (const s of projectStats || []) { statsById[s.id || s.slug] = s; }
            // filter by mode
            const filtered = (projects || []).filter((p: any) => {
              if (!(overviewMode === 'all' ? true : p.mode === overviewMode)) return false;
              if (overviewRepo && overviewRepo.trim()) {
                const q = overviewRepo.trim().toLowerCase();
                if (!((p.repo || '').toLowerCase().includes(q))) return false;
              }
              if (overviewSearch && overviewSearch.trim()) {
                const q = overviewSearch.trim().toLowerCase();
                const hay = `${p.name || ''} ${p.slug || ''} ${p.description || ''}`.toLowerCase();
                if (!hay.includes(q)) return false;
              }
              if (overviewMember !== 'all') {
                const team = Array.isArray(p.props?.team) ? p.props.team as string[] : (typeof p.props?.team === 'string' ? [p.props.team] : []);
                if (!team.includes(overviewMember)) return false;
              }
              if (overviewLabel && overviewLabel.trim()) {
                const labels = Array.isArray(p.props?.labels) ? p.props.labels as string[] : [];
                const q = overviewLabel.trim().toLowerCase();
                if (!labels.some((l) => (l || '').toLowerCase().includes(q))) return false;
              }
              if (overviewActiveOnly) {
                const s = statsById[p.id] || statsById[p.slug] || {};
                if ((s.open_tasks || 0) <= 0) return false;
              }
              return true;
            });
            // sort
            const sorted = [...filtered].sort((a: any, b: any) => {
              const sa = statsById[a.id] || statsById[a.slug] || {};
              const sb = statsById[b.id] || statsById[b.slug] || {};
              if (overviewSort === 'name') return (a.name || a.slug).localeCompare(b.name || b.slug);
              if (overviewSort === 'open') return (sb.open_tasks || 0) - (sa.open_tasks || 0);
              const ta = sa.last_task_update || a.updated_at || a.created_at || '';
              const tb = sb.last_task_update || b.updated_at || b.created_at || '';
              return new Date(tb).getTime() - new Date(ta).getTime();
            });
            return (
              <ProjectCards
                projects={sorted as Project[]}
                statsById={statsById}
                onOpen={(slug) => {
                  setActiveSlug(slug);
                  setView('board');
                }}
                onProjectChanged={refreshProjectLists}
                includeClosed={overviewIncludeClosed}
              />
            );
          })()}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div>
              <Label>Mode</Label>
              <Select value={mode} onChange={async (e) => {
                const next = (e.target as HTMLSelectElement).value as ProjectMode;
                setMode(next);
                if (project) {
                  await setProjectMode(project.slug, next);
                  await refreshTasks();
                }
              }}>
                <option value="local">Local only</option>
                <option value="github">GitHub only</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </div>
            <div>
              <Label>Repo (owner/name)</Label>
              <Input value={repo} onChange={(e, d) => setRepo(d.value)} onBlur={async () => {
                if (project) {
                  try { await updateProject(project.slug, { repo }); } catch {}
                  // reload branches
                  if (repo) {
                    try {
                      const [bs, info] = await Promise.all([
                        listBranches(repo).catch(() => []),
                        getRepo(repo).catch(() => null),
                      ]);
                      const names = Array.isArray(bs) ? bs.map((b: any) => b.name) : [];
                      setBranches(names);
                      const def = (info as any)?.default_branch || '';
                      if (def) { setBranch(def); try { await updateProject(project.slug, { default_branch: def }); } catch {} }
                    } catch {}
                  } else {
                    setBranches([]);
                    setBranch('');
                  }
                }
                await refreshTasks();
              }} placeholder="owner/repo" />
            </div>
            <div>
              <Label>Branch</Label>
              <Select value={branch} onChange={async (e) => {
                const sel = (e.target as HTMLSelectElement).value;
                setBranch(sel);
                if (project) { try { await updateProject(project.slug, { default_branch: sel }); } catch {} }
              }}>
                <option value="">(default)</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <Button onClick={refreshProjectLists}>Refresh</Button>
            </div>
          </div>
          <Divider />
          <Title3>Stages</Title3>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={newStageTitle} onChange={(e, d) => setNewStageTitle(d.value)} placeholder="e.g., Stage 1: Architecture" />
            <Button data-appearance="primary" className={styles.confirmButton} appearance="primary" disabled={!newStageTitle} onClick={async () => {
              try { await createStage(activeSlug, newStageTitle); } catch {}
              setNewStageTitle('');
              try { const st = await listStages(activeSlug); setStages(st.result || []); } catch { setStages([]); }
            }}>Add Stage</Button>
          </div>
          {mode === 'github' ? (
            <Body1 style={{ color: tokens.colorNeutralForeground2 }}>In GitHub-only mode, tasks are managed as issues in {repo || '(set repo)'}. Use the right sidebar to refresh and open issues.</Body1>
          ) : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 8 }}>
              {(stages || []).map((s) => {
                const stageTasks = (tasks || []).filter((t: any) => t.stage === s.id);
                return (
                  <div key={s.id} style={{ minWidth: 280, maxWidth: 320, padding: 12, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: 8, background: 'transparent' }}>
                    <Body1><b>{s.title}</b></Body1>
                    <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{s.description || 'No description'}</Caption1>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <Input size="small" value={linkInputs[`add-${s.id}`] || ''} onChange={(e, d) => setLinkInputs(prev => ({ ...prev, [`add-${s.id}`]: d.value }))} placeholder="Add task title" />
                      <Button data-appearance="primary" className={styles.confirmButton} size="small" appearance="primary" disabled={!linkInputs[`add-${s.id}`]} onClick={async () => {
                        const title = linkInputs[`add-${s.id}`];
                        const res = await createTask(activeSlug, { title, stageId: s.id });
                        setLinkInputs(prev => ({ ...prev, [`add-${s.id}`]: '' }));
                        if (mode === 'hybrid' && repo) {
                          try {
                            const created = await createIssue(repo, res.result?.title || title);
                            if (res.result?.id && created?.number) {
                              await updateTask(res.result.id, { github_repo: repo, github_issue_number: created.number });
                            }
                          } catch {}
                        }
                        await refreshTasks();
                      }}>Add</Button>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {stageTasks.length === 0 && (
                        <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>No tasks</Caption1>
                      )}
                      {stageTasks.map((t: any) => (
                        <div key={t.id} style={{ padding: 8, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: 6, background: 'transparent', cursor: 'pointer' }}
                             onClick={async () => { setSelectedTask(t); setTaskLogs(''); setIsTaskOpen(true); try { const w = await listWorkflows(activeSlug); setWorkflows(w.result || []); setSelectedWorkflowId(t.workflow_id || ''); setEditTitle(t.title || ''); setEditDesc(t.description || ''); setEditLabels(Array.isArray(t.labels) ? t.labels.join(', ') : ''); setEditAssignees(Array.isArray(t.assignees) ? t.assignees.join(', ') : ''); if (t.github_issue_number && repo) { try { const cs = await getIssueComments(repo, t.github_issue_number); setComments(cs || []); } catch { setComments([]); } } else { setComments([]); } } catch {} }}>
                          <Body1><b>{t.title}</b></Body1>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{t.status}</Caption1>
                            <Select size="small" value={t.stage || ''} onClick={(e) => e.stopPropagation()} onChange={async (e) => {
                              const nextStage = (e.target as HTMLSelectElement).value || null;
                              await linkTaskToStage(t.id, nextStage);
                              await refreshTasks();
                            }}>
                              <option value="">(none)</option>
                              {stages.map((ss: any) => (
                                <option key={ss.id} value={ss.id}>{ss.title}</option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </ContentCard>
  );

  if (render) {
    if (isMobile) {
      // On mobile, we only want to show the active content view, not the sidebars
      const activeContent = activeSlug ? content : leftSidebar;
      return render({
        left: <div style={{ display: 'none' }} />,
        content: activeContent,
        right: <div style={{ display: 'none' }} />,
      });
    }
    return render({
      left: leftSidebar,
      content: content,
      right: rightSidebar,
    });
  }

  // Fallback rendering for non-grid layouts
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {leftSidebar}
      {content}
      {rightSidebar}
    </div>
  );
}
