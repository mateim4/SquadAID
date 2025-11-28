/**
 * @file syncService.ts
 * @description Service for synchronizing frontend stores with the Tauri backend.
 * Handles initial data loading and periodic sync operations.
 */

import * as backend from './tauriBackend';
import { useRoleStore } from '../store/roleStore';
import { useAgentStore } from '../store/agentStore';
import { useInteractionStore } from '../store/interactionStore';
import { useEnhancedProjectStore } from '../store/enhancedProjectStore';
import type { AgentNodeData } from '../types/enhanced-agent';
import type { EnhancedProject } from '../types/enhanced-project';

/**
 * Initialize all stores with data from the backend.
 * This should be called once when the app starts.
 */
export async function initializeFromBackend(): Promise<void> {
  console.log('[SyncService] Initializing from backend...');
  
  // Check if we're in Tauri mode
  const isTauri = backend.isRunningInTauri();
  console.log('[SyncService] Running in Tauri:', isTauri);
  
  try {
    // Load roles from backend (built-in roles are loaded by the roleStore itself)
    await loadRolesFromBackend();
    
    // Load agents
    await loadAgentsFromBackend();
    
    // Load interactions (if there's an active workflow)
    // Interactions are typically loaded on-demand per workflow
    
    // Load projects
    await loadProjectsFromBackend();
    
    console.log('[SyncService] Initialization complete');
  } catch (error) {
    console.error('[SyncService] Initialization failed:', error);
    throw error;
  }
}

/**
 * Load roles from the backend and merge with store.
 */
async function loadRolesFromBackend(): Promise<void> {
  try {
    const roles = await backend.getRoles();
    const store = useRoleStore.getState();
    
    // Import non-built-in roles from backend
    const customRoles = roles.filter(r => !r.isBuiltIn);
    if (customRoles.length > 0) {
      store.importRoles(customRoles);
      console.log(`[SyncService] Loaded ${customRoles.length} custom roles`);
    }
  } catch (error) {
    console.warn('[SyncService] Failed to load roles:', error);
  }
}

/**
 * Load agents from the backend.
 */
async function loadAgentsFromBackend(): Promise<void> {
  try {
    const agents = await backend.getAgents();
    
    // Add each agent to the store using direct state manipulation
    if (agents.length > 0) {
      const currentAgents = useAgentStore.getState().agents;
      const newAgentsMap = new Map(currentAgents);
      
      for (const agent of agents) {
        const agentId = agent.agentId;
        if (!newAgentsMap.has(agentId)) {
          newAgentsMap.set(agentId, agent);
        }
      }
      
      // Update store with new agents map
      useAgentStore.setState({ agents: newAgentsMap });
      console.log(`[SyncService] Loaded ${agents.length} agents`);
    }
  } catch (error) {
    console.warn('[SyncService] Failed to load agents:', error);
  }
}

/**
 * Load projects from the backend.
 */
async function loadProjectsFromBackend(): Promise<void> {
  try {
    const projects = await backend.getProjects() as EnhancedProject[];
    const store = useEnhancedProjectStore.getState();
    
    // Add each project to the store
    for (const project of projects) {
      const existing = store.projects.get(project.id);
      if (!existing) {
        useEnhancedProjectStore.setState((state) => {
          state.projects.set(project.id, project);
        });
      }
    }
    
    if (projects.length > 0) {
      console.log(`[SyncService] Loaded ${projects.length} projects`);
    }
  } catch (error) {
    console.warn('[SyncService] Failed to load projects:', error);
  }
}

/**
 * Save a role to the backend.
 */
export async function saveRoleToBackend(roleId: string): Promise<void> {
  const store = useRoleStore.getState();
  const role = store.getRole(roleId);
  
  if (role && !role.isBuiltIn) {
    try {
      await backend.createRole(role);
      console.log(`[SyncService] Saved role: ${role.name}`);
    } catch (error) {
      // Try update if create fails (might already exist)
      try {
        await backend.updateRole(role);
        console.log(`[SyncService] Updated role: ${role.name}`);
      } catch (updateError) {
        console.error(`[SyncService] Failed to save role: ${role.name}`, updateError);
      }
    }
  }
}

/**
 * Save an agent to the backend.
 */
export async function saveAgentToBackend(agentId: string): Promise<void> {
  const store = useAgentStore.getState();
  const agent = store.getAgent(agentId);
  
  if (agent) {
    try {
      await backend.createAgent(agent);
      console.log(`[SyncService] Saved agent: ${agent.name}`);
    } catch (error) {
      try {
        await backend.updateAgent(agent);
        console.log(`[SyncService] Updated agent: ${agent.name}`);
      } catch (updateError) {
        console.error(`[SyncService] Failed to save agent: ${agent.name}`, updateError);
      }
    }
  }
}

/**
 * Save a project to the backend.
 */
export async function saveProjectToBackend(projectId: string): Promise<void> {
  const store = useEnhancedProjectStore.getState();
  const project = store.projects.get(projectId);
  
  if (project) {
    try {
      await backend.createProject(project);
      console.log(`[SyncService] Saved project: ${project.name}`);
    } catch (error) {
      try {
        await backend.updateProject(project);
        console.log(`[SyncService] Updated project: ${project.name}`);
      } catch (updateError) {
        console.error(`[SyncService] Failed to save project: ${project.name}`, updateError);
      }
    }
  }
}

/**
 * Delete a role from the backend.
 */
export async function deleteRoleFromBackend(roleId: string): Promise<void> {
  try {
    await backend.deleteRole(roleId);
    console.log(`[SyncService] Deleted role: ${roleId}`);
  } catch (error) {
    console.error(`[SyncService] Failed to delete role: ${roleId}`, error);
  }
}

/**
 * Delete an agent from the backend.
 */
export async function deleteAgentFromBackend(agentId: string): Promise<void> {
  try {
    await backend.deleteAgent(agentId);
    console.log(`[SyncService] Deleted agent: ${agentId}`);
  } catch (error) {
    console.error(`[SyncService] Failed to delete agent: ${agentId}`, error);
  }
}

/**
 * Delete a project from the backend.
 */
export async function deleteProjectFromBackend(projectId: string): Promise<void> {
  try {
    await backend.deleteProject(projectId);
    console.log(`[SyncService] Deleted project: ${projectId}`);
  } catch (error) {
    console.error(`[SyncService] Failed to delete project: ${projectId}`, error);
  }
}

/**
 * Sync all workflow interactions to the backend.
 */
export async function syncWorkflowInteractions(workflowId: string): Promise<void> {
  const store = useInteractionStore.getState();
  const interactions = store.getInteractionsByWorkflow(workflowId);
  
  for (const interaction of interactions) {
    try {
      await backend.createInteraction(interaction);
    } catch (error) {
      // Silently handle - interaction might already exist
    }
  }
  
  console.log(`[SyncService] Synced ${interactions.length} interactions for workflow: ${workflowId}`);
}

/**
 * Clear all workflow interactions from the backend.
 */
export async function clearWorkflowInteractionsFromBackend(workflowId: string): Promise<void> {
  try {
    await backend.deleteWorkflowInteractions(workflowId);
    console.log(`[SyncService] Cleared interactions for workflow: ${workflowId}`);
  } catch (error) {
    console.error(`[SyncService] Failed to clear interactions:`, error);
  }
}

// Re-export backend utilities
export { isRunningInTauri } from './tauriBackend';
