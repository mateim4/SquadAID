//! Role definitions for agent specialization
//! 
//! Roles define the specialization, capabilities, and behavior patterns
//! of agents in the system.

use serde::{Deserialize, Serialize};

/// Capability categories that a role can possess
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum CapabilityCategory {
    CodeGeneration,
    CodeReview,
    Testing,
    Documentation,
    Research,
    Design,
    Planning,
    Communication,
    Analysis,
    Deployment,
    Security,
    Performance,
    DataAnalysis,
    MachineLearning,
    DevOps,
    Custom(String),
}

/// A specific capability with proficiency level
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Capability {
    pub id: String,
    pub name: String,
    pub category: CapabilityCategory,
    /// Proficiency level from 0.0 to 1.0
    pub proficiency: f64,
    pub description: Option<String>,
}

/// Tool configuration for a role
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToolConfig {
    pub tool_id: String,
    pub enabled: bool,
    pub config: Option<serde_json::Value>,
}

/// Constraints that limit what a role can do
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RoleConstraints {
    /// Maximum number of concurrent tasks
    pub max_concurrent_tasks: Option<u32>,
    /// Maximum tokens per request
    pub max_tokens_per_request: Option<u32>,
    /// Allowed file patterns (glob patterns)
    pub allowed_file_patterns: Vec<String>,
    /// Forbidden actions
    pub forbidden_actions: Vec<String>,
    /// Whether the role requires human approval for certain actions
    pub requires_approval: bool,
    /// Actions that require approval
    pub approval_required_for: Vec<String>,
}

impl Default for RoleConstraints {
    fn default() -> Self {
        Self {
            max_concurrent_tasks: Some(3),
            max_tokens_per_request: Some(4096),
            allowed_file_patterns: vec!["**/*".to_string()],
            forbidden_actions: vec![],
            requires_approval: false,
            approval_required_for: vec![],
        }
    }
}

/// A role definition that can be assigned to agents
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Role {
    pub id: String,
    pub name: String,
    pub description: String,
    /// Icon identifier (e.g., Fluent UI icon name)
    pub icon: String,
    /// Color for visual representation (hex or CSS color)
    pub color: String,
    /// Capabilities this role provides
    pub capabilities: Vec<Capability>,
    /// System prompt template for the role
    pub system_prompt: String,
    /// Tools available to this role
    pub tools: Vec<ToolConfig>,
    /// Operational constraints
    pub constraints: RoleConstraints,
    /// Whether this is a built-in role (cannot be deleted)
    pub is_built_in: bool,
    /// Version for tracking changes
    pub version: String,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// ISO 8601 timestamp
    pub created_at: String,
    /// ISO 8601 timestamp
    pub updated_at: String,
}

impl Role {
    /// Create a new custom role with default values
    pub fn new(id: String, name: String, description: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id,
            name,
            description,
            icon: "Person".to_string(),
            color: "#6366f1".to_string(),
            capabilities: vec![],
            system_prompt: String::new(),
            tools: vec![],
            constraints: RoleConstraints::default(),
            is_built_in: false,
            version: "1.0.0".to_string(),
            tags: vec![],
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

/// For database storage - flattened role representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleRow {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub color: String,
    /// JSON string of capabilities
    pub capabilities_json: String,
    pub system_prompt: String,
    /// JSON string of tools
    pub tools_json: String,
    /// JSON string of constraints
    pub constraints_json: String,
    pub is_built_in: bool,
    pub version: String,
    /// JSON string of tags
    pub tags_json: String,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Role> for RoleRow {
    fn from(role: Role) -> Self {
        Self {
            id: role.id,
            name: role.name,
            description: role.description,
            icon: role.icon,
            color: role.color,
            capabilities_json: serde_json::to_string(&role.capabilities).unwrap_or_default(),
            system_prompt: role.system_prompt,
            tools_json: serde_json::to_string(&role.tools).unwrap_or_default(),
            constraints_json: serde_json::to_string(&role.constraints).unwrap_or_default(),
            is_built_in: role.is_built_in,
            version: role.version,
            tags_json: serde_json::to_string(&role.tags).unwrap_or_default(),
            created_at: role.created_at,
            updated_at: role.updated_at,
        }
    }
}

impl TryFrom<RoleRow> for Role {
    type Error = serde_json::Error;

    fn try_from(row: RoleRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            name: row.name,
            description: row.description,
            icon: row.icon,
            color: row.color,
            capabilities: serde_json::from_str(&row.capabilities_json)?,
            system_prompt: row.system_prompt,
            tools: serde_json::from_str(&row.tools_json)?,
            constraints: serde_json::from_str(&row.constraints_json)?,
            is_built_in: row.is_built_in,
            version: row.version,
            tags: serde_json::from_str(&row.tags_json)?,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}
