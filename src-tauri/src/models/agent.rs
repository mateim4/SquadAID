//! Enhanced agent definitions with role integration
//! 
//! Agents are the core entities that perform work in workflows.
//! Each agent has a role, capabilities, and can interact with other agents.

use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Operating modes for agents
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum AgentMode {
    /// Fully autonomous operation
    Autonomous,
    /// AI assists human decisions
    Assisted,
    /// Human supervises AI actions
    Supervised,
    /// Fully manual/human controlled
    Manual,
}

impl Default for AgentMode {
    fn default() -> Self {
        Self::Supervised
    }
}

/// Execution status of an agent
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum AgentStatus {
    Idle,
    Initializing,
    Ready,
    Running,
    WaitingForInput,
    WaitingForApproval,
    Paused,
    Completed,
    Failed,
    Cancelled,
}

impl Default for AgentStatus {
    fn default() -> Self {
        Self::Idle
    }
}

impl AgentStatus {
    /// Get the display name
    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Idle => "Idle",
            Self::Initializing => "Initializing",
            Self::Ready => "Ready",
            Self::Running => "Running",
            Self::WaitingForInput => "Waiting for Input",
            Self::WaitingForApproval => "Waiting for Approval",
            Self::Paused => "Paused",
            Self::Completed => "Completed",
            Self::Failed => "Failed",
            Self::Cancelled => "Cancelled",
        }
    }

    /// Get the color for this status
    pub fn color(&self) -> &'static str {
        match self {
            Self::Idle => "#6b7280",          // Gray
            Self::Initializing => "#3b82f6",  // Blue
            Self::Ready => "#22c55e",         // Green
            Self::Running => "#8b5cf6",       // Purple
            Self::WaitingForInput => "#f59e0b", // Amber
            Self::WaitingForApproval => "#f97316", // Orange
            Self::Paused => "#64748b",        // Slate
            Self::Completed => "#10b981",     // Emerald
            Self::Failed => "#ef4444",        // Red
            Self::Cancelled => "#6b7280",     // Gray
        }
    }

    /// Check if the agent is in a terminal state
    pub fn is_terminal(&self) -> bool {
        matches!(self, Self::Completed | Self::Failed | Self::Cancelled)
    }

    /// Check if the agent is active
    pub fn is_active(&self) -> bool {
        matches!(
            self,
            Self::Running | Self::WaitingForInput | Self::WaitingForApproval | Self::Paused
        )
    }
}

/// AI provider types
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum ProviderType {
    Ollama,
    OpenAi,
    Anthropic,
    Google,
    Azure,
    Custom,
}

impl Default for ProviderType {
    fn default() -> Self {
        Self::Ollama
    }
}

/// Provider configuration for an agent
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderConfig {
    pub provider_type: ProviderType,
    pub model: String,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub temperature: Option<f64>,
    pub max_tokens: Option<u32>,
    pub top_p: Option<f64>,
    pub additional_params: Option<serde_json::Value>,
}

impl Default for ProviderConfig {
    fn default() -> Self {
        Self {
            provider_type: ProviderType::Ollama,
            model: "llama3.2".to_string(),
            api_key: None,
            base_url: None,
            temperature: Some(0.7),
            max_tokens: Some(4096),
            top_p: Some(0.9),
            additional_params: None,
        }
    }
}

/// Metrics for agent performance
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentMetrics {
    /// Total tasks executed
    pub total_tasks: u32,
    /// Successfully completed tasks
    pub completed_tasks: u32,
    /// Failed tasks
    pub failed_tasks: u32,
    /// Total tokens consumed
    pub total_tokens: u64,
    /// Average response time in milliseconds
    pub avg_response_time_ms: f64,
    /// Uptime in seconds
    pub uptime_seconds: u64,
    /// Last active timestamp
    pub last_active: Option<String>,
}

/// Position on the canvas
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

/// An enhanced agent with role integration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnhancedAgent {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    /// Reference to the role ID
    pub role_id: Option<String>,
    /// Operating mode
    pub mode: AgentMode,
    /// Current status
    pub status: AgentStatus,
    /// Provider configuration
    pub provider_config: ProviderConfig,
    /// Custom system prompt override (if not using role's prompt)
    pub system_prompt_override: Option<String>,
    /// Performance metrics
    pub metrics: AgentMetrics,
    /// Canvas position
    pub position: Position,
    /// Whether the agent is expanded in the UI
    pub expanded: bool,
    /// Whether the agent is selected
    pub selected: bool,
    /// ISO 8601 timestamp
    pub created_at: String,
    /// ISO 8601 timestamp
    pub updated_at: String,
}

impl EnhancedAgent {
    /// Create a new agent
    pub fn new(id: String, name: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id,
            name,
            description: None,
            role_id: None,
            mode: AgentMode::default(),
            status: AgentStatus::default(),
            provider_config: ProviderConfig::default(),
            system_prompt_override: None,
            metrics: AgentMetrics::default(),
            position: Position::default(),
            expanded: false,
            selected: false,
            created_at: now.clone(),
            updated_at: now,
        }
    }

    /// Update the agent's status
    pub fn set_status(&mut self, status: AgentStatus) {
        self.status = status;
        self.updated_at = chrono::Utc::now().to_rfc3339();
        
        if status.is_active() {
            self.metrics.last_active = Some(chrono::Utc::now().to_rfc3339());
        }
    }

    /// Increment task counters
    pub fn record_task_completion(&mut self, success: bool, tokens: u64, duration_ms: u64) {
        self.metrics.total_tasks += 1;
        if success {
            self.metrics.completed_tasks += 1;
        } else {
            self.metrics.failed_tasks += 1;
        }
        self.metrics.total_tokens += tokens;
        
        // Update average response time
        let total_time = self.metrics.avg_response_time_ms * (self.metrics.total_tasks - 1) as f64;
        self.metrics.avg_response_time_ms = (total_time + duration_ms as f64) / self.metrics.total_tasks as f64;
        
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }
}

/// For database storage
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AgentRow {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub role_id: Option<String>,
    pub mode: String,
    pub status: String,
    /// JSON string of provider config
    pub provider_config_json: String,
    pub system_prompt_override: Option<String>,
    /// JSON string of metrics
    pub metrics_json: String,
    pub position_x: f64,
    pub position_y: f64,
    pub expanded: bool,
    pub selected: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<EnhancedAgent> for AgentRow {
    fn from(agent: EnhancedAgent) -> Self {
        Self {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            role_id: agent.role_id,
            mode: serde_json::to_string(&agent.mode).unwrap_or_default(),
            status: serde_json::to_string(&agent.status).unwrap_or_default(),
            provider_config_json: serde_json::to_string(&agent.provider_config).unwrap_or_default(),
            system_prompt_override: agent.system_prompt_override,
            metrics_json: serde_json::to_string(&agent.metrics).unwrap_or_default(),
            position_x: agent.position.x,
            position_y: agent.position.y,
            expanded: agent.expanded,
            selected: agent.selected,
            created_at: agent.created_at,
            updated_at: agent.updated_at,
        }
    }
}

impl TryFrom<AgentRow> for EnhancedAgent {
    type Error = serde_json::Error;

    fn try_from(row: AgentRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            name: row.name,
            description: row.description,
            role_id: row.role_id,
            mode: serde_json::from_str(&row.mode)?,
            status: serde_json::from_str(&row.status)?,
            provider_config: serde_json::from_str(&row.provider_config_json)?,
            system_prompt_override: row.system_prompt_override,
            metrics: serde_json::from_str(&row.metrics_json)?,
            position: Position {
                x: row.position_x,
                y: row.position_y,
            },
            expanded: row.expanded,
            selected: row.selected,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}
