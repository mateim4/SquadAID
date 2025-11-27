import { create } from 'zustand';

export type AgentMetricSample = {
  ts: number;
  agentId: string;
  tokensUsed: number;
  currentContext: number;
  maxContext: number;
  todoCount: number;
};

export interface MetricsState {
  samples: AgentMetricSample[];
  addSample: (s: AgentMetricSample) => void;
  clear: (agentId?: string) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  samples: [],
  addSample: (s) => set((st) => ({ samples: [...st.samples, s] })),
  clear: (agentId) => {
    if (!agentId) return set({ samples: [] });
    set((st) => ({ samples: st.samples.filter((x) => x.agentId !== agentId) }));
  },
}));
