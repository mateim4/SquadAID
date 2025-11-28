/**
 * @file relationship.ts
 * @description Agent relationship type definitions.
 * Relationships define how agents interact with each other,
 * including authority levels, interaction patterns, and constraints.
 */

/**
 * Types of relationships between agents.
 * Each type implies different interaction patterns and authority dynamics.
 */
export enum RelationshipType {
  /** Agent A can assign tasks to Agent B */
  DELEGATION = 'delegation',
  /** Agents work together as peers */
  COLLABORATION = 'collaboration',
  /** Agent A reviews Agent B's output */
  REVIEW = 'review',
  /** Agent A can escalate issues to Agent B */
  ESCALATION = 'escalation',
  /** Agent A can ask Agent B for advice */
  CONSULTATION = 'consultation',
  /** Agent A depends on Agent B's output */
  DEPENDENCY = 'dependency',
  /** Agent A supervises Agent B */
  SUPERVISION = 'supervision',
}

/**
 * Metadata describing a relationship between two agents.
 */
export interface RelationshipMetadata {
  /** Type of relationship */
  type: RelationshipType;
  
  /** 
   * Authority level difference (positive = source has higher authority).
   * Range: -5 to 5
   */
  authorityDelta: number;
  
  /** Maximum interactions allowed per workflow (null = unlimited) */
  maxInteractionsPerWorkflow: number | null;
  
  /** Whether interactions can flow both directions */
  bidirectional: boolean;
  
  /** Whether target auto-approves requests from source */
  autoApproval: boolean;
  
  /** Priority level for this relationship (higher = processed first) */
  priority?: number;
  
  /** Conditions that must be met for interaction */
  conditions?: RelationshipCondition[];
  
  /** Performance metrics for this relationship */
  metrics?: RelationshipMetrics;
  
  /** Human-readable description of the relationship */
  description?: string;
}

/**
 * Conditions that govern when a relationship can be activated.
 */
export interface RelationshipCondition {
  /** Type of condition */
  type: 'task_status' | 'time_elapsed' | 'approval_required' | 'artifact_exists' | 'custom';
  /** Condition-specific value */
  value: string | number | boolean;
  /** Human-readable description */
  description?: string;
}

/**
 * Performance metrics tracked for a relationship.
 */
export interface RelationshipMetrics {
  /** Success rate of interactions (0.0 - 1.0) */
  successRate?: number;
  /** Average response time in milliseconds */
  avgResponseTime?: number;
  /** Total number of interactions */
  totalInteractions?: number;
  /** Number of successful interactions */
  successfulInteractions?: number;
  /** Number of failed interactions */
  failedInteractions?: number;
  /** Last interaction timestamp */
  lastInteraction?: string;
}

/**
 * Enhanced edge type that extends React Flow Edge with relationship data.
 */
export interface RelationshipEdge {
  /** Unique edge identifier */
  id: string;
  /** Source agent node ID */
  source: string;
  /** Target agent node ID */
  target: string;
  /** Edge type for React Flow */
  type?: string;
  /** Whether the edge is animated */
  animated?: boolean;
  /** Relationship metadata */
  data: RelationshipMetadata;
  /** Visual styling overrides */
  style?: Record<string, string | number>;
  /** Label to display on the edge */
  label?: string;
}

/**
 * Visual styling configurations per relationship type.
 * Used to render edges differently based on relationship type.
 */
export const RELATIONSHIP_STYLES: Record<RelationshipType, {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  animated?: boolean;
  label: string;
}> = {
  [RelationshipType.DELEGATION]: {
    stroke: '#3b82f6', // Blue
    strokeWidth: 2,
    animated: true,
    label: 'Delegates to',
  },
  [RelationshipType.COLLABORATION]: {
    stroke: '#10b981', // Green
    strokeWidth: 2,
    label: 'Collaborates with',
  },
  [RelationshipType.REVIEW]: {
    stroke: '#f59e0b', // Amber
    strokeWidth: 2,
    label: 'Reviews',
  },
  [RelationshipType.ESCALATION]: {
    stroke: '#ef4444', // Red
    strokeWidth: 2,
    strokeDasharray: '5,5',
    label: 'Escalates to',
  },
  [RelationshipType.CONSULTATION]: {
    stroke: '#8b5cf6', // Purple
    strokeWidth: 1,
    strokeDasharray: '3,3',
    label: 'Consults',
  },
  [RelationshipType.DEPENDENCY]: {
    stroke: '#6b7280', // Gray
    strokeWidth: 1,
    label: 'Depends on',
  },
  [RelationshipType.SUPERVISION]: {
    stroke: '#0ea5e9', // Sky blue
    strokeWidth: 2,
    animated: true,
    label: 'Supervises',
  },
};

/**
 * Creates a default relationship metadata object.
 * @param type - The relationship type
 * @returns Default metadata for the relationship type
 */
export function createDefaultRelationship(type: RelationshipType): RelationshipMetadata {
  const defaults: Record<RelationshipType, Partial<RelationshipMetadata>> = {
    [RelationshipType.DELEGATION]: {
      authorityDelta: 1,
      bidirectional: false,
      autoApproval: true,
    },
    [RelationshipType.COLLABORATION]: {
      authorityDelta: 0,
      bidirectional: true,
      autoApproval: true,
    },
    [RelationshipType.REVIEW]: {
      authorityDelta: 1,
      bidirectional: false,
      autoApproval: false,
    },
    [RelationshipType.ESCALATION]: {
      authorityDelta: -2,
      bidirectional: false,
      autoApproval: true,
    },
    [RelationshipType.CONSULTATION]: {
      authorityDelta: 0,
      bidirectional: true,
      autoApproval: true,
    },
    [RelationshipType.DEPENDENCY]: {
      authorityDelta: 0,
      bidirectional: false,
      autoApproval: true,
    },
    [RelationshipType.SUPERVISION]: {
      authorityDelta: 2,
      bidirectional: false,
      autoApproval: true,
    },
  };

  return {
    type,
    authorityDelta: defaults[type]?.authorityDelta ?? 0,
    maxInteractionsPerWorkflow: null,
    bidirectional: defaults[type]?.bidirectional ?? false,
    autoApproval: defaults[type]?.autoApproval ?? true,
    metrics: {
      totalInteractions: 0,
      successfulInteractions: 0,
      failedInteractions: 0,
    },
  };
}

/**
 * Validates that a relationship is structurally valid.
 * @param relationship - The relationship to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateRelationship(relationship: Partial<RelationshipMetadata>): string[] {
  const errors: string[] = [];
  
  if (!relationship.type) {
    errors.push('Relationship type is required');
  }
  
  if (relationship.authorityDelta !== undefined) {
    if (relationship.authorityDelta < -5 || relationship.authorityDelta > 5) {
      errors.push('Authority delta must be between -5 and 5');
    }
  }
  
  if (relationship.maxInteractionsPerWorkflow !== undefined && 
      relationship.maxInteractionsPerWorkflow !== null &&
      relationship.maxInteractionsPerWorkflow < 1) {
    errors.push('Max interactions must be at least 1 or null for unlimited');
  }
  
  return errors;
}

/**
 * Gets the display name for a relationship type.
 * @param type - The relationship type
 * @returns Human-readable name
 */
export function getRelationshipDisplayName(type: RelationshipType): string {
  return RELATIONSHIP_STYLES[type]?.label || type;
}
