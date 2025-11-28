//! Relationship definitions for agent-to-agent connections
//! 
//! Relationships define how agents interact with each other,
//! including communication patterns and authority hierarchies.

use serde::{Deserialize, Serialize};

/// Types of relationships between agents
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum RelationshipType {
    /// One agent supervises another
    Supervises,
    /// Peer-to-peer collaboration
    Collaborates,
    /// One agent delegates work to another
    Delegates,
    /// One agent reviews another's work
    Reviews,
    /// General information flow
    InformsTo,
    /// One agent requests help from another
    RequestsFrom,
    /// One agent blocks another's progress
    Blocks,
    /// Custom relationship type
    Custom,
}

impl RelationshipType {
    /// Get the display name for the relationship type
    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Supervises => "Supervises",
            Self::Collaborates => "Collaborates",
            Self::Delegates => "Delegates",
            Self::Reviews => "Reviews",
            Self::InformsTo => "Informs",
            Self::RequestsFrom => "Requests From",
            Self::Blocks => "Blocks",
            Self::Custom => "Custom",
        }
    }

    /// Get the default color for the relationship type
    pub fn default_color(&self) -> &'static str {
        match self {
            Self::Supervises => "#8b5cf6",    // Purple
            Self::Collaborates => "#22c55e",  // Green
            Self::Delegates => "#3b82f6",     // Blue
            Self::Reviews => "#f59e0b",       // Amber
            Self::InformsTo => "#6b7280",     // Gray
            Self::RequestsFrom => "#14b8a6",  // Teal
            Self::Blocks => "#ef4444",        // Red
            Self::Custom => "#64748b",        // Slate
        }
    }
}

/// Metadata about a relationship
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationshipMetadata {
    /// Human-readable label for the relationship
    pub label: Option<String>,
    /// Relationship strength from 0.0 to 1.0
    pub strength: f64,
    /// Whether the relationship is bidirectional
    pub bidirectional: bool,
    /// Priority level (higher = more important)
    pub priority: i32,
    /// Custom color override
    pub color: Option<String>,
    /// Whether actions require approval
    pub auto_approve: bool,
    /// Authority delta (-10 to 10, positive = source has more authority)
    pub authority_delta: i32,
    /// Custom metadata
    pub custom: Option<serde_json::Value>,
}

impl Default for RelationshipMetadata {
    fn default() -> Self {
        Self {
            label: None,
            strength: 1.0,
            bidirectional: false,
            priority: 0,
            color: None,
            auto_approve: true,
            authority_delta: 0,
            custom: None,
        }
    }
}

/// A relationship between two agents
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentRelationship {
    pub id: String,
    /// Source agent ID
    pub source_agent_id: String,
    /// Target agent ID
    pub target_agent_id: String,
    /// Type of relationship
    pub relationship_type: RelationshipType,
    /// Relationship metadata
    pub metadata: RelationshipMetadata,
    /// ISO 8601 timestamp
    pub created_at: String,
    /// ISO 8601 timestamp
    pub updated_at: String,
}

impl AgentRelationship {
    /// Create a new relationship
    pub fn new(
        id: String,
        source_agent_id: String,
        target_agent_id: String,
        relationship_type: RelationshipType,
    ) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id,
            source_agent_id,
            target_agent_id,
            relationship_type,
            metadata: RelationshipMetadata::default(),
            created_at: now.clone(),
            updated_at: now,
        }
    }

    /// Get the effective color for this relationship
    pub fn effective_color(&self) -> String {
        self.metadata
            .color
            .clone()
            .unwrap_or_else(|| self.relationship_type.default_color().to_string())
    }
}

/// For database storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelationshipRow {
    pub id: String,
    pub source_agent_id: String,
    pub target_agent_id: String,
    pub relationship_type: String,
    /// JSON string of metadata
    pub metadata_json: String,
    pub created_at: String,
    pub updated_at: String,
}

impl From<AgentRelationship> for RelationshipRow {
    fn from(rel: AgentRelationship) -> Self {
        Self {
            id: rel.id,
            source_agent_id: rel.source_agent_id,
            target_agent_id: rel.target_agent_id,
            relationship_type: serde_json::to_string(&rel.relationship_type).unwrap_or_default(),
            metadata_json: serde_json::to_string(&rel.metadata).unwrap_or_default(),
            created_at: rel.created_at,
            updated_at: rel.updated_at,
        }
    }
}

impl TryFrom<RelationshipRow> for AgentRelationship {
    type Error = serde_json::Error;

    fn try_from(row: RelationshipRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            source_agent_id: row.source_agent_id,
            target_agent_id: row.target_agent_id,
            relationship_type: serde_json::from_str(&row.relationship_type)?,
            metadata: serde_json::from_str(&row.metadata_json)?,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}
