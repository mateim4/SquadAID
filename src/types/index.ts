import { Node, Edge } from 'reactflow';

// Re-export all enhanced types
export * from './provider';
export * from './role';
export * from './relationship';
// Export interaction types with proper type exports
export {
  InteractionType,
  createInteraction,
  expectsResponse,
  getInteractionLabel,
  getInteractionIcon,
} from './interaction';
export type {
  InteractionStatus,
  InteractionResponse,
  UserIntervention,
  AgentInteraction,
  InteractionSummary,
  InteractionFilters,
} from './interaction';
export * from './enhanced-agent';
export * from './enhanced-project';

/**
 * @deprecated Use AgentNodeData from enhanced-agent.ts for new implementations
 */
export type Agent = {
  id: string;
  name: string;
  description: string;
  Icon: React.FC<any>;
  backendType?: string; // optional backend identifier (e.g., gradio fn mapping)
  requiresRepo?: boolean; // if true, agent needs a GitHub repo (hybrid/github projects only)
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  nodes?: Node[];
  edges?: Edge[];
};

export type CanvasNode = {
  id: string;
  agentId: string;
  position: { x: number; y: number; };
};

export type Connection = {
  from: string;
  to: string;
};

// New: Project/Stage/Task types for task management
export type ProjectMode = 'local' | 'github' | 'hybrid';

export type Project = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  repo?: string; // owner/name
  folder?: string; // local path
  mode: ProjectMode;
  // optional bag for additional metadata like token budgets, etc.
  props?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
};

export type Stage = {
  id: string;
  project: string; // ref to Project id
  index: number; // order in project
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type TaskStatus = 'triage' | 'ready' | 'in_progress' | 'blocked' | 'done' | 'archived';

export type Task = {
  id: string;
  project: string; // ref to Project id
  stage?: string; // ref to Stage id (optional)
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: number;
  labels?: string[];
  assignees?: string[];
  workflow_id?: string; // optional linked workflow
  github_repo?: string; // owner/name
  github_issue_number?: number; // linked issue number
  created_at?: string;
  updated_at?: string;
};
