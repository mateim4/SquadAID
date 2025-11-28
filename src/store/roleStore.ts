/**
 * @file roleStore.ts
 * @description Zustand store for managing the role library.
 * Handles built-in roles, custom roles, and role assignments.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Role, RoleSummary, toRoleSummary, validateRole, RoleCategory, RoleInteractionType } from '@/types/role';

/**
 * Role store state interface.
 */
interface RoleState {
  /** Map of role ID to role data */
  roles: Map<string, Role>;
  
  /** Built-in role IDs (for filtering) */
  builtInRoleIds: Set<string>;
  
  /** Currently selected role ID for preview */
  selectedRoleId: string | null;
  
  /** Whether built-in roles have been loaded */
  builtInLoaded: boolean;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: string | null;
}

/**
 * Role store actions interface.
 */
interface RoleActions {
  // Loading
  loadBuiltInRoles: () => Promise<void>;
  
  // CRUD Operations
  addRole: (role: Role) => string[];
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => boolean;
  duplicateRole: (id: string, newName: string) => string | null;
  
  // Getters
  getRole: (id: string) => Role | undefined;
  getRoleSummaries: () => RoleSummary[];
  getRolesByCategory: (category: RoleCategory) => Role[];
  getBuiltInRoles: () => Role[];
  getCustomRoles: () => Role[];
  searchRoles: (query: string) => Role[];
  
  // Selection
  selectRole: (id: string | null) => void;
  
  // Import/Export
  importRoles: (roles: Role[]) => void;
  exportRole: (id: string) => string | null;
  
  // State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state for the role store.
 */
const initialState: RoleState = {
  roles: new Map(),
  builtInRoleIds: new Set(),
  selectedRoleId: null,
  builtInLoaded: false,
  isLoading: false,
  error: null,
};

/**
 * Custom serialization for Map/Set to work with persist middleware.
 */
const customStorage = createJSONStorage(() => localStorage, {
  reviver: (key, value) => {
    if (key === 'roles' && typeof value === 'object' && value !== null) {
      return new Map(Object.entries(value));
    }
    if (key === 'builtInRoleIds' && Array.isArray(value)) {
      return new Set(value);
    }
    return value;
  },
  replacer: (key, value) => {
    if (key === 'roles' && value instanceof Map) {
      return Object.fromEntries(value);
    }
    if (key === 'builtInRoleIds' && value instanceof Set) {
      return Array.from(value);
    }
    return value;
  },
});

/**
 * Built-in role definitions.
 * These are loaded by default and cannot be deleted.
 */
const BUILT_IN_ROLES: Role[] = [
  {
    id: 'role-architect-001',
    name: 'Software Architect',
    version: '1.0.0',
    isBuiltIn: true,
    icon: 'Building',
    color: '#3b82f6',
    category: 'engineering',
    attributes: {
      description: 'Designs system architecture and technical strategy for software projects',
      crossAgentInteraction: 'Coordinates with Engineers and QA to validate designs, reviews technical decisions',
      objectives: 'Create scalable, maintainable system architectures that meet business requirements',
      methodology: 'Research-driven, pattern-based design with emphasis on best practices',
      processSteps: [
        'Gather and analyze requirements',
        'Research technical constraints and options',
        'Design high-level architecture',
        'Create detailed component specifications',
        'Document architecture decisions',
        'Review with team and stakeholders',
      ],
      completionCriteria: 'Architecture document approved by stakeholders with no blocking issues',
      blockHandlingPolicy: 'Escalate to user if technical constraints conflict with requirements',
      authorityLevel: 4,
      interactionTypes: ['delegation', 'consultation', 'review'],
      maxInteractions: null,
      collaborationSatisfactionPolicy: 'Require approval on major design decisions',
      progressReportingPolicy: 'Report after each design milestone',
      unclearScopePolicy: 'Request clarification from user before proceeding',
      expectedArtifacts: [
        { type: 'architecture-diagram', format: 'svg', required: true, description: 'System component diagram' },
        { type: 'design-document', format: 'md', required: true, description: 'Detailed architecture specification' },
      ],
      skills: ['system-design', 'api-design', 'database-design', 'cloud-architecture'],
      tags: ['architecture', 'design', 'technical-leadership'],
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-engineer-001',
    name: 'Software Engineer',
    version: '1.0.0',
    isBuiltIn: true,
    icon: 'Code',
    color: '#10b981',
    category: 'engineering',
    attributes: {
      description: 'Implements features and fixes according to specifications',
      crossAgentInteraction: 'Receives tasks from Architect/Manager, collaborates with QA for testing',
      objectives: 'Write clean, tested, maintainable code that meets requirements',
      methodology: 'Test-driven development with code review',
      processSteps: [
        'Understand requirements and acceptance criteria',
        'Design implementation approach',
        'Write unit tests',
        'Implement feature',
        'Refactor and optimize',
        'Submit for review',
      ],
      completionCriteria: 'Code passes all tests, code review approved, merged to main',
      blockHandlingPolicy: 'Request clarification from assigner or escalate technical issues',
      authorityLevel: 2,
      interactionTypes: ['collaboration', 'consultation', 'escalation'],
      maxInteractions: null,
      collaborationSatisfactionPolicy: 'Accept all reasonable collaboration requests',
      progressReportingPolicy: 'Report daily progress and blockers',
      unclearScopePolicy: 'Request clarification before starting implementation',
      expectedArtifacts: [
        { type: 'code-file', format: 'ts', required: true, description: 'Implementation code' },
        { type: 'test-file', format: 'ts', required: true, description: 'Unit tests' },
      ],
      skills: ['coding', 'testing', 'debugging', 'refactoring'],
      tags: ['development', 'coding', 'implementation'],
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-qa-001',
    name: 'QA Engineer',
    version: '1.0.0',
    isBuiltIn: true,
    icon: 'CheckmarkCircle',
    color: '#f59e0b',
    category: 'quality',
    attributes: {
      description: 'Ensures software quality through testing and validation',
      crossAgentInteraction: 'Reviews code from Engineers, reports issues, validates fixes',
      objectives: 'Identify defects early and ensure quality standards are met',
      methodology: 'Comprehensive testing including unit, integration, and E2E tests',
      processSteps: [
        'Review requirements and acceptance criteria',
        'Design test plan',
        'Write test cases',
        'Execute tests',
        'Report defects',
        'Validate fixes',
      ],
      completionCriteria: 'All test cases pass, no critical defects remain',
      blockHandlingPolicy: 'Report blocking defects immediately to team',
      authorityLevel: 3,
      interactionTypes: ['review', 'collaboration', 'notification'],
      maxInteractions: null,
      collaborationSatisfactionPolicy: 'Prioritize defect resolution over new testing',
      progressReportingPolicy: 'Report test coverage and defect status daily',
      unclearScopePolicy: 'Request clarification on acceptance criteria',
      expectedArtifacts: [
        { type: 'test-plan', format: 'md', required: true, description: 'Test plan document' },
        { type: 'test-report', format: 'md', required: true, description: 'Test execution report' },
      ],
      skills: ['testing', 'automation', 'defect-analysis'],
      tags: ['quality', 'testing', 'validation'],
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-manager-001',
    name: 'Team Manager',
    version: '1.0.0',
    isBuiltIn: true,
    icon: 'People',
    color: '#8b5cf6',
    category: 'management',
    attributes: {
      description: 'Coordinates team activities and manages project execution',
      crossAgentInteraction: 'Delegates tasks, monitors progress, resolves conflicts',
      objectives: 'Ensure project delivers on time and within budget',
      methodology: 'Agile project management with regular check-ins',
      processSteps: [
        'Plan sprint/iteration',
        'Assign tasks to team',
        'Monitor progress',
        'Remove blockers',
        'Report status to stakeholders',
        'Conduct retrospectives',
      ],
      completionCriteria: 'Sprint goals achieved, team healthy and productive',
      blockHandlingPolicy: 'Escalate to stakeholders if unable to resolve within team',
      authorityLevel: 4,
      interactionTypes: ['delegation', 'supervision', 'escalation', 'notification'],
      maxInteractions: null,
      collaborationSatisfactionPolicy: 'Prioritize team health and delivery balance',
      progressReportingPolicy: 'Weekly status reports to stakeholders',
      unclearScopePolicy: 'Clarify with product owner or stakeholders',
      expectedArtifacts: [
        { type: 'sprint-plan', format: 'md', required: true, description: 'Sprint planning document' },
        { type: 'status-report', format: 'md', required: true, description: 'Weekly status report' },
      ],
      skills: ['project-management', 'team-leadership', 'communication'],
      tags: ['management', 'coordination', 'leadership'],
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-researcher-001',
    name: 'Researcher',
    version: '1.0.0',
    isBuiltIn: true,
    icon: 'Search',
    color: '#06b6d4',
    category: 'research',
    attributes: {
      description: 'Investigates technologies, solutions, and best practices',
      crossAgentInteraction: 'Provides research findings to Architects and Engineers',
      objectives: 'Deliver actionable insights and recommendations',
      methodology: 'Systematic research with source validation',
      processSteps: [
        'Define research questions',
        'Gather sources',
        'Analyze information',
        'Synthesize findings',
        'Create recommendations',
        'Present results',
      ],
      completionCriteria: 'Research questions answered with validated sources',
      blockHandlingPolicy: 'Report if unable to find reliable information',
      authorityLevel: 2,
      interactionTypes: ['consultation', 'collaboration', 'notification'],
      maxInteractions: null,
      collaborationSatisfactionPolicy: 'Prioritize accuracy over speed',
      progressReportingPolicy: 'Report findings as discovered',
      unclearScopePolicy: 'Request clarification on research scope',
      expectedArtifacts: [
        { type: 'research-report', format: 'md', required: true, description: 'Research findings document' },
      ],
      skills: ['research', 'analysis', 'documentation'],
      tags: ['research', 'analysis', 'investigation'],
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-designer-001',
    name: 'UX Designer',
    version: '1.0.0',
    isBuiltIn: true,
    icon: 'DesignIdeas',
    color: '#ec4899',
    category: 'design',
    attributes: {
      description: 'Designs user interfaces and experiences',
      crossAgentInteraction: 'Collaborates with Engineers on implementation, validates with QA',
      objectives: 'Create intuitive, accessible, and visually appealing interfaces',
      methodology: 'User-centered design with iterative prototyping',
      processSteps: [
        'Research user needs',
        'Create wireframes',
        'Design high-fidelity mockups',
        'Prototype interactions',
        'Conduct usability testing',
        'Iterate based on feedback',
      ],
      completionCriteria: 'Design approved by stakeholders, implementation spec complete',
      blockHandlingPolicy: 'Request user research if needs unclear',
      authorityLevel: 3,
      interactionTypes: ['collaboration', 'review', 'consultation'],
      maxInteractions: null,
      collaborationSatisfactionPolicy: 'Prioritize user experience over aesthetic preferences',
      progressReportingPolicy: 'Share designs at each iteration',
      unclearScopePolicy: 'Conduct user research to clarify needs',
      expectedArtifacts: [
        { type: 'wireframe', format: 'svg', required: true, description: 'Wireframe layouts' },
        { type: 'mockup', format: 'svg', required: true, description: 'High-fidelity mockups' },
        { type: 'design-spec', format: 'md', required: true, description: 'Design specification' },
      ],
      skills: ['ui-design', 'ux-design', 'prototyping', 'user-research'],
      tags: ['design', 'ux', 'ui', 'user-experience'],
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-consultant-001',
    name: 'Business Consultant',
    version: '1.0.0',
    isBuiltIn: true,
    icon: 'Briefcase',
    color: '#6366f1',
    category: 'operations',
    attributes: {
      description: 'Provides business analysis and strategic guidance',
      crossAgentInteraction: 'Advises all roles on business requirements and priorities',
      objectives: 'Ensure technical solutions align with business objectives',
      methodology: 'Requirements analysis and stakeholder alignment',
      processSteps: [
        'Gather business requirements',
        'Analyze market and competition',
        'Define success metrics',
        'Validate technical feasibility',
        'Create business case',
        'Align stakeholders',
      ],
      completionCriteria: 'Business requirements documented and approved',
      blockHandlingPolicy: 'Escalate conflicting requirements to stakeholders',
      authorityLevel: 4,
      interactionTypes: ['consultation', 'delegation', 'review', 'escalation'],
      maxInteractions: null,
      collaborationSatisfactionPolicy: 'Prioritize business value and ROI',
      progressReportingPolicy: 'Report on requirements and alignment status',
      unclearScopePolicy: 'Conduct stakeholder interviews for clarification',
      expectedArtifacts: [
        { type: 'requirements-doc', format: 'md', required: true, description: 'Business requirements document' },
        { type: 'business-case', format: 'md', required: false, description: 'Business case analysis' },
      ],
      skills: ['business-analysis', 'requirements-gathering', 'stakeholder-management'],
      tags: ['business', 'strategy', 'requirements', 'analysis'],
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

/**
 * Role Zustand store with persistence and immer.
 */
export const useRoleStore = create<RoleState & RoleActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // === Loading ===

      loadBuiltInRoles: async () => {
        if (get().builtInLoaded) return;
        
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Load built-in roles
          BUILT_IN_ROLES.forEach((role) => {
            set((state) => {
              state.roles.set(role.id, role);
              state.builtInRoleIds.add(role.id);
            });
          });

          set((state) => {
            state.builtInLoaded = true;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load roles';
            state.isLoading = false;
          });
        }
      },

      // === CRUD Operations ===

      addRole: (role: Role) => {
        const errors = validateRole(role);
        if (errors.length > 0) {
          return errors;
        }

        set((state) => {
          state.roles.set(role.id, {
            ...role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
        return [];
      },

      updateRole: (id: string, updates: Partial<Role>) => {
        set((state) => {
          const role = state.roles.get(id);
          if (role && !role.isBuiltIn) {
            state.roles.set(id, {
              ...role,
              ...updates,
              updatedAt: new Date().toISOString(),
            });
          }
        });
      },

      deleteRole: (id: string) => {
        const role = get().roles.get(id);
        if (!role || role.isBuiltIn) {
          return false;
        }

        set((state) => {
          state.roles.delete(id);
          if (state.selectedRoleId === id) {
            state.selectedRoleId = null;
          }
        });
        return true;
      },

      duplicateRole: (id: string, newName: string) => {
        const original = get().roles.get(id);
        if (!original) return null;

        const newId = `role-custom-${crypto.randomUUID().slice(0, 8)}`;
        const newRole: Role = {
          ...original,
          id: newId,
          name: newName,
          isBuiltIn: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          state.roles.set(newId, newRole);
        });
        return newId;
      },

      // === Getters ===

      getRole: (id: string) => {
        return get().roles.get(id);
      },

      getRoleSummaries: () => {
        return Array.from(get().roles.values()).map(toRoleSummary);
      },

      getRolesByCategory: (category: RoleCategory) => {
        return Array.from(get().roles.values()).filter(
          (role) => role.category === category
        );
      },

      getBuiltInRoles: () => {
        return Array.from(get().roles.values()).filter((role) => role.isBuiltIn);
      },

      getCustomRoles: () => {
        return Array.from(get().roles.values()).filter((role) => !role.isBuiltIn);
      },

      searchRoles: (query: string) => {
        const lower = query.toLowerCase();
        return Array.from(get().roles.values()).filter(
          (role) =>
            role.name.toLowerCase().includes(lower) ||
            role.attributes.description.toLowerCase().includes(lower) ||
            role.attributes.tags?.some((tag) => tag.toLowerCase().includes(lower))
        );
      },

      // === Selection ===

      selectRole: (id: string | null) => {
        set((state) => {
          state.selectedRoleId = id;
        });
      },

      // === Import/Export ===

      importRoles: (roles: Role[]) => {
        set((state) => {
          roles.forEach((role) => {
            if (!role.isBuiltIn) {
              state.roles.set(role.id, {
                ...role,
                updatedAt: new Date().toISOString(),
              });
            }
          });
        });
      },

      exportRole: (id: string) => {
        const role = get().roles.get(id);
        if (!role) return null;
        return JSON.stringify(role, null, 2);
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
      name: 'squadaid-roles',
      storage: customStorage,
      partialize: (state) => ({
        roles: state.roles,
        builtInRoleIds: state.builtInRoleIds,
        builtInLoaded: state.builtInLoaded,
      }),
    }
  )
);

/**
 * Selector hooks for optimized re-renders.
 */
export const useRole = (id: string) =>
  useRoleStore((state) => state.roles.get(id));

export const useSelectedRole = () =>
  useRoleStore((state) =>
    state.selectedRoleId ? state.roles.get(state.selectedRoleId) : undefined
  );

export const useRolesArray = () =>
  useRoleStore((state) => Array.from(state.roles.values()));

export const useRoleCount = () =>
  useRoleStore((state) => state.roles.size);
