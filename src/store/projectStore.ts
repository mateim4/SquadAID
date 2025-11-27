import { create } from 'zustand';
import type { ProjectMode } from '@/types';

type ProjectContext = {
  slug?: string;
  mode?: ProjectMode;
  repo?: string; // owner/name
};

type ProjectStore = ProjectContext & {
  setProjectInfo: (ctx: ProjectContext) => void;
  clear: () => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  slug: undefined,
  mode: undefined,
  repo: undefined,
  setProjectInfo: (ctx) => set(() => ({ ...ctx })),
  clear: () => set({ slug: undefined, mode: undefined, repo: undefined }),
}));
