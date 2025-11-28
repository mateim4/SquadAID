/**
 * @file role.ts
 * @description Role system type definitions for AI agents.
 * Roles define the behavioral guidelines, capabilities, and constraints
 * that shape how an agent operates within a workflow.
 */

/**
 * Specification for an artifact that a role is expected to produce.
 */
export interface ArtifactSpec {
  /** Type of artifact (e.g., "architecture-diagram", "code-file", "document") */
  type: string;
  /** Expected file format (e.g., "svg", "md", "ts", "json") */
  format: string;
  /** Whether this artifact is required for task completion */
  required: boolean;
  /** Human-readable description of the artifact */
  description?: string;
  /** Example or template for the artifact */
  example?: string;
}

/**
 * Detailed attributes that define a role's behavior and constraints.
 */
export interface RoleAttributes {
  /** Brief description of the role's purpose */
  description: string;
  
  /** How this role interacts with other agents */
  crossAgentInteraction: string;
  
  /** Primary objectives this role aims to achieve */
  objectives: string;
  
  /** Methodology or approach the role follows */
  methodology: string;
  
  /** Ordered list of process steps the role follows */
  processSteps: string[];
  
  /** Criteria that must be met for task completion */
  completionCriteria: string;
  
  /** Policy for handling blocked or stuck situations */
  blockHandlingPolicy: string;
  
  /** Authority level (1-5) determining decision-making power */
  authorityLevel: number;
  
  /** Types of interactions this role can initiate */
  interactionTypes: RoleInteractionType[];
  
  /** Maximum interactions per workflow (null = unlimited) */
  maxInteractions: number | null;
  
  /** Policy for accepting collaboration from other agents */
  collaborationSatisfactionPolicy: string;
  
  /** How and when progress should be reported */
  progressReportingPolicy: string;
  
  /** Policy for handling unclear or ambiguous scope */
  unclearScopePolicy: string;
  
  /** List of artifacts this role is expected to produce */
  expectedArtifacts: ArtifactSpec[];
  
  /** Skills or competencies associated with this role */
  skills?: string[];
  
  /** Keywords for searching and filtering roles */
  tags?: string[];
}

/**
 * Types of interactions a role can participate in.
 */
export type RoleInteractionType =
  | 'delegation'      // Assign work to another agent
  | 'collaboration'   // Work together on a shared task
  | 'review'          // Review another agent's work
  | 'escalation'      // Escalate issues to higher authority
  | 'consultation'    // Seek advice without delegation
  | 'notification'    // Inform without expecting response
  | 'supervision'     // Supervise another agent
  | 'handoff';        // Transfer responsibility completely

/**
 * Complete role definition.
 */
export interface Role {
  /** Unique identifier for the role */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  
  /** Whether this is a built-in system role */
  isBuiltIn: boolean;
  
  /** Detailed role attributes */
  attributes: RoleAttributes;
  
  /** Icon name from Fluent UI icons */
  icon?: string;
  
  /** Color theme for UI representation */
  color?: string;
  
  /** Category for organization (e.g., "engineering", "management") */
  category?: RoleCategory;
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * Categories for organizing roles.
 */
export type RoleCategory =
  | 'engineering'
  | 'management'
  | 'design'
  | 'research'
  | 'operations'
  | 'quality'
  | 'custom';

/**
 * Summary version of a role for lists and previews.
 */
export interface RoleSummary {
  id: string;
  name: string;
  description: string;
  authorityLevel: number;
  isBuiltIn: boolean;
  icon?: string;
  color?: string;
  category?: RoleCategory;
}

/**
 * Creates a RoleSummary from a full Role.
 * @param role - The complete role object
 * @returns Summarized role data
 */
export function toRoleSummary(role: Role): RoleSummary {
  return {
    id: role.id,
    name: role.name,
    description: role.attributes.description,
    authorityLevel: role.attributes.authorityLevel,
    isBuiltIn: role.isBuiltIn,
    icon: role.icon,
    color: role.color,
    category: role.category,
  };
}

/**
 * Validates a role object has all required fields.
 * @param role - The role to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateRole(role: Partial<Role>): string[] {
  const errors: string[] = [];
  
  if (!role.id) errors.push('Role ID is required');
  if (!role.name) errors.push('Role name is required');
  if (!role.version) errors.push('Role version is required');
  if (!role.attributes) {
    errors.push('Role attributes are required');
  } else {
    if (!role.attributes.description) errors.push('Role description is required');
    if (role.attributes.authorityLevel === undefined || 
        role.attributes.authorityLevel < 1 || 
        role.attributes.authorityLevel > 5) {
      errors.push('Authority level must be between 1 and 5');
    }
    if (!role.attributes.processSteps?.length) {
      errors.push('At least one process step is required');
    }
  }
  
  return errors;
}

/**
 * Default role template for creating new custom roles.
 */
export const DEFAULT_ROLE_TEMPLATE: Omit<Role, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'New Role',
  version: '1.0.0',
  isBuiltIn: false,
  category: 'custom',
  attributes: {
    description: '',
    crossAgentInteraction: 'Collaborates with other agents as needed',
    objectives: '',
    methodology: '',
    processSteps: ['Analyze task', 'Execute work', 'Report completion'],
    completionCriteria: 'Task objectives achieved and verified',
    blockHandlingPolicy: 'Report blockers to team manager or user',
    authorityLevel: 2,
    interactionTypes: ['collaboration', 'consultation'],
    maxInteractions: null,
    collaborationSatisfactionPolicy: 'Accept collaboration requests when relevant',
    progressReportingPolicy: 'Report progress at key milestones',
    unclearScopePolicy: 'Request clarification before proceeding',
    expectedArtifacts: [],
  },
};
