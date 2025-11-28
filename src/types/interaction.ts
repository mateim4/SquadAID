/**
 * @file interaction.ts
 * @description Interaction tracking types for agent communication.
 * Interactions represent discrete communication events between agents
 * during workflow execution.
 */

/**
 * Types of interactions that can occur between agents.
 */
export enum InteractionType {
  /** Assigning a task to another agent */
  TASK_ASSIGN = 'task_assign',
  /** Reporting task completion */
  TASK_COMPLETE = 'task_complete',
  /** Requesting input or information */
  REQUEST_INPUT = 'request_input',
  /** Providing requested input */
  PROVIDE_INPUT = 'provide_input',
  /** Requesting a review of work */
  REQUEST_REVIEW = 'request_review',
  /** Approving submitted work */
  APPROVE = 'approve',
  /** Rejecting submitted work with feedback */
  REJECT = 'reject',
  /** Escalating an issue to higher authority */
  ESCALATE = 'escalate',
  /** Consulting for advice without delegation */
  CONSULT = 'consult',
  /** Sending a notification (no response expected) */
  NOTIFY = 'notify',
  /** Handing off responsibility completely */
  HANDOFF = 'handoff',
  /** Progress update */
  PROGRESS_UPDATE = 'progress_update',
  /** Error or failure report */
  ERROR_REPORT = 'error_report',
  /** User intervention */
  USER_INTERVENTION = 'user_intervention',
}

/**
 * Status of an interaction.
 */
export type InteractionStatus = 
  | 'pending'      // Waiting for processing
  | 'in_progress'  // Currently being processed
  | 'completed'    // Successfully completed
  | 'failed'       // Failed with error
  | 'cancelled'    // Cancelled by user or system
  | 'timeout';     // Timed out waiting for response

/**
 * Response to an interaction from the target agent.
 */
export interface InteractionResponse {
  /** Response message content */
  message: string;
  /** Artifacts produced in response */
  artifacts?: string[];
  /** Response status */
  status: 'success' | 'failure' | 'partial';
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Timestamp of response */
  timestamp: string;
}

/**
 * User intervention data.
 */
export interface UserIntervention {
  /** Type of intervention */
  type: 'guidance' | 'override' | 'approval' | 'rejection' | 'cancel';
  /** User's message or instruction */
  message: string;
  /** Urgency level */
  urgency: 'suggestion' | 'requirement' | 'critical';
  /** Whether workflow was paused for this intervention */
  pausedExecution: boolean;
  /** Timestamp of intervention */
  timestamp: string;
}

/**
 * Complete interaction record between agents.
 */
export interface AgentInteraction {
  /** Unique interaction identifier */
  id: string;
  
  /** Workflow this interaction belongs to */
  workflowId: string;
  
  /** Agent that initiated the interaction */
  initiatorAgentId: string;
  
  /** Agent that receives the interaction */
  targetAgentId: string;
  
  /** Type of interaction */
  interactionType: InteractionType;
  
  /** Reference to the relationship governing this interaction */
  relationshipId?: string;
  
  /** Associated task ID if applicable */
  taskId?: string;
  
  /** Primary message content */
  message: string;
  
  /** Agent's reasoning/thinking process (if captured) */
  thinking?: string;
  
  /** Artifact IDs produced during this interaction */
  artifacts?: string[];
  
  /** Current status of the interaction */
  status: InteractionStatus;
  
  /** Priority level (1 = lowest, 5 = highest) */
  priority?: number;
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of completion */
  completedAt?: string;
  
  /** Response from target agent */
  response?: InteractionResponse;
  
  /** User intervention if any occurred */
  userIntervention?: UserIntervention;
  
  /** Token usage for this interaction */
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  
  /** Processing duration in milliseconds */
  durationMs?: number;
  
  /** Error information if status is 'failed' */
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  
  /** Parent interaction ID for threaded conversations */
  parentInteractionId?: string;
  
  /** Retry count if this interaction was retried */
  retryCount?: number;
}

/**
 * Summary of interactions for display.
 */
export interface InteractionSummary {
  id: string;
  initiatorName: string;
  targetName: string;
  type: InteractionType;
  status: InteractionStatus;
  message: string;
  createdAt: string;
  hasResponse: boolean;
}

/**
 * Filters for querying interactions.
 */
export interface InteractionFilters {
  workflowId?: string;
  agentId?: string;
  type?: InteractionType;
  status?: InteractionStatus;
  fromDate?: string;
  toDate?: string;
  hasUserIntervention?: boolean;
}

/**
 * Creates a new interaction with default values.
 * @param params - Required interaction parameters
 * @returns New interaction object
 */
export function createInteraction(params: {
  workflowId: string;
  initiatorAgentId: string;
  targetAgentId: string;
  interactionType: InteractionType;
  message: string;
  taskId?: string;
  relationshipId?: string;
  priority?: number;
}): AgentInteraction {
  return {
    id: crypto.randomUUID(),
    workflowId: params.workflowId,
    initiatorAgentId: params.initiatorAgentId,
    targetAgentId: params.targetAgentId,
    interactionType: params.interactionType,
    message: params.message,
    taskId: params.taskId,
    relationshipId: params.relationshipId,
    priority: params.priority ?? 3,
    status: 'pending',
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };
}

/**
 * Checks if an interaction type expects a response.
 * @param type - The interaction type
 * @returns True if response is expected
 */
export function expectsResponse(type: InteractionType): boolean {
  const noResponseTypes = new Set([
    InteractionType.NOTIFY,
    InteractionType.PROGRESS_UPDATE,
    InteractionType.TASK_COMPLETE,
  ]);
  return !noResponseTypes.has(type);
}

/**
 * Gets a human-readable label for an interaction type.
 * @param type - The interaction type
 * @returns Display label
 */
export function getInteractionLabel(type: InteractionType): string {
  const labels: Record<InteractionType, string> = {
    [InteractionType.TASK_ASSIGN]: 'Task Assignment',
    [InteractionType.TASK_COMPLETE]: 'Task Completed',
    [InteractionType.REQUEST_INPUT]: 'Input Request',
    [InteractionType.PROVIDE_INPUT]: 'Input Provided',
    [InteractionType.REQUEST_REVIEW]: 'Review Request',
    [InteractionType.APPROVE]: 'Approval',
    [InteractionType.REJECT]: 'Rejection',
    [InteractionType.ESCALATE]: 'Escalation',
    [InteractionType.CONSULT]: 'Consultation',
    [InteractionType.NOTIFY]: 'Notification',
    [InteractionType.HANDOFF]: 'Handoff',
    [InteractionType.PROGRESS_UPDATE]: 'Progress Update',
    [InteractionType.ERROR_REPORT]: 'Error Report',
    [InteractionType.USER_INTERVENTION]: 'User Intervention',
  };
  return labels[type] || type;
}

/**
 * Gets the icon name for an interaction type.
 * @param type - The interaction type
 * @returns Fluent UI icon name
 */
export function getInteractionIcon(type: InteractionType): string {
  const icons: Record<InteractionType, string> = {
    [InteractionType.TASK_ASSIGN]: 'TaskListAdd',
    [InteractionType.TASK_COMPLETE]: 'TaskListSquareAdd',
    [InteractionType.REQUEST_INPUT]: 'QuestionCircle',
    [InteractionType.PROVIDE_INPUT]: 'CheckmarkCircle',
    [InteractionType.REQUEST_REVIEW]: 'DocumentSearch',
    [InteractionType.APPROVE]: 'CheckmarkCircle',
    [InteractionType.REJECT]: 'DismissCircle',
    [InteractionType.ESCALATE]: 'ArrowUp',
    [InteractionType.CONSULT]: 'Chat',
    [InteractionType.NOTIFY]: 'Alert',
    [InteractionType.HANDOFF]: 'ArrowForward',
    [InteractionType.PROGRESS_UPDATE]: 'ArrowSync',
    [InteractionType.ERROR_REPORT]: 'ErrorCircle',
    [InteractionType.USER_INTERVENTION]: 'Person',
  };
  return icons[type] || 'Circle';
}
