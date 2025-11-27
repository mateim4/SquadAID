/** SurrealDB client (HTTP) minimal wrapper for app persistence */
type SurrealResult<T = any> = { time: string; status: string; result: T };

const SURREAL_URL = (import.meta.env.VITE_SURREAL_URL as string) || 'http://localhost:8000/sql';
const SURREAL_NS = (import.meta.env.VITE_SURREAL_NS as string) || 'app';
const SURREAL_DB = (import.meta.env.VITE_SURREAL_DB as string) || 'squadaid';
const SURREAL_AUTH = (import.meta.env.VITE_SURREAL_AUTH as string) || '';
const SURREAL_USER = (import.meta.env.VITE_SURREAL_USER as string) || '';
const SURREAL_PASS = (import.meta.env.VITE_SURREAL_PASS as string) || '';

async function query<T = any>(sql: string, vars?: Record<string, unknown>): Promise<SurrealResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'NS': SURREAL_NS,
    'DB': SURREAL_DB,
  };
  if (SURREAL_AUTH) {
    headers['Authorization'] = `Basic ${SURREAL_AUTH}`;
  } else if (SURREAL_USER || SURREAL_PASS) {
    try {
      // Compute Basic header on the fly when user/pass provided
      headers['Authorization'] = `Basic ${btoa(`${SURREAL_USER}:${SURREAL_PASS}`)}`;
    } catch {
      // btoa not available? skip, request will fail and be handled by caller
    }
  }

  // Add a small timeout to avoid hanging when DB is offline
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 5000);
  const res = await fetch(SURREAL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: sql, vars }),
    signal: controller.signal,
  }).finally(() => clearTimeout(to));
  if (!res.ok) throw new Error(`SurrealDB HTTP error ${res.status}`);
  const json = await res.json();
  // Surreal returns an array of statements; return the first for convenience
  return json[0] as SurrealResult<T>;
}

export const surreal = { query };

// App-level helpers
export async function checkSurrealHealth(): Promise<boolean> {
  try {
    const res = await query('RETURN true;');
    return res.status === 'OK';
  } catch {
    return false; // likely DB offline (net::ERR_CONNECTION_REFUSED)
  }
}

export async function upsertProject(slug: string, data: { name: string; description?: string; mode?: 'local' | 'github' | 'hybrid'; repo?: string; props?: Record<string, unknown> }) {
  const sql = `
    LET $p = SELECT * FROM project WHERE slug = $slug;
    IF array::len($p) = 0 THEN (
      CREATE project SET slug = $slug, name = $data.name, description = $data.description, mode = $data.mode, repo = $data.repo, props = $data.props;
    ) ELSE (
      UPDATE $p[0] SET name = $data.name, description = $data.description, mode = $data.mode, repo = $data.repo, props = $data.props;
    ) END;
  `;
  return query(sql, { slug, data });
}

export async function listProjects() {
  const sql = `SELECT * FROM project ORDER BY created_at DESC;`;
  return query(sql);
}

// Project summaries/stats for overview cards
export async function listProjectStats() {
  const sql = `
  array::len((SELECT * FROM task WHERE project = id AND status = 'triage')) AS triage_tasks,
  array::len((SELECT * FROM task WHERE project = id AND status = 'ready')) AS ready_tasks,
  array::len((SELECT * FROM task WHERE project = id AND status = 'in_progress')) AS in_progress_tasks,
  array::len((SELECT * FROM task WHERE project = id AND status = 'blocked')) AS blocked_tasks,
  array::len((SELECT * FROM task WHERE project = id AND status = 'archived')) AS archived_tasks
    SELECT id, slug, name, description, repo, mode,
      array::len((SELECT * FROM stage WHERE project = id)) AS stage_count,
      array::len((SELECT * FROM task WHERE project = id AND status != 'done' AND status != 'archived')) AS open_tasks,
      array::len((SELECT * FROM task WHERE project = id AND status = 'done')) AS done_tasks,
  math::max((SELECT VALUE updated_at FROM task WHERE project = id)) AS last_task_update,
  (SELECT VALUE title FROM task WHERE project = id AND status != 'done' AND status != 'archived' ORDER BY created_at ASC LIMIT 1)[0] AS next_task_title
    FROM project
    ORDER BY created_at DESC;
  `;
  return query(sql);
}

export async function getProjectBySlug(slug: string) {
  const sql = `SELECT * FROM project WHERE slug = $slug LIMIT 1;`;
  return query(sql, { slug });
}

export async function setProjectMode(slug: string, mode: 'local' | 'github' | 'hybrid') {
  const sql = `
    LET $p = (SELECT * FROM project WHERE slug = $slug)[0];
    IF !$p THEN RETURN { status: 'error', message: 'project not found' };
    UPDATE $p SET mode = $mode, updated_at = time::now();
  `;
  return query(sql, { slug, mode });
}

export async function updateProject(slug: string, patch: Record<string, unknown>) {
  const sql = `
    LET $p = (SELECT * FROM project WHERE slug = $slug)[0];
    IF !$p THEN RETURN { status: 'error', message: 'project not found' };
    UPDATE $p SET * = merge(object::from($patch), $before), updated_at = time::now();
  `;
  return query(sql, { slug, patch });
}

// Agents helpers (for future seeding of built-ins)
export interface BuiltinAgentSeed {
  name: string;
  description?: string;
  backendType?: string;
  iconKey?: string;
  config?: Record<string, unknown>;
}

export async function upsertBuiltinAgents(items: BuiltinAgentSeed[]) {
  const sql = `
    RETURN (
      FOR $it IN $items THEN (
        LET $existing = (SELECT * FROM agent WHERE kind = 'builtin' AND name = $it.name)[0];
        IF $existing THEN (
          UPDATE $existing SET description = $it.description, backend_type = $it.backendType, icon_key = $it.iconKey, config = $it.config, updated_at = time::now();
        ) ELSE (
          CREATE agent SET kind = 'builtin', name = $it.name, description = $it.description, backend_type = $it.backendType, icon_key = $it.iconKey, config = $it.config;
        ) END
      )
    );
  `;
  return query(sql, { items });
}

export async function listBuiltinAgents() {
  const sql = `SELECT * FROM agent WHERE kind = 'builtin' ORDER BY name ASC;`;
  return query(sql);
}

export async function createWorkflow(projectSlug: string, name: string, description = '', viewport?: any) {
  const sql = `
    LET $proj = (SELECT * FROM project WHERE slug = $project_slug)[0];
    CREATE workflow SET name = $name, description = $description, project = $proj.id, viewport = $viewport, status = 'draft';
  `;
  return query(sql, { project_slug: projectSlug, name, description, viewport });
}

export async function listWorkflows(projectSlug: string) {
  const sql = `
    LET $proj = (SELECT id FROM project WHERE slug = $project_slug)[0].id;
    SELECT * FROM workflow WHERE project = $proj ORDER BY created_at DESC;
  `;
  return query(sql, { project_slug: projectSlug });
}

export type GraphState = { nodes: any[]; edges: any[]; viewport?: any };

export async function saveGraph(workflowId: string, graph: GraphState) {
  const sql = `
    LET $wf = SELECT * FROM $workflowId;
    IF array::len($wf) = 0 THEN RETURN { status: 'error', message: 'workflow not found' };

    -- delete old nodes/edges
    DELETE wf_edge WHERE workflow = $workflowId;
    DELETE wf_node WHERE workflow = $workflowId;

    -- upsert viewport
    UPDATE $workflowId SET viewport = $viewport, updated_at = time::now();

    -- create nodes
    RETURN (
      FOR $n IN $nodes THEN (
        CREATE wf_node SET workflow = $workflowId, key = $n.id, type = $n.type, label = $n.data.label,
          name = $n.data.name, data = $n.data, position = $n.position, agent = $n.data.agentRef;
      )
    );
  `;
  await query(sql, { workflowId, nodes: graph.nodes, viewport: graph.viewport || { x: 0, y: 0, zoom: 1 } });

  // create edges in a separate query to resolve node refs by key
  const edgeSql = `
    LET $wf = SELECT * FROM $workflowId;
    RETURN (
      FOR $e IN $edges THEN (
        LET $src = (SELECT * FROM wf_node WHERE workflow = $workflowId AND key = $e.source)[0];
        LET $dst = (SELECT * FROM wf_node WHERE workflow = $workflowId AND key = $e.target)[0];
        RELATE $src -> wf_edge -> $dst SET workflow = $workflowId, type = 'default',
          source_handle = $e.sourceHandle, target_handle = $e.targetHandle,
          label = $e.label, condition = $e.data.condition;
      )
    );
  `;
  return query(edgeSql, { workflowId, edges: graph.edges });
}

export async function loadGraph(workflowId: string) {
  const sql = `
    LET $wf = (SELECT * FROM $workflowId)[0];
    LET $nodes = SELECT id, key, type, label, name, data, position FROM wf_node WHERE workflow = $workflowId;
  LET $edges = SELECT id, in AS target, out AS source, source_handle, target_handle, label, condition FROM wf_edge WHERE workflow = $workflowId;
    RETURN { workflow: $wf, nodes: $nodes, edges: $edges };
  `;
  return query(sql, { workflowId });
}

// --- Stages ---
export async function createStage(projectSlug: string, title: string, description = '') {
  const sql = `
    LET $proj = (SELECT * FROM project WHERE slug = $project_slug)[0];
    LET $count = array::len(SELECT * FROM stage WHERE project = $proj.id);
    CREATE stage SET project = $proj.id, index = $count, title = $title, description = $description;
  `;
  return query(sql, { project_slug: projectSlug, title, description });
}

export async function listStages(projectSlug: string) {
  const sql = `
    LET $proj = (SELECT id FROM project WHERE slug = $project_slug)[0].id;
    SELECT * FROM stage WHERE project = $proj ORDER BY index ASC;
  `;
  return query(sql, { project_slug: projectSlug });
}

export async function reorderStages(projectSlug: string, orderedIds: string[]) {
  const sql = `
    LET $proj = (SELECT id FROM project WHERE slug = $project_slug)[0].id;
    RETURN (
      FOR $i, $sid IN array::enumerate($ids) THEN (
        UPDATE $sid SET index = $i WHERE project = $proj;
      )
    );
  `;
  return query(sql, { project_slug: projectSlug, ids: orderedIds });
}

// --- Tasks ---
export async function createTask(projectSlug: string, payload: { title: string; description?: string; stageId?: string; labels?: string[]; priority?: number; assignees?: string[]; workflow_id?: string; github_repo?: string; github_issue_number?: number; }) {
  const sql = `
    LET $proj = (SELECT * FROM project WHERE slug = $project_slug)[0];
    CREATE task SET project = $proj.id, stage = $stageId, title = $title, description = $description,
    status = 'triage', labels = $labels, priority = $priority, assignees = $assignees, workflow_id = $workflow_id,
    github_repo = $github_repo, github_issue_number = $github_issue_number;
  `;
  return query(sql, { project_slug: projectSlug, ...payload });
}

export async function listTasks(projectSlug: string, stageId?: string) {
  const sql = `
    LET $proj = (SELECT id FROM project WHERE slug = $project_slug)[0].id;
    SELECT * FROM task WHERE project = $proj AND ( $stageId IS NONE OR stage = $stageId ) ORDER BY created_at DESC;
  `;
  return query(sql, { project_slug: projectSlug, stageId: stageId || null });
}

export async function updateTask(taskId: string, patch: Record<string, unknown>) {
  const sql = `UPDATE $taskId SET updated_at = time::now(), * = merge(object::from($patch), $before) RETURN AFTER;`;
  return query(sql, { taskId, patch });
}

export async function updateTaskStatus(taskId: string, status: 'triage' | 'ready' | 'in_progress' | 'blocked' | 'done' | 'archived') {
  const sql = `UPDATE $taskId SET status = $status, updated_at = time::now();`;
  return query(sql, { taskId, status });
}

export async function linkTaskToStage(taskId: string, stageId: string | null) {
  const sql = `UPDATE $taskId SET stage = $stageId, updated_at = time::now();`;
  return query(sql, { taskId, stageId });
}

export async function linkTaskToWorkflow(taskId: string, workflowId: string | null) {
  const sql = `UPDATE $taskId SET workflow_id = $workflowId, updated_at = time::now();`;
  return query(sql, { taskId, workflowId });
}

// --- Settings/Secrets (basic key-value) ---
export async function setSecret(key: string, value: string) {
  const sql = `
    LET $kv = (SELECT * FROM secret WHERE key = $key)[0];
    IF $kv THEN (UPDATE $kv SET value = $value, updated_at = time::now()) ELSE (CREATE secret SET key = $key, value = $value);
  `;
  return query(sql, { key, value });
}

export async function getSecret(key: string) {
  const sql = `SELECT value FROM secret WHERE key = $key LIMIT 1;`;
  return query(sql, { key });
}
