//! Interaction tracking for agent communications
//! 
//! Interactions record all communications and actions between agents,
//! enabling replay, debugging, and analytics.

use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Types of interactions between agents
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum InteractionType {
    /// Direct message between agents
    Message,
    /// Task assignment or delegation
    TaskAssignment,
    /// Task completion notification
    TaskCompletion,
    /// Request for approval
    ApprovalRequest,
    /// Approval granted
    ApprovalGranted,
    /// Approval denied
    ApprovalDenied,
    /// Code review request
    CodeReview,
    /// Feedback or comment
    Feedback,
    /// Status update
    StatusUpdate,
    /// Error or exception
    Error,
    /// System event
    System,
}

impl InteractionType {
    /// Get the display name
    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Message => "Message",
            Self::TaskAssignment => "Task Assignment",
            Self::TaskCompletion => "Task Completion",
            Self::ApprovalRequest => "Approval Request",
            Self::ApprovalGranted => "Approval Granted",
            Self::ApprovalDenied => "Approval Denied",
            Self::CodeReview => "Code Review",
            Self::Feedback => "Feedback",
            Self::StatusUpdate => "Status Update",
            Self::Error => "Error",
            Self::System => "System",
        }
    }

    /// Get the icon for this interaction type
    pub fn icon(&self) -> &'static str {
        match self {
            Self::Message => "Chat",
            Self::TaskAssignment => "TaskList",
            Self::TaskCompletion => "CheckmarkCircle",
            Self::ApprovalRequest => "QuestionCircle",
            Self::ApprovalGranted => "CheckmarkSquare",
            Self::ApprovalDenied => "DismissSquare",
            Self::CodeReview => "CodeBlock",
            Self::Feedback => "Comment",
            Self::StatusUpdate => "Info",
            Self::Error => "ErrorCircle",
            Self::System => "Settings",
        }
    }
}

/// Status of an interaction
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum InteractionStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

/// Priority levels for interactions
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum InteractionPriority {
    Low,
    Normal,
    High,
    Urgent,
}

impl Default for InteractionPriority {
    fn default() -> Self {
        Self::Normal
    }
}

/// Content of an interaction
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InteractionContent {
    /// Main message or description
    pub message: String,
    /// Structured data payload
    pub data: Option<serde_json::Value>,
    /// Attached artifacts (file paths, URLs, etc.)
    pub attachments: Vec<String>,
    /// Code snippets or blocks
    pub code_blocks: Vec<CodeBlock>,
}

/// A code block in an interaction
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CodeBlock {
    pub language: String,
    pub code: String,
    pub filename: Option<String>,
    pub start_line: Option<u32>,
    pub end_line: Option<u32>,
}

/// An interaction between agents
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentInteraction {
    pub id: String,
    /// The workflow execution this interaction belongs to
    pub workflow_id: String,
    /// Agent that initiated the interaction
    pub initiator_agent_id: String,
    /// Agent(s) that received the interaction
    pub target_agent_ids: Vec<String>,
    /// Type of interaction
    pub interaction_type: InteractionType,
    /// Current status
    pub status: InteractionStatus,
    /// Priority level
    pub priority: InteractionPriority,
    /// Content of the interaction
    pub content: InteractionContent,
    /// Related task ID if applicable
    pub related_task_id: Option<String>,
    /// Parent interaction ID for threading
    pub parent_interaction_id: Option<String>,
    /// Duration in milliseconds
    pub duration_ms: Option<u64>,
    /// ISO 8601 timestamp when created
    pub created_at: String,
    /// ISO 8601 timestamp when completed/updated
    pub completed_at: Option<String>,
}

impl AgentInteraction {
    /// Create a new interaction
    pub fn new(
        id: String,
        workflow_id: String,
        initiator_agent_id: String,
        target_agent_ids: Vec<String>,
        interaction_type: InteractionType,
        message: String,
    ) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id,
            workflow_id,
            initiator_agent_id,
            target_agent_ids,
            interaction_type,
            status: InteractionStatus::Pending,
            priority: InteractionPriority::Normal,
            content: InteractionContent {
                message,
                data: None,
                attachments: vec![],
                code_blocks: vec![],
            },
            related_task_id: None,
            parent_interaction_id: None,
            duration_ms: None,
            created_at: now,
            completed_at: None,
        }
    }

    /// Mark the interaction as completed
    pub fn complete(&mut self) {
        self.status = InteractionStatus::Completed;
        self.completed_at = Some(chrono::Utc::now().to_rfc3339());
        
        // Calculate duration
        if let Ok(created) = chrono::DateTime::parse_from_rfc3339(&self.created_at) {
            let now = chrono::Utc::now();
            self.duration_ms = Some((now.timestamp_millis() - created.timestamp_millis()) as u64);
        }
    }

    /// Mark the interaction as failed
    pub fn fail(&mut self, error_message: String) {
        self.status = InteractionStatus::Failed;
        self.completed_at = Some(chrono::Utc::now().to_rfc3339());
        self.content.message = format!("{}\n\nError: {}", self.content.message, error_message);
    }
}

/// For database storage
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct InteractionRow {
    pub id: String,
    pub workflow_id: String,
    pub initiator_agent_id: String,
    /// JSON array of target agent IDs
    pub target_agent_ids_json: String,
    pub interaction_type: String,
    pub status: String,
    pub priority: String,
    /// JSON string of content
    pub content_json: String,
    pub related_task_id: Option<String>,
    pub parent_interaction_id: Option<String>,
    pub duration_ms: Option<i64>,
    pub created_at: String,
    pub completed_at: Option<String>,
}

impl From<AgentInteraction> for InteractionRow {
    fn from(interaction: AgentInteraction) -> Self {
        Self {
            id: interaction.id,
            workflow_id: interaction.workflow_id,
            initiator_agent_id: interaction.initiator_agent_id,
            target_agent_ids_json: serde_json::to_string(&interaction.target_agent_ids).unwrap_or_default(),
            interaction_type: serde_json::to_string(&interaction.interaction_type).unwrap_or_default(),
            status: serde_json::to_string(&interaction.status).unwrap_or_default(),
            priority: serde_json::to_string(&interaction.priority).unwrap_or_default(),
            content_json: serde_json::to_string(&interaction.content).unwrap_or_default(),
            related_task_id: interaction.related_task_id,
            parent_interaction_id: interaction.parent_interaction_id,
            duration_ms: interaction.duration_ms.map(|d| d as i64),
            created_at: interaction.created_at,
            completed_at: interaction.completed_at,
        }
    }
}

impl TryFrom<InteractionRow> for AgentInteraction {
    type Error = serde_json::Error;

    fn try_from(row: InteractionRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            workflow_id: row.workflow_id,
            initiator_agent_id: row.initiator_agent_id,
            target_agent_ids: serde_json::from_str(&row.target_agent_ids_json)?,
            interaction_type: serde_json::from_str(&row.interaction_type)?,
            status: serde_json::from_str(&row.status)?,
            priority: serde_json::from_str(&row.priority)?,
            content: serde_json::from_str(&row.content_json)?,
            related_task_id: row.related_task_id,
            parent_interaction_id: row.parent_interaction_id,
            duration_ms: row.duration_ms.map(|d| d as u64),
            created_at: row.created_at,
            completed_at: row.completed_at,
        })
    }
}
