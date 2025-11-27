import { create } from "zustand";
import { Project } from "../types";
// import { mockProjects } from "../data/mockProjects";

interface ProjectsState {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  upsertProject: (project: Project) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [], // mockProjects,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  upsertProject: (project) =>
    set((state) => {
      const index = state.projects.findIndex((p) => p.id === project.id);
      if (index === -1) {
        // Project not found, add new project
        return { projects: [...state.projects, project] };
      } else {
        // Project found, update existing project
        const projects = [...state.projects];
        projects[index] = project;
        return { projects };
      }
    }),
}));
