/**
 * @file enhanced-agent.ts
 * @description Enhanced agent node data types for the workflow canvas.
 * Extends the basic agent model with provider configuration, role assignments,
 * capabilities, and status tracking.
 */

import { ProviderType, AgentMode, ConnectionConfig } from './provider';

/**
 * Current operational status of an agent.
 */
export enum AgentStatus {
  /** Agent is configured and ready */
  ACTIVE = 'active',
  /** Agent is not configured or disabled */
  INACTIVE = 'inactive',
  /** Agent encountered an error */
  ERROR = 'error',
  /** Agent is establishing connection */
  CONNECTING = 'connecting',
  /** Agent is currently processing */
  BUSY = 'busy',
  /** Agent is paused by user */
  PAUSED = 'paused',
}

/**
 * Agent capability categories.
 */
export type AgentCapability =
  | 'code-generation'
  | 'code-review'
  | 'planning'
  | 'research'
  | 'documentation'
  | 'testing'
  | 'debugging'
  | 'architecture'
  | 'ui-design'
  | 'data-analysis'
  | 'devops'
  | 'security'
  | 'general';

/**
 * Enhanced agent node data structure.
 * This extends the basic agent model with comprehensive configuration.
 */
export interface AgentNodeData {
  // === Basic Identification ===
  
  /** Unique identifier for the agent instance */
  agentId: string;
  
  /** Display name for the agent */
  name: string;
  
  /** Brief description of the agent's purpose */
  description?: string;
  
  // === Provider Configuration ===
  
  /** AI provider type */
  provider: ProviderType;
  
  /** Execution mode (local, remote, hybrid) */
  mode: AgentMode;
  
  /** Connection configuration */
  connection: ConnectionConfig;
  
  // === Role Assignment ===
  
  /** Array of assigned role IDs */
  assignedRoles: string[];
  
  /** Primary role ID (first in array or explicitly set) */
  primaryRoleId?: string;
  
  // === Capabilities ===
  
  /** List of capabilities this agent possesses */
  capabilities: AgentCapability[];
  
  /** Custom capability definitions */
  customCapabilities?: string[];
  
  // === Status & Health ===
  
  /** Current operational status */
  status: AgentStatus;
  
  /** ISO timestamp of last activity */
  lastActive?: string;
  
  /** Error message if status is ERROR */
  errorMessage?: string;
  
  /** Connection health (0-100) */
  healthScore?: number;
  
  // === Performance Metrics ===
  
  /** Total tokens used by this agent */
  totalTokensUsed?: number;
  
  /** Total cost incurred (in cents) */
  totalCostCents?: number;
  
  /** Average response time in milliseconds */
  avgResponseTimeMs?: number;
  
  /** Success rate (0-1) */
  successRate?: number;
  
  /** Total tasks completed */
  tasksCompleted?: number;
  
  // === UI State ===
  
  /** Whether the node is expanded in the canvas */
  expanded?: boolean;
  
  /** Canvas position */
  position?: { x: number; y: number };
  
  /** Node label (for React Flow) */
  label?: string;
  
  /** Icon component reference */
  icon?: string;
  
  // === Legacy Support ===
  
  /** System message (backward compatibility with UserProxyAgentNode) */
  systemMessage?: string;
  
  /** Additional flexible properties */
  [key: string]: unknown;
}

/**
 * Minimal agent data for creating a new agent.
 */
export interface CreateAgentData {
  name: string;
  provider: ProviderType;
  mode?: AgentMode;
  connection?: Partial<ConnectionConfig>;
  description?: string;
  assignedRoles?: string[];
  capabilities?: AgentCapability[];
}

/**
 * Agent update payload.
 */
export type UpdateAgentData = Partial<Omit<AgentNodeData, 'agentId'>>;

/**
 * Creates a new AgentNodeData with defaults.
 * @param data - Required creation data
 * @returns Complete AgentNodeData object
 */
export function createAgentNodeData(data: CreateAgentData): AgentNodeData {
  const agentId = crypto.randomUUID();
  
  return {
    agentId,
    name: data.name,
    description: data.description,
    provider: data.provider,
    mode: data.mode ?? AgentMode.LOCAL,
    connection: {
      provider: data.provider,
      ...data.connection,
    },
    assignedRoles: data.assignedRoles ?? [],
    capabilities: data.capabilities ?? ['general'],
    status: AgentStatus.INACTIVE,
    expanded: false,
    label: data.name,
  };
}

/**
 * Migrates old node data format to new AgentNodeData.
 * Ensures backward compatibility with existing workflows.
 * @param oldData - Legacy node data
 * @param nodeId - Node ID for agent ID generation
 * @returns Migrated AgentNodeData
 */
export function migrateNodeData(
  oldData: Record<string, unknown>,
  nodeId: string
): AgentNodeData {
  return {
    agentId: (oldData.agentId as string) ?? nodeId,
    name: (oldData.name as string) ?? (oldData.label as string) ?? 'Unnamed Agent',
    description: oldData.description as string | undefined,
    provider: (oldData.provider as ProviderType) ?? ProviderType.OLLAMA,
    mode: (oldData.mode as AgentMode) ?? AgentMode.LOCAL,
    connection: {
      provider: (oldData.provider as ProviderType) ?? ProviderType.OLLAMA,
      ...(oldData.connection as Partial<ConnectionConfig>),
    },
    assignedRoles: (oldData.assignedRoles as string[]) ?? [],
    capabilities: (oldData.capabilities as AgentCapability[]) ?? ['general'],
    status: AgentStatus.ACTIVE,
    lastActive: new Date().toISOString(),
    expanded: (oldData.expanded as boolean) ?? false,
    position: oldData.position as { x: number; y: number } | undefined,
    label: (oldData.label as string) ?? (oldData.name as string),
    icon: oldData.icon as string | undefined,
    systemMessage: oldData.systemMessage as string | undefined,
  };
}

/**
 * Checks if agent data needs migration.
 * @param data - Node data to check
 * @returns True if migration is needed
 */
export function needsMigration(data: Record<string, unknown>): boolean {
  return !data.agentId || !data.provider || !data.connection;
}

/**
 * Gets a status badge color for display.
 * @param status - Agent status
 * @returns Color token name
 */
export function getStatusColor(status: AgentStatus): string {
  const colors: Record<AgentStatus, string> = {
    [AgentStatus.ACTIVE]: 'success',
    [AgentStatus.INACTIVE]: 'subtle',
    [AgentStatus.ERROR]: 'danger',
    [AgentStatus.CONNECTING]: 'warning',
    [AgentStatus.BUSY]: 'brand',
    [AgentStatus.PAUSED]: 'warning',
  };
  return colors[status] ?? 'subtle';
}

/**
 * Gets a human-readable status label.
 * @param status - Agent status
 * @returns Display label
 */
export function getStatusLabel(status: AgentStatus): string {
  const labels: Record<AgentStatus, string> = {
    [AgentStatus.ACTIVE]: 'Active',
    [AgentStatus.INACTIVE]: 'Inactive',
    [AgentStatus.ERROR]: 'Error',
    [AgentStatus.CONNECTING]: 'Connecting',
    [AgentStatus.BUSY]: 'Busy',
    [AgentStatus.PAUSED]: 'Paused',
  };
  return labels[status] ?? status;
}

/**
 * Validates agent node data.
 * @param data - Data to validate
 * @returns Array of validation error messages
 */
export function validateAgentNodeData(data: Partial<AgentNodeData>): string[] {
  const errors: string[] = [];
  
  if (!data.name?.trim()) {
    errors.push('Agent name is required');
  }
  
  if (!data.provider) {
    errors.push('Provider is required');
  }
  
  if (!data.connection?.provider) {
    errors.push('Connection configuration is required');
  }
  
  return errors;
}
