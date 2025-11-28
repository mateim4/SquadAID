/**
 * @file enhancedProjectStore.ts
 * @description Zustand store for enhanced project management.
 * Handles projects, tasks, artifacts, and project statistics.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ProjectMode } from '@/types';
import {
  EnhancedProject,
  EnhancedTask,
  Artifact,
  ProjectStatus,
  EnhancedTaskStatus,
  TaskPriority,
  ArtifactType,
  ProjectStats,
  createProject,
  createTask,
  createArtifact,
  calculateProjectCompletion,
} from '@/types/enhanced-project';

/**
 * Enhanced project store state interface.
 */
interface EnhancedProjectState {
  /** Map of project ID to project data */
  projects: Map<string, EnhancedProject>;
  
  /** Map of task ID to task data */
  tasks: Map<string, EnhancedTask>;
  
  /** Map of artifact ID to artifact data */
  artifacts: Map<string, Artifact>;
  
  /** Currently active project ID */
  activeProjectId: string | null;
  
  /** Currently selected task ID */
  selectedTaskId: string | null;
  
  /** Currently selected artifact ID */
  selectedArtifactId: string | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: string | null;
}

/**
 * Enhanced project store actions interface.
 */
interface EnhancedProjectActions {
  // Project CRUD
  createProject: (data: {
    name: string;
    mode: ProjectMode;
    description?: string;
    repo?: string;
    folder?: string;
  }) => string;
  updateProject: (id: string, updates: Partial<EnhancedProject>) => void;
  deleteProject: (id: string) => void;
  setProjectStatus: (id: string, status: ProjectStatus) => void;
  
  // Project Getters
  getProject: (id: string) => EnhancedProject | undefined;
  getProjectsByStatus: (status: ProjectStatus) => EnhancedProject[];
  getActiveProject: () => EnhancedProject | undefined;
  setActiveProject: (id: string | null) => void;
  
  // Task CRUD
  addTask: (data: {
    projectId: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    assignedAgentId?: string;
    assignedRoleId?: string;
  }) => string;
  updateTask: (id: string, updates: Partial<EnhancedTask>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: EnhancedTaskStatus) => void;
  moveTaskToStatus: (id: string, status: EnhancedTaskStatus) => void;
  assignTaskToAgent: (taskId: string, agentId: string, roleId?: string) => void;
  
  // Task Getters
  getTask: (id: string) => EnhancedTask | undefined;
  getProjectTasks: (projectId: string) => EnhancedTask[];
  getTasksByStatus: (projectId: string, status: EnhancedTaskStatus) => EnhancedTask[];
  getTasksByAgent: (agentId: string) => EnhancedTask[];
  selectTask: (id: string | null) => void;
  
  // Task Dependencies
  addTaskDependency: (taskId: string, dependencyId: string) => void;
  removeTaskDependency: (taskId: string, dependencyId: string) => void;
  getBlockingTasks: (taskId: string) => EnhancedTask[];
  
  // Task Subtasks
  addSubtask: (taskId: string, title: string) => void;
  completeSubtask: (taskId: string, subtaskId: string) => void;
  
  // Artifact CRUD
  addArtifact: (data: {
    projectId: string;
    taskId: string;
    workflowId: string;
    creatorAgentId: string;
    creatorRoleId: string;
    filename: string;
    type: ArtifactType;
    content?: string;
  }) => string;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
  deleteArtifact: (id: string) => void;
  approveArtifact: (id: string, reviewedBy: string, comments?: string) => void;
  rejectArtifact: (id: string, reviewedBy: string, comments: string) => void;
  
  // Artifact Getters
  getArtifact: (id: string) => Artifact | undefined;
  getProjectArtifacts: (projectId: string) => Artifact[];
  getTaskArtifacts: (taskId: string) => Artifact[];
  selectArtifact: (id: string | null) => void;
  
  // Statistics
  getProjectStats: (projectId: string) => ProjectStats;
  
  // Bulk Operations
  importProject: (project: EnhancedProject, tasks: EnhancedTask[], artifacts: Artifact[]) => void;
  exportProject: (projectId: string) => { project: EnhancedProject; tasks: EnhancedTask[]; artifacts: Artifact[] } | null;
  
  // State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state for the enhanced project store.
 */
const initialState: EnhancedProjectState = {
  projects: new Map(),
  tasks: new Map(),
  artifacts: new Map(),
  activeProjectId: null,
  selectedTaskId: null,
  selectedArtifactId: null,
  isLoading: false,
  error: null,
};

/**
 * Custom serialization for Map to work with persist middleware.
 */
const mapStorage = createJSONStorage(() => localStorage, {
  reviver: (key, value) => {
    if ((key === 'projects' || key === 'tasks' || key === 'artifacts') && 
        typeof value === 'object' && value !== null) {
      return new Map(Object.entries(value));
    }
    return value;
  },
  replacer: (key, value) => {
    if ((key === 'projects' || key === 'tasks' || key === 'artifacts') && 
        value instanceof Map) {
      return Object.fromEntries(value);
    }
    return value;
  },
});

/**
 * Enhanced Project Zustand store with persistence and immer.
 */
export const useEnhancedProjectStore = create<EnhancedProjectState & EnhancedProjectActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // === Project CRUD ===

      createProject: (data) => {
        const project = createProject(data);
        set((state) => {
          state.projects.set(project.id, project);
        });
        return project.id;
      },

      updateProject: (id: string, updates: Partial<EnhancedProject>) => {
        set((state) => {
          const project = state.projects.get(id);
          if (project) {
            state.projects.set(id, {
              ...project,
              ...updates,
              updatedAt: new Date().toISOString(),
            });
          }
        });
      },

      deleteProject: (id: string) => {
        set((state) => {
          // Delete associated tasks
          state.tasks.forEach((task, taskId) => {
            if (task.projectId === id) {
              state.tasks.delete(taskId);
            }
          });
          // Delete associated artifacts
          state.artifacts.forEach((artifact, artifactId) => {
            if (artifact.projectId === id) {
              state.artifacts.delete(artifactId);
            }
          });
          // Delete project
          state.projects.delete(id);
          if (state.activeProjectId === id) {
            state.activeProjectId = null;
          }
        });
      },

      setProjectStatus: (id: string, status: ProjectStatus) => {
        set((state) => {
          const project = state.projects.get(id);
          if (project) {
            project.status = status;
            project.updatedAt = new Date().toISOString();
            if (status === 'completed') {
              project.completedAt = new Date().toISOString();
            }
          }
        });
      },

      // === Project Getters ===

      getProject: (id: string) => {
        return get().projects.get(id);
      },

      getProjectsByStatus: (status: ProjectStatus) => {
        return Array.from(get().projects.values()).filter(
          (project) => project.status === status
        );
      },

      getActiveProject: () => {
        const activeId = get().activeProjectId;
        return activeId ? get().projects.get(activeId) : undefined;
      },

      setActiveProject: (id: string | null) => {
        set((state) => {
          state.activeProjectId = id;
        });
      },

      // === Task CRUD ===

      addTask: (data) => {
        const task = createTask(data);
        set((state) => {
          state.tasks.set(task.id, task);
        });
        return task.id;
      },

      updateTask: (id: string, updates: Partial<EnhancedTask>) => {
        set((state) => {
          const task = state.tasks.get(id);
          if (task) {
            state.tasks.set(id, {
              ...task,
              ...updates,
              updatedAt: new Date().toISOString(),
            });
          }
        });
      },

      deleteTask: (id: string) => {
        set((state) => {
          // Remove from other tasks' dependencies
          state.tasks.forEach((task) => {
            task.dependencies = task.dependencies.filter((d) => d !== id);
            if (task.blocks) {
              task.blocks = task.blocks.filter((b) => b !== id);
            }
          });
          // Delete associated artifacts
          state.artifacts.forEach((artifact, artifactId) => {
            if (artifact.taskId === id) {
              state.artifacts.delete(artifactId);
            }
          });
          state.tasks.delete(id);
          if (state.selectedTaskId === id) {
            state.selectedTaskId = null;
          }
        });
      },

      setTaskStatus: (id: string, status: EnhancedTaskStatus) => {
        set((state) => {
          const task = state.tasks.get(id);
          if (task) {
            task.status = status;
            task.updatedAt = new Date().toISOString();
            if (status === 'in_progress' && !task.startedAt) {
              task.startedAt = new Date().toISOString();
            }
            if (status === 'done') {
              task.completedAt = new Date().toISOString();
              if (task.startedAt) {
                task.actualDurationMinutes = Math.round(
                  (new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 60000
                );
              }
            }
          }
        });
      },

      moveTaskToStatus: (id: string, status: EnhancedTaskStatus) => {
        get().setTaskStatus(id, status);
      },

      assignTaskToAgent: (taskId: string, agentId: string, roleId?: string) => {
        set((state) => {
          const task = state.tasks.get(taskId);
          if (task) {
            task.assignedAgentId = agentId;
            if (roleId) {
              task.assignedRoleId = roleId;
            }
            task.updatedAt = new Date().toISOString();
          }
        });
      },

      // === Task Getters ===

      getTask: (id: string) => {
        return get().tasks.get(id);
      },

      getProjectTasks: (projectId: string) => {
        return Array.from(get().tasks.values())
          .filter((task) => task.projectId === projectId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      },

      getTasksByStatus: (projectId: string, status: EnhancedTaskStatus) => {
        return Array.from(get().tasks.values())
          .filter((task) => task.projectId === projectId && task.status === status)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      },

      getTasksByAgent: (agentId: string) => {
        return Array.from(get().tasks.values()).filter(
          (task) => task.assignedAgentId === agentId
        );
      },

      selectTask: (id: string | null) => {
        set((state) => {
          state.selectedTaskId = id;
        });
      },

      // === Task Dependencies ===

      addTaskDependency: (taskId: string, dependencyId: string) => {
        set((state) => {
          const task = state.tasks.get(taskId);
          const dependency = state.tasks.get(dependencyId);
          if (task && dependency && !task.dependencies.includes(dependencyId)) {
            task.dependencies.push(dependencyId);
            if (!dependency.blocks) {
              dependency.blocks = [];
            }
            dependency.blocks.push(taskId);
          }
        });
      },

      removeTaskDependency: (taskId: string, dependencyId: string) => {
        set((state) => {
          const task = state.tasks.get(taskId);
          const dependency = state.tasks.get(dependencyId);
          if (task) {
            task.dependencies = task.dependencies.filter((d) => d !== dependencyId);
          }
          if (dependency?.blocks) {
            dependency.blocks = dependency.blocks.filter((b) => b !== taskId);
          }
        });
      },

      getBlockingTasks: (taskId: string) => {
        const task = get().tasks.get(taskId);
        if (!task) return [];
        return task.dependencies
          .map((depId) => get().tasks.get(depId))
          .filter((t): t is EnhancedTask => t !== undefined && t.status !== 'done');
      },

      // === Task Subtasks ===

      addSubtask: (taskId: string, title: string) => {
        set((state) => {
          const task = state.tasks.get(taskId);
          if (task) {
            if (!task.subtasks) {
              task.subtasks = [];
            }
            task.subtasks.push({
              id: crypto.randomUUID(),
              title,
              completed: false,
            });
            task.updatedAt = new Date().toISOString();
          }
        });
      },

      completeSubtask: (taskId: string, subtaskId: string) => {
        set((state) => {
          const task = state.tasks.get(taskId);
          if (task?.subtasks) {
            const subtask = task.subtasks.find((s) => s.id === subtaskId);
            if (subtask) {
              subtask.completed = true;
              subtask.completedAt = new Date().toISOString();
            }
            task.updatedAt = new Date().toISOString();
          }
        });
      },

      // === Artifact CRUD ===

      addArtifact: (data) => {
        const artifact = createArtifact(data);
        set((state) => {
          state.artifacts.set(artifact.id, artifact);
          // Add artifact reference to task
          const task = state.tasks.get(data.taskId);
          if (task && !task.artifactIds.includes(artifact.id)) {
            task.artifactIds.push(artifact.id);
          }
        });
        return artifact.id;
      },

      updateArtifact: (id: string, updates: Partial<Artifact>) => {
        set((state) => {
          const artifact = state.artifacts.get(id);
          if (artifact) {
            // Increment version if content changed
            const newVersion = updates.content !== undefined ? artifact.version + 1 : artifact.version;
            state.artifacts.set(id, {
              ...artifact,
              ...updates,
              version: newVersion,
              updatedAt: new Date().toISOString(),
            });
          }
        });
      },

      deleteArtifact: (id: string) => {
        set((state) => {
          const artifact = state.artifacts.get(id);
          if (artifact) {
            // Remove from task's artifact list
            const task = state.tasks.get(artifact.taskId);
            if (task) {
              task.artifactIds = task.artifactIds.filter((a) => a !== id);
            }
          }
          state.artifacts.delete(id);
          if (state.selectedArtifactId === id) {
            state.selectedArtifactId = null;
          }
        });
      },

      approveArtifact: (id: string, reviewedBy: string, comments?: string) => {
        set((state) => {
          const artifact = state.artifacts.get(id);
          if (artifact) {
            artifact.status = 'approved';
            artifact.reviewedBy = reviewedBy;
            artifact.reviewedAt = new Date().toISOString();
            artifact.reviewComments = comments;
            artifact.updatedAt = new Date().toISOString();
          }
        });
      },

      rejectArtifact: (id: string, reviewedBy: string, comments: string) => {
        set((state) => {
          const artifact = state.artifacts.get(id);
          if (artifact) {
            artifact.status = 'rejected';
            artifact.reviewedBy = reviewedBy;
            artifact.reviewedAt = new Date().toISOString();
            artifact.reviewComments = comments;
            artifact.updatedAt = new Date().toISOString();
          }
        });
      },

      // === Artifact Getters ===

      getArtifact: (id: string) => {
        return get().artifacts.get(id);
      },

      getProjectArtifacts: (projectId: string) => {
        return Array.from(get().artifacts.values()).filter(
          (artifact) => artifact.projectId === projectId
        );
      },

      getTaskArtifacts: (taskId: string) => {
        return Array.from(get().artifacts.values()).filter(
          (artifact) => artifact.taskId === taskId
        );
      },

      selectArtifact: (id: string | null) => {
        set((state) => {
          state.selectedArtifactId = id;
        });
      },

      // === Statistics ===

      getProjectStats: (projectId: string) => {
        const tasks = get().getProjectTasks(projectId);
        const artifacts = get().getProjectArtifacts(projectId);
        const project = get().projects.get(projectId);

        const completedTasks = tasks.filter((t) => t.status === 'done');
        const totalDuration = completedTasks.reduce(
          (sum, t) => sum + (t.actualDurationMinutes ?? 0),
          0
        );

        return {
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
          blockedTasks: tasks.filter((t) => t.status === 'blocked').length,
          totalArtifacts: artifacts.length,
          approvedArtifacts: artifacts.filter((a) => a.status === 'approved').length,
          totalTokensUsed: project?.tokensUsed ?? 0,
          totalCostCents: project?.costSpentCents ?? 0,
          avgTaskDurationMinutes: completedTasks.length > 0 
            ? totalDuration / completedTasks.length 
            : 0,
          completionPercentage: calculateProjectCompletion(tasks),
        };
      },

      // === Bulk Operations ===

      importProject: (project, tasks, artifacts) => {
        set((state) => {
          state.projects.set(project.id, project);
          tasks.forEach((task) => state.tasks.set(task.id, task));
          artifacts.forEach((artifact) => state.artifacts.set(artifact.id, artifact));
        });
      },

      exportProject: (projectId: string) => {
        const project = get().projects.get(projectId);
        if (!project) return null;

        const tasks = get().getProjectTasks(projectId);
        const artifacts = get().getProjectArtifacts(projectId);

        return { project, tasks, artifacts };
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
      name: 'squadaid-enhanced-projects',
      storage: mapStorage,
      partialize: (state) => ({
        projects: state.projects,
        tasks: state.tasks,
        artifacts: state.artifacts,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);

/**
 * Selector hooks for optimized re-renders.
 */
export const useProject = (id: string) =>
  useEnhancedProjectStore((state) => state.projects.get(id));

export const useActiveProject = () =>
  useEnhancedProjectStore((state) =>
    state.activeProjectId ? state.projects.get(state.activeProjectId) : undefined
  );

export const useProjectsArray = () =>
  useEnhancedProjectStore((state) => Array.from(state.projects.values()));

export const useProjectCount = () =>
  useEnhancedProjectStore((state) => state.projects.size);

export const useSelectedTask = () =>
  useEnhancedProjectStore((state) =>
    state.selectedTaskId ? state.tasks.get(state.selectedTaskId) : undefined
  );
