/**
 * @file enhanced-project.ts
 * @description Enhanced project management types.
 * Extends the existing project model with comprehensive task management,
 * artifact tracking, and workflow integration.
 */

import { ProjectMode } from './index';

/**
 * Enhanced project status options.
 */
export type ProjectStatus = 
  | 'planning'    // Initial planning phase
  | 'active'      // Work in progress
  | 'paused'      // Temporarily paused
  | 'review'      // Under review
  | 'completed'   // Successfully completed
  | 'archived';   // Archived for reference

/**
 * Task status for Kanban board tracking.
 */
export type EnhancedTaskStatus = 
  | 'backlog'     // Not yet started
  | 'todo'        // Ready to start
  | 'in_progress' // Currently being worked on
  | 'review'      // Awaiting review
  | 'blocked'     // Blocked by dependency or issue
  | 'done'        // Completed
  | 'archived';   // Archived

/**
 * Task priority levels.
 */
export type TaskPriority = 
  | 'critical'    // Must be done immediately
  | 'high'        // High importance
  | 'medium'      // Normal priority
  | 'low';        // Nice to have

/**
 * Artifact status options.
 */
export type ArtifactStatus = 
  | 'draft'       // Work in progress
  | 'pending'     // Awaiting review
  | 'approved'    // Approved for use
  | 'rejected'    // Rejected with feedback
  | 'superseded'; // Replaced by newer version

/**
 * Artifact type categories.
 */
export type ArtifactType = 
  | 'code'
  | 'document'
  | 'diagram'
  | 'config'
  | 'test'
  | 'asset'
  | 'data'
  | 'other';

/**
 * Enhanced project definition.
 */
export interface EnhancedProject {
  /** Unique project identifier */
  id: string;
  
  /** URL-friendly slug */
  slug: string;
  
  /** Display name */
  name: string;
  
  /** Detailed description */
  description?: string;
  
  /** Project mode (local, github, hybrid) */
  mode: ProjectMode;
  
  /** GitHub repository (owner/name) if applicable */
  repo?: string;
  
  /** Local folder path if applicable */
  folder?: string;
  
  /** Team configuration ID */
  teamId?: string;
  
  /** Current project status */
  status: ProjectStatus;
  
  /** Project owner user ID */
  ownerId?: string;
  
  /** Project tags for filtering */
  tags?: string[];
  
  /** Project color for UI */
  color?: string;
  
  /** Project icon name */
  icon?: string;
  
  /** Token budget for the project */
  tokenBudget?: number;
  
  /** Tokens used so far */
  tokensUsed?: number;
  
  /** Cost budget in cents */
  costBudgetCents?: number;
  
  /** Cost spent so far in cents */
  costSpentCents?: number;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of last update */
  updatedAt: string;
  
  /** ISO timestamp of completion */
  completedAt?: string;
}

/**
 * Enhanced task definition.
 */
export interface EnhancedTask {
  /** Unique task identifier */
  id: string;
  
  /** Parent project ID */
  projectId: string;
  
  /** Associated workflow ID if running */
  workflowId?: string;
  
  /** Task title */
  title: string;
  
  /** Detailed description (supports markdown) */
  description?: string;
  
  /** Current status */
  status: EnhancedTaskStatus;
  
  /** Priority level */
  priority: TaskPriority;
  
  /** Assigned agent ID */
  assignedAgentId?: string;
  
  /** Required role ID */
  assignedRoleId?: string;
  
  /** Task dependency IDs (must complete before this task) */
  dependencies: string[];
  
  /** Blocking task IDs (this task blocks these) */
  blocks?: string[];
  
  /** Associated artifact IDs */
  artifactIds: string[];
  
  /** Labels/tags for filtering */
  labels?: string[];
  
  /** Estimated duration in minutes */
  estimatedDurationMinutes?: number;
  
  /** Actual duration in minutes */
  actualDurationMinutes?: number;
  
  /** Due date ISO timestamp */
  dueDate?: string;
  
  /** Number of execution attempts */
  attempts: number;
  
  /** Maximum allowed attempts */
  maxAttempts: number;
  
  /** Last error message if failed */
  lastError?: string;
  
  /** Acceptance criteria checklist */
  acceptanceCriteria?: AcceptanceCriterion[];
  
  /** Subtasks */
  subtasks?: SubTask[];
  
  /** Comments/notes */
  comments?: TaskComment[];
  
  /** Order within status column */
  order?: number;
  
  /** Parent task ID for subtasks */
  parentTaskId?: string;
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of last update */
  updatedAt: string;
  
  /** ISO timestamp when work started */
  startedAt?: string;
  
  /** ISO timestamp of completion */
  completedAt?: string;
}

/**
 * Acceptance criterion for a task.
 */
export interface AcceptanceCriterion {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  completedByAgentId?: string;
}

/**
 * Subtask within a task.
 */
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

/**
 * Comment on a task.
 */
export interface TaskComment {
  id: string;
  content: string;
  authorType: 'agent' | 'user';
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Artifact produced during workflow execution.
 */
export interface Artifact {
  /** Unique artifact identifier */
  id: string;
  
  /** Parent project ID */
  projectId: string;
  
  /** Associated task ID */
  taskId: string;
  
  /** Workflow that produced this artifact */
  workflowId: string;
  
  /** Agent that created this artifact */
  creatorAgentId: string;
  
  /** Role of the creator agent */
  creatorRoleId: string;
  
  /** File name */
  filename: string;
  
  /** File path relative to project root */
  path?: string;
  
  /** Artifact type category */
  type: ArtifactType;
  
  /** MIME type */
  mimeType?: string;
  
  /** File content (for text-based artifacts) */
  content?: string;
  
  /** Binary content (for binary artifacts) */
  binaryContent?: Uint8Array;
  
  /** Content hash for deduplication */
  contentHash?: string;
  
  /** File size in bytes */
  sizeBytes?: number;
  
  /** Version number */
  version: number;
  
  /** Previous version ID */
  previousVersionId?: string;
  
  /** Approval status */
  status: ArtifactStatus;
  
  /** Review comments */
  reviewComments?: string;
  
  /** Reviewed by agent/user ID */
  reviewedBy?: string;
  
  /** ISO timestamp of review */
  reviewedAt?: string;
  
  /** Tags for filtering */
  tags?: string[];
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * Project statistics summary.
 */
export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  totalArtifacts: number;
  approvedArtifacts: number;
  totalTokensUsed: number;
  totalCostCents: number;
  avgTaskDurationMinutes: number;
  completionPercentage: number;
}

/**
 * Creates a new project with defaults.
 * @param data - Required project data
 * @returns Complete project object
 */
export function createProject(data: {
  name: string;
  mode: ProjectMode;
  description?: string;
  repo?: string;
  folder?: string;
}): EnhancedProject {
  const now = new Date().toISOString();
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return {
    id: crypto.randomUUID(),
    slug,
    name: data.name,
    description: data.description,
    mode: data.mode,
    repo: data.repo,
    folder: data.folder,
    status: 'planning',
    tokensUsed: 0,
    costSpentCents: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates a new task with defaults.
 * @param data - Required task data
 * @returns Complete task object
 */
export function createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignedAgentId?: string;
  assignedRoleId?: string;
}): EnhancedTask {
  const now = new Date().toISOString();
  
  return {
    id: crypto.randomUUID(),
    projectId: data.projectId,
    title: data.title,
    description: data.description,
    status: 'backlog',
    priority: data.priority ?? 'medium',
    assignedAgentId: data.assignedAgentId,
    assignedRoleId: data.assignedRoleId,
    dependencies: [],
    artifactIds: [],
    attempts: 0,
    maxAttempts: 3,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates a new artifact with defaults.
 * @param data - Required artifact data
 * @returns Complete artifact object
 */
export function createArtifact(data: {
  projectId: string;
  taskId: string;
  workflowId: string;
  creatorAgentId: string;
  creatorRoleId: string;
  filename: string;
  type: ArtifactType;
  content?: string;
}): Artifact {
  const now = new Date().toISOString();
  
  return {
    id: crypto.randomUUID(),
    projectId: data.projectId,
    taskId: data.taskId,
    workflowId: data.workflowId,
    creatorAgentId: data.creatorAgentId,
    creatorRoleId: data.creatorRoleId,
    filename: data.filename,
    type: data.type,
    content: data.content,
    sizeBytes: data.content ? new TextEncoder().encode(data.content).length : 0,
    version: 1,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Gets the display color for a task priority.
 * @param priority - Task priority
 * @returns Color token name
 */
export function getPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    critical: 'danger',
    high: 'warning',
    medium: 'brand',
    low: 'subtle',
  };
  return colors[priority];
}

/**
 * Gets the display color for a task status.
 * @param status - Task status
 * @returns Color token name
 */
export function getTaskStatusColor(status: EnhancedTaskStatus): string {
  const colors: Record<EnhancedTaskStatus, string> = {
    backlog: 'subtle',
    todo: 'informative',
    in_progress: 'brand',
    review: 'warning',
    blocked: 'danger',
    done: 'success',
    archived: 'subtle',
  };
  return colors[status];
}

/**
 * Calculates project completion percentage.
 * @param tasks - Array of project tasks
 * @returns Completion percentage (0-100)
 */
export function calculateProjectCompletion(tasks: EnhancedTask[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'done').length;
  return Math.round((completed / tasks.length) * 100);
}
