/**
 * @file interactionStore.ts
 * @description Zustand store for managing agent interactions during workflow execution.
 * Tracks communication between agents, user interventions, and interaction history.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  AgentInteraction,
  InteractionStatus,
  InteractionType,
  InteractionFilters,
  InteractionResponse,
  UserIntervention,
  createInteraction,
} from '@/types/interaction';

/**
 * Interaction store state interface.
 */
interface InteractionState {
  /** Map of interaction ID to interaction data */
  interactions: Map<string, AgentInteraction>;
  
  /** Active workflow ID */
  activeWorkflowId: string | null;
  
  /** Selected interaction for detail view */
  selectedInteractionId: string | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: string | null;
}

/**
 * Interaction store actions interface.
 */
interface InteractionActions {
  // Workflow Management
  setActiveWorkflow: (workflowId: string | null) => void;
  
  // CRUD Operations
  addInteraction: (params: {
    workflowId: string;
    initiatorAgentId: string;
    targetAgentId: string;
    interactionType: InteractionType;
    message: string;
    taskId?: string;
    relationshipId?: string;
    priority?: number;
  }) => string;
  
  updateInteraction: (id: string, updates: Partial<AgentInteraction>) => void;
  removeInteraction: (id: string) => void;
  
  // Status Updates
  startInteraction: (id: string) => void;
  completeInteraction: (id: string, response: InteractionResponse) => void;
  failInteraction: (id: string, error: { code: string; message: string; recoverable: boolean }) => void;
  cancelInteraction: (id: string) => void;
  
  // User Intervention
  addUserIntervention: (interactionId: string, intervention: Omit<UserIntervention, 'timestamp'>) => void;
  
  // Getters
  getInteraction: (id: string) => AgentInteraction | undefined;
  getInteractionsByWorkflow: (workflowId: string) => AgentInteraction[];
  getInteractionsByAgent: (agentId: string) => AgentInteraction[];
  getPendingInteractions: (workflowId?: string) => AgentInteraction[];
  getInteractionChain: (interactionId: string) => AgentInteraction[];
  filterInteractions: (filters: InteractionFilters) => AgentInteraction[];
  
  // Timeline
  getWorkflowTimeline: (workflowId: string) => AgentInteraction[];
  
  // Statistics
  getInteractionStats: (workflowId?: string) => {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    avgDurationMs: number;
    totalTokens: number;
  };
  
  // Selection
  selectInteraction: (id: string | null) => void;
  
  // Cleanup
  clearWorkflowInteractions: (workflowId: string) => void;
  clearAllInteractions: () => void;
  
  // State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state for the interaction store.
 */
const initialState: InteractionState = {
  interactions: new Map(),
  activeWorkflowId: null,
  selectedInteractionId: null,
  isLoading: false,
  error: null,
};

/**
 * Custom serialization for Map to work with persist middleware.
 */
const mapStorage = createJSONStorage(() => localStorage, {
  reviver: (key, value) => {
    if (key === 'interactions' && typeof value === 'object' && value !== null) {
      return new Map(Object.entries(value));
    }
    return value;
  },
  replacer: (key, value) => {
    if (key === 'interactions' && value instanceof Map) {
      return Object.fromEntries(value);
    }
    return value;
  },
});

/**
 * Interaction Zustand store with persistence and immer.
 */
export const useInteractionStore = create<InteractionState & InteractionActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // === Workflow Management ===

      setActiveWorkflow: (workflowId: string | null) => {
        set((state) => {
          state.activeWorkflowId = workflowId;
        });
      },

      // === CRUD Operations ===

      addInteraction: (params) => {
        const interaction = createInteraction(params);
        set((state) => {
          state.interactions.set(interaction.id, interaction);
        });
        return interaction.id;
      },

      updateInteraction: (id: string, updates: Partial<AgentInteraction>) => {
        set((state) => {
          const interaction = state.interactions.get(id);
          if (interaction) {
            state.interactions.set(id, { ...interaction, ...updates });
          }
        });
      },

      removeInteraction: (id: string) => {
        set((state) => {
          state.interactions.delete(id);
          if (state.selectedInteractionId === id) {
            state.selectedInteractionId = null;
          }
        });
      },

      // === Status Updates ===

      startInteraction: (id: string) => {
        set((state) => {
          const interaction = state.interactions.get(id);
          if (interaction && interaction.status === 'pending') {
            interaction.status = 'in_progress';
          }
        });
      },

      completeInteraction: (id: string, response: InteractionResponse) => {
        set((state) => {
          const interaction = state.interactions.get(id);
          if (interaction) {
            interaction.status = 'completed';
            interaction.completedAt = new Date().toISOString();
            interaction.response = response;
            interaction.durationMs = 
              new Date(interaction.completedAt).getTime() - 
              new Date(interaction.createdAt).getTime();
          }
        });
      },

      failInteraction: (id: string, error) => {
        set((state) => {
          const interaction = state.interactions.get(id);
          if (interaction) {
            interaction.status = 'failed';
            interaction.completedAt = new Date().toISOString();
            interaction.error = error;
            interaction.durationMs = 
              new Date(interaction.completedAt).getTime() - 
              new Date(interaction.createdAt).getTime();
          }
        });
      },

      cancelInteraction: (id: string) => {
        set((state) => {
          const interaction = state.interactions.get(id);
          if (interaction && (interaction.status === 'pending' || interaction.status === 'in_progress')) {
            interaction.status = 'cancelled';
            interaction.completedAt = new Date().toISOString();
          }
        });
      },

      // === User Intervention ===

      addUserIntervention: (interactionId: string, intervention) => {
        set((state) => {
          const interaction = state.interactions.get(interactionId);
          if (interaction) {
            interaction.userIntervention = {
              ...intervention,
              timestamp: new Date().toISOString(),
            };
          }
        });
      },

      // === Getters ===

      getInteraction: (id: string) => {
        return get().interactions.get(id);
      },

      getInteractionsByWorkflow: (workflowId: string) => {
        return Array.from(get().interactions.values()).filter(
          (interaction) => interaction.workflowId === workflowId
        );
      },

      getInteractionsByAgent: (agentId: string) => {
        return Array.from(get().interactions.values()).filter(
          (interaction) =>
            interaction.initiatorAgentId === agentId ||
            interaction.targetAgentId === agentId
        );
      },

      getPendingInteractions: (workflowId?: string) => {
        return Array.from(get().interactions.values()).filter(
          (interaction) =>
            interaction.status === 'pending' &&
            (!workflowId || interaction.workflowId === workflowId)
        );
      },

      getInteractionChain: (interactionId: string) => {
        const chain: AgentInteraction[] = [];
        let currentId: string | undefined = interactionId;
        
        while (currentId) {
          const interaction = get().interactions.get(currentId);
          if (interaction) {
            chain.unshift(interaction);
            currentId = interaction.parentInteractionId;
          } else {
            break;
          }
        }
        
        return chain;
      },

      filterInteractions: (filters: InteractionFilters) => {
        return Array.from(get().interactions.values()).filter((interaction) => {
          if (filters.workflowId && interaction.workflowId !== filters.workflowId) {
            return false;
          }
          if (filters.agentId && 
              interaction.initiatorAgentId !== filters.agentId && 
              interaction.targetAgentId !== filters.agentId) {
            return false;
          }
          if (filters.type && interaction.interactionType !== filters.type) {
            return false;
          }
          if (filters.status && interaction.status !== filters.status) {
            return false;
          }
          if (filters.hasUserIntervention !== undefined) {
            const hasIntervention = !!interaction.userIntervention;
            if (filters.hasUserIntervention !== hasIntervention) {
              return false;
            }
          }
          if (filters.fromDate && new Date(interaction.createdAt) < new Date(filters.fromDate)) {
            return false;
          }
          if (filters.toDate && new Date(interaction.createdAt) > new Date(filters.toDate)) {
            return false;
          }
          return true;
        });
      },

      // === Timeline ===

      getWorkflowTimeline: (workflowId: string) => {
        return Array.from(get().interactions.values())
          .filter((interaction) => interaction.workflowId === workflowId)
          .sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
      },

      // === Statistics ===

      getInteractionStats: (workflowId?: string) => {
        const interactions = workflowId 
          ? get().getInteractionsByWorkflow(workflowId)
          : Array.from(get().interactions.values());

        const completed = interactions.filter((i) => i.status === 'completed');
        const totalDuration = completed.reduce((sum, i) => sum + (i.durationMs ?? 0), 0);
        const totalTokens = interactions.reduce(
          (sum, i) => sum + (i.tokenUsage?.total ?? 0), 
          0
        );

        return {
          total: interactions.length,
          pending: interactions.filter((i) => i.status === 'pending').length,
          inProgress: interactions.filter((i) => i.status === 'in_progress').length,
          completed: completed.length,
          failed: interactions.filter((i) => i.status === 'failed').length,
          avgDurationMs: completed.length > 0 ? totalDuration / completed.length : 0,
          totalTokens,
        };
      },

      // === Selection ===

      selectInteraction: (id: string | null) => {
        set((state) => {
          state.selectedInteractionId = id;
        });
      },

      // === Cleanup ===

      clearWorkflowInteractions: (workflowId: string) => {
        set((state) => {
          const toDelete: string[] = [];
          state.interactions.forEach((interaction, id) => {
            if (interaction.workflowId === workflowId) {
              toDelete.push(id);
            }
          });
          toDelete.forEach((id) => state.interactions.delete(id));
        });
      },

      clearAllInteractions: () => {
        set((state) => {
          state.interactions.clear();
          state.selectedInteractionId = null;
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
      name: 'squadaid-interactions',
      storage: mapStorage,
      partialize: (state) => ({
        interactions: state.interactions,
      }),
    }
  )
);

/**
 * Selector hooks for optimized re-renders.
 */
export const useInteraction = (id: string) =>
  useInteractionStore((state) => state.interactions.get(id));

export const useSelectedInteraction = () =>
  useInteractionStore((state) =>
    state.selectedInteractionId
      ? state.interactions.get(state.selectedInteractionId)
      : undefined
  );

export const useActiveWorkflowInteractions = () =>
  useInteractionStore((state) =>
    state.activeWorkflowId
      ? state.getInteractionsByWorkflow(state.activeWorkflowId)
      : []
  );

export const useInteractionCount = () =>
  useInteractionStore((state) => state.interactions.size);
