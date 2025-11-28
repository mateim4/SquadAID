/**
 * @file agentStore.ts
 * @description Zustand store for managing enhanced agent data.
 * Provides centralized state management for agent configuration,
 * status tracking, and performance metrics.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  AgentNodeData,
  AgentStatus,
  CreateAgentData,
  UpdateAgentData,
  createAgentNodeData,
} from '@/types/enhanced-agent';
import { ProviderType } from '@/types/provider';

/**
 * Agent store state interface.
 */
interface AgentState {
  /** Map of agent ID to agent data */
  agents: Map<string, AgentNodeData>;
  
  /** Currently selected agent ID */
  selectedAgentId: string | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: string | null;
}

/**
 * Agent store actions interface.
 */
interface AgentActions {
  // CRUD Operations
  addAgent: (data: CreateAgentData) => string;
  updateAgent: (id: string, updates: UpdateAgentData) => void;
  removeAgent: (id: string) => void;
  
  // Getters
  getAgent: (id: string) => AgentNodeData | undefined;
  getAgentsByProvider: (provider: ProviderType) => AgentNodeData[];
  getAgentsByRole: (roleId: string) => AgentNodeData[];
  getAgentsByStatus: (status: AgentStatus) => AgentNodeData[];
  getActiveAgents: () => AgentNodeData[];
  
  // Status Management
  updateAgentStatus: (id: string, status: AgentStatus, errorMessage?: string) => void;
  setAgentBusy: (id: string) => void;
  setAgentIdle: (id: string) => void;
  
  // Role Assignment
  assignRole: (agentId: string, roleId: string) => void;
  unassignRole: (agentId: string, roleId: string) => void;
  setPrimaryRole: (agentId: string, roleId: string) => void;
  
  // Metrics
  updateAgentMetrics: (id: string, metrics: {
    tokensUsed?: number;
    costCents?: number;
    responseTimeMs?: number;
    success?: boolean;
  }) => void;
  
  // Selection
  selectAgent: (id: string | null) => void;
  
  // Bulk Operations
  importAgents: (agents: AgentNodeData[]) => void;
  clearAllAgents: () => void;
  
  // State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state for the agent store.
 */
const initialState: AgentState = {
  agents: new Map(),
  selectedAgentId: null,
  isLoading: false,
  error: null,
};

/**
 * Custom serialization for Map to work with persist middleware.
 */
const mapStorage = createJSONStorage(() => localStorage, {
  reviver: (key, value) => {
    if (key === 'agents' && typeof value === 'object' && value !== null) {
      return new Map(Object.entries(value));
    }
    return value;
  },
  replacer: (key, value) => {
    if (key === 'agents' && value instanceof Map) {
      return Object.fromEntries(value);
    }
    return value;
  },
});

/**
 * Agent Zustand store with persistence and immer.
 */
export const useAgentStore = create<AgentState & AgentActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // === CRUD Operations ===

      addAgent: (data: CreateAgentData) => {
        const agent = createAgentNodeData(data);
        set((state) => {
          state.agents.set(agent.agentId, agent);
        });
        return agent.agentId;
      },

      updateAgent: (id: string, updates: UpdateAgentData) => {
        set((state) => {
          const agent = state.agents.get(id);
          if (agent) {
            state.agents.set(id, { ...agent, ...updates });
          }
        });
      },

      removeAgent: (id: string) => {
        set((state) => {
          state.agents.delete(id);
          if (state.selectedAgentId === id) {
            state.selectedAgentId = null;
          }
        });
      },

      // === Getters ===

      getAgent: (id: string) => {
        return get().agents.get(id);
      },

      getAgentsByProvider: (provider: ProviderType) => {
        return Array.from(get().agents.values()).filter(
          (agent) => agent.provider === provider
        );
      },

      getAgentsByRole: (roleId: string) => {
        return Array.from(get().agents.values()).filter(
          (agent) => agent.assignedRoles.includes(roleId)
        );
      },

      getAgentsByStatus: (status: AgentStatus) => {
        return Array.from(get().agents.values()).filter(
          (agent) => agent.status === status
        );
      },

      getActiveAgents: () => {
        return Array.from(get().agents.values()).filter(
          (agent) => agent.status === AgentStatus.ACTIVE || agent.status === AgentStatus.BUSY
        );
      },

      // === Status Management ===

      updateAgentStatus: (id: string, status: AgentStatus, errorMessage?: string) => {
        set((state) => {
          const agent = state.agents.get(id);
          if (agent) {
            agent.status = status;
            agent.errorMessage = errorMessage;
            agent.lastActive = new Date().toISOString();
          }
        });
      },

      setAgentBusy: (id: string) => {
        set((state) => {
          const agent = state.agents.get(id);
          if (agent) {
            agent.status = AgentStatus.BUSY;
            agent.lastActive = new Date().toISOString();
          }
        });
      },

      setAgentIdle: (id: string) => {
        set((state) => {
          const agent = state.agents.get(id);
          if (agent && agent.status === AgentStatus.BUSY) {
            agent.status = AgentStatus.ACTIVE;
            agent.lastActive = new Date().toISOString();
          }
        });
      },

      // === Role Assignment ===

      assignRole: (agentId: string, roleId: string) => {
        set((state) => {
          const agent = state.agents.get(agentId);
          if (agent && !agent.assignedRoles.includes(roleId)) {
            agent.assignedRoles.push(roleId);
            // Set as primary if first role
            if (agent.assignedRoles.length === 1) {
              agent.primaryRoleId = roleId;
            }
          }
        });
      },

      unassignRole: (agentId: string, roleId: string) => {
        set((state) => {
          const agent = state.agents.get(agentId);
          if (agent) {
            agent.assignedRoles = agent.assignedRoles.filter((r) => r !== roleId);
            // Update primary role if removed
            if (agent.primaryRoleId === roleId) {
              agent.primaryRoleId = agent.assignedRoles[0];
            }
          }
        });
      },

      setPrimaryRole: (agentId: string, roleId: string) => {
        set((state) => {
          const agent = state.agents.get(agentId);
          if (agent && agent.assignedRoles.includes(roleId)) {
            agent.primaryRoleId = roleId;
          }
        });
      },

      // === Metrics ===

      updateAgentMetrics: (id: string, metrics) => {
        set((state) => {
          const agent = state.agents.get(id);
          if (agent) {
            if (metrics.tokensUsed !== undefined) {
              agent.totalTokensUsed = (agent.totalTokensUsed ?? 0) + metrics.tokensUsed;
            }
            if (metrics.costCents !== undefined) {
              agent.totalCostCents = (agent.totalCostCents ?? 0) + metrics.costCents;
            }
            if (metrics.responseTimeMs !== undefined) {
              const prevAvg = agent.avgResponseTimeMs ?? metrics.responseTimeMs;
              const completed = agent.tasksCompleted ?? 0;
              agent.avgResponseTimeMs = (prevAvg * completed + metrics.responseTimeMs) / (completed + 1);
            }
            if (metrics.success !== undefined) {
              const completed = (agent.tasksCompleted ?? 0) + 1;
              const prevRate = agent.successRate ?? 1;
              const prevSuccesses = Math.round(prevRate * (completed - 1));
              const newSuccesses = prevSuccesses + (metrics.success ? 1 : 0);
              agent.successRate = newSuccesses / completed;
              agent.tasksCompleted = completed;
            }
            agent.lastActive = new Date().toISOString();
          }
        });
      },

      // === Selection ===

      selectAgent: (id: string | null) => {
        set((state) => {
          state.selectedAgentId = id;
        });
      },

      // === Bulk Operations ===

      importAgents: (agents: AgentNodeData[]) => {
        set((state) => {
          agents.forEach((agent) => {
            state.agents.set(agent.agentId, agent);
          });
        });
      },

      clearAllAgents: () => {
        set((state) => {
          state.agents.clear();
          state.selectedAgentId = null;
        });
      },

      // === State Management ===

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },

      reset: () => {
        set(initialState);
      },
    })),
    {
      name: 'squadaid-agents',
      storage: mapStorage,
      partialize: (state) => ({
        agents: state.agents,
      }),
    }
  )
);

/**
 * Selector hooks for optimized re-renders.
 */
export const useAgent = (id: string) => 
  useAgentStore((state) => state.agents.get(id));

export const useSelectedAgent = () =>
  useAgentStore((state) => 
    state.selectedAgentId ? state.agents.get(state.selectedAgentId) : undefined
  );

export const useAgentCount = () =>
  useAgentStore((state) => state.agents.size);

export const useAgentsArray = () =>
  useAgentStore((state) => Array.from(state.agents.values()));
