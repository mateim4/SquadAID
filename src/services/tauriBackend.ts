/**
 * Tauri Backend Service
 * 
 * Provides a typed interface to call Tauri commands from the frontend.
 * Falls back to localStorage when running in browser (dev mode without Tauri).
 */

import type { Role } from '../types/role';
import type { RelationshipEdge, RelationshipType } from '../types/relationship';
import type { AgentInteraction, InteractionStatus } from '../types/interaction';
import type { EnhancedProject, EnhancedTask, Artifact } from '../types/enhanced-project';
import type { AgentNodeData, AgentStatus } from '../types/enhanced-agent';

// Type aliases for consistency with Rust backend
type AgentRelationship = RelationshipEdge;
type ProjectTask = EnhancedTask;
type ProjectArtifact = Artifact;

// Check if we're running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Dynamic import for Tauri
const getTauriInvoke = async () => {
  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/tauri');
    return invoke;
  }
  return null;
};

// LocalStorage fallback keys
const STORAGE_KEYS = {
  roles: 'squadaid_roles',
  agents: 'squadaid_agents',
  relationships: 'squadaid_relationships',
  interactions: 'squadaid_interactions',
  projects: 'squadaid_projects',
  tasks: 'squadaid_tasks',
  artifacts: 'squadaid_artifacts',
} as const;

// Helper to get data from localStorage
function getLocalStorage<T>(key: string, defaultValue: T[] = []): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Helper to set data in localStorage
function setLocalStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to localStorage: ${key}`, e);
  }
}

// ============================================================================
// Role Commands
// ============================================================================

export async function getRoles(): Promise<Role[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_roles');
  }
  return getLocalStorage<Role>(STORAGE_KEYS.roles);
}

export async function getRole(id: string): Promise<Role | null> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_role', { id });
  }
  const roles = getLocalStorage<Role>(STORAGE_KEYS.roles);
  return roles.find(r => r.id === id) || null;
}

export async function createRole(role: Role): Promise<Role> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('create_role', { role });
  }
  const roles = getLocalStorage<Role>(STORAGE_KEYS.roles);
  roles.push(role);
  setLocalStorage(STORAGE_KEYS.roles, roles);
  return role;
}

export async function updateRole(role: Role): Promise<Role> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('update_role', { role });
  }
  const roles = getLocalStorage<Role>(STORAGE_KEYS.roles);
  const index = roles.findIndex(r => r.id === role.id);
  if (index !== -1) {
    roles[index] = role;
    setLocalStorage(STORAGE_KEYS.roles, roles);
  }
  return role;
}

export async function deleteRole(id: string): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('delete_role', { id });
  }
  const roles = getLocalStorage<Role>(STORAGE_KEYS.roles);
  setLocalStorage(STORAGE_KEYS.roles, roles.filter(r => r.id !== id));
}

export async function getBuiltInRoles(): Promise<Role[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_built_in_roles');
  }
  const roles = getLocalStorage<Role>(STORAGE_KEYS.roles);
  return roles.filter(r => r.isBuiltIn);
}

// ============================================================================
// Agent Commands
// ============================================================================

export async function getAgents(): Promise<AgentNodeData[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_agents');
  }
  return getLocalStorage<AgentNodeData>(STORAGE_KEYS.agents);
}

export async function getAgent(id: string): Promise<AgentNodeData | null> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_agent', { id });
  }
  const agents = getLocalStorage<AgentNodeData>(STORAGE_KEYS.agents);
  return agents.find(a => a.id === id) || null;
}

export async function createAgent(agent: AgentNodeData): Promise<AgentNodeData> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('create_agent', { agent });
  }
  const agents = getLocalStorage<AgentNodeData>(STORAGE_KEYS.agents);
  agents.push(agent);
  setLocalStorage(STORAGE_KEYS.agents, agents);
  return agent;
}

export async function updateAgent(agent: AgentNodeData): Promise<AgentNodeData> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('update_agent', { agent });
  }
  const agents = getLocalStorage<AgentNodeData>(STORAGE_KEYS.agents);
  const index = agents.findIndex(a => a.id === agent.id);
  if (index !== -1) {
    agents[index] = agent;
    setLocalStorage(STORAGE_KEYS.agents, agents);
  }
  return agent;
}

export async function deleteAgent(id: string): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('delete_agent', { id });
  }
  const agents = getLocalStorage<AgentNodeData>(STORAGE_KEYS.agents);
  setLocalStorage(STORAGE_KEYS.agents, agents.filter(a => a.id !== id));
}

export async function updateAgentStatus(id: string, status: AgentStatus): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('update_agent_status', { id, status });
  }
  const agents = getLocalStorage<AgentNodeData>(STORAGE_KEYS.agents);
  const agent = agents.find(a => a.id === id);
  if (agent) {
    agent.status = status;
    setLocalStorage(STORAGE_KEYS.agents, agents);
  }
}

export async function assignRoleToAgent(agentId: string, roleId: string | null): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('assign_role_to_agent', { agentId, roleId });
  }
  const agents = getLocalStorage<AgentNodeData>(STORAGE_KEYS.agents);
  const agent = agents.find(a => a.id === agentId);
  if (agent) {
    agent.roleId = roleId ?? undefined;
    setLocalStorage(STORAGE_KEYS.agents, agents);
  }
}

export async function getAgentsByRole(roleId: string): Promise<AgentNodeData[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_agents_by_role', { roleId });
  }
  const agents = getLocalStorage<AgentNodeData>(STORAGE_KEYS.agents);
  return agents.filter(a => a.roleId === roleId);
}

// ============================================================================
// Relationship Commands
// ============================================================================

export async function getRelationships(): Promise<AgentRelationship[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_relationships');
  }
  return getLocalStorage<AgentRelationship>(STORAGE_KEYS.relationships);
}

export async function getRelationship(id: string): Promise<AgentRelationship | null> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_relationship', { id });
  }
  const relationships = getLocalStorage<AgentRelationship>(STORAGE_KEYS.relationships);
  return relationships.find(r => r.id === id) || null;
}

export async function createRelationship(relationship: AgentRelationship): Promise<AgentRelationship> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('create_relationship', { relationship });
  }
  const relationships = getLocalStorage<AgentRelationship>(STORAGE_KEYS.relationships);
  relationships.push(relationship);
  setLocalStorage(STORAGE_KEYS.relationships, relationships);
  return relationship;
}

export async function updateRelationship(relationship: AgentRelationship): Promise<AgentRelationship> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('update_relationship', { relationship });
  }
  const relationships = getLocalStorage<AgentRelationship>(STORAGE_KEYS.relationships);
  const index = relationships.findIndex(r => r.id === relationship.id);
  if (index !== -1) {
    relationships[index] = relationship;
    setLocalStorage(STORAGE_KEYS.relationships, relationships);
  }
  return relationship;
}

export async function deleteRelationship(id: string): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('delete_relationship', { id });
  }
  const relationships = getLocalStorage<AgentRelationship>(STORAGE_KEYS.relationships);
  setLocalStorage(STORAGE_KEYS.relationships, relationships.filter(r => r.id !== id));
}

export async function getAgentRelationships(agentId: string): Promise<AgentRelationship[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_agent_relationships', { agentId });
  }
  const relationships = getLocalStorage<AgentRelationship>(STORAGE_KEYS.relationships);
  return relationships.filter(r => r.source === agentId || r.target === agentId);
}

export async function getRelationshipsByType(relationshipType: RelationshipType): Promise<AgentRelationship[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_relationships_by_type', { relationshipType });
  }
  const relationships = getLocalStorage<AgentRelationship>(STORAGE_KEYS.relationships);
  return relationships.filter(r => r.data?.type === relationshipType);
}

// ============================================================================
// Interaction Commands
// ============================================================================

export async function getInteractions(): Promise<AgentInteraction[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_interactions');
  }
  return getLocalStorage<AgentInteraction>(STORAGE_KEYS.interactions);
}

export async function getWorkflowInteractions(workflowId: string): Promise<AgentInteraction[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_workflow_interactions', { workflowId });
  }
  const interactions = getLocalStorage<AgentInteraction>(STORAGE_KEYS.interactions);
  return interactions.filter(i => i.workflowId === workflowId);
}

export async function createInteraction(interaction: AgentInteraction): Promise<AgentInteraction> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('create_interaction', { interaction });
  }
  const interactions = getLocalStorage<AgentInteraction>(STORAGE_KEYS.interactions);
  interactions.push(interaction);
  setLocalStorage(STORAGE_KEYS.interactions, interactions);
  return interaction;
}

export async function updateInteractionStatus(id: string, status: InteractionStatus): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('update_interaction_status', { id, status });
  }
  const interactions = getLocalStorage<AgentInteraction>(STORAGE_KEYS.interactions);
  const interaction = interactions.find(i => i.id === id);
  if (interaction) {
    interaction.status = status;
    if (['completed', 'failed', 'cancelled'].includes(status)) {
      interaction.completedAt = new Date().toISOString();
    }
    setLocalStorage(STORAGE_KEYS.interactions, interactions);
  }
}

export async function deleteWorkflowInteractions(workflowId: string): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('delete_workflow_interactions', { workflowId });
  }
  const interactions = getLocalStorage<AgentInteraction>(STORAGE_KEYS.interactions);
  setLocalStorage(STORAGE_KEYS.interactions, interactions.filter(i => i.workflowId !== workflowId));
}

export interface InteractionStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  averageDurationMs: number;
}

export async function getInteractionStats(workflowId?: string): Promise<InteractionStats> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_interaction_stats', { workflowId });
  }
  
  let interactions = getLocalStorage<AgentInteraction>(STORAGE_KEYS.interactions);
  if (workflowId) {
    interactions = interactions.filter(i => i.workflowId === workflowId);
  }
  
  const completed = interactions.filter(i => i.status === 'completed').length;
  const failed = interactions.filter(i => i.status === 'failed').length;
  const durations = interactions
    .filter(i => i.durationMs !== undefined)
    .map(i => i.durationMs!);
  
  return {
    total: interactions.length,
    completed,
    failed,
    pending: interactions.length - completed - failed,
    averageDurationMs: durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0,
  };
}

// ============================================================================
// Project Commands
// ============================================================================

export async function getProjects(): Promise<EnhancedProject[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_projects');
  }
  return getLocalStorage<EnhancedProject>(STORAGE_KEYS.projects);
}

export async function getProject(id: string): Promise<EnhancedProject | null> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_project', { id });
  }
  const projects = getLocalStorage<EnhancedProject>(STORAGE_KEYS.projects);
  return projects.find(p => p.id === id) || null;
}

export async function createProject(project: EnhancedProject): Promise<EnhancedProject> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('create_project', { project });
  }
  const projects = getLocalStorage<EnhancedProject>(STORAGE_KEYS.projects);
  projects.push(project);
  setLocalStorage(STORAGE_KEYS.projects, projects);
  return project;
}

export async function updateProject(project: EnhancedProject): Promise<EnhancedProject> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('update_project', { project });
  }
  const projects = getLocalStorage<EnhancedProject>(STORAGE_KEYS.projects);
  const index = projects.findIndex(p => p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
    setLocalStorage(STORAGE_KEYS.projects, projects);
  }
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('delete_project', { id });
  }
  const projects = getLocalStorage<EnhancedProject>(STORAGE_KEYS.projects);
  setLocalStorage(STORAGE_KEYS.projects, projects.filter(p => p.id !== id));
}

// ============================================================================
// Task Commands
// ============================================================================

export async function getProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_project_tasks', { projectId });
  }
  const tasks = getLocalStorage<ProjectTask>(STORAGE_KEYS.tasks);
  return tasks.filter(t => t.projectId === projectId);
}

export async function createTask(task: ProjectTask): Promise<ProjectTask> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('create_task', { task });
  }
  const tasks = getLocalStorage<ProjectTask>(STORAGE_KEYS.tasks);
  tasks.push(task);
  setLocalStorage(STORAGE_KEYS.tasks, tasks);
  return task;
}

export async function updateTask(task: ProjectTask): Promise<ProjectTask> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('update_task', { task });
  }
  const tasks = getLocalStorage<ProjectTask>(STORAGE_KEYS.tasks);
  const index = tasks.findIndex(t => t.id === task.id);
  if (index !== -1) {
    tasks[index] = task;
    setLocalStorage(STORAGE_KEYS.tasks, tasks);
  }
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('delete_task', { id });
  }
  const tasks = getLocalStorage<ProjectTask>(STORAGE_KEYS.tasks);
  setLocalStorage(STORAGE_KEYS.tasks, tasks.filter(t => t.id !== id));
}

// ============================================================================
// Artifact Commands
// ============================================================================

export async function getProjectArtifacts(projectId: string): Promise<ProjectArtifact[]> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('get_project_artifacts', { projectId });
  }
  const artifacts = getLocalStorage<ProjectArtifact>(STORAGE_KEYS.artifacts);
  return artifacts.filter(a => a.projectId === projectId);
}

export async function createArtifact(artifact: ProjectArtifact): Promise<ProjectArtifact> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('create_artifact', { artifact });
  }
  const artifacts = getLocalStorage<ProjectArtifact>(STORAGE_KEYS.artifacts);
  artifacts.push(artifact);
  setLocalStorage(STORAGE_KEYS.artifacts, artifacts);
  return artifact;
}

export async function deleteArtifact(id: string): Promise<void> {
  const invoke = await getTauriInvoke();
  if (invoke) {
    return invoke('delete_artifact', { id });
  }
  const artifacts = getLocalStorage<ProjectArtifact>(STORAGE_KEYS.artifacts);
  setLocalStorage(STORAGE_KEYS.artifacts, artifacts.filter(a => a.id !== id));
}

// ============================================================================
// Utility
// ============================================================================

/** Check if running in Tauri environment */
export function isRunningInTauri(): boolean {
  return isTauri;
}

/** Clear all local storage data (useful for testing) */
export function clearAllLocalData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
