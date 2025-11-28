//! Project and task management
//! 
//! Projects contain workflows, tasks, and artifacts produced by agents.

use serde::{Deserialize, Serialize};

/// Task status
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum TaskStatus {
    Backlog,
    Todo,
    InProgress,
    InReview,
    Blocked,
    Done,
    Cancelled,
}

impl Default for TaskStatus {
    fn default() -> Self {
        Self::Todo
    }
}

/// Task priority
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum TaskPriority {
    Low,
    Medium,
    High,
    Critical,
}

impl Default for TaskPriority {
    fn default() -> Self {
        Self::Medium
    }
}

/// Artifact types that can be produced
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum ArtifactType {
    Code,
    Document,
    Image,
    Data,
    Config,
    Test,
    Log,
    Other,
}

/// An artifact produced by an agent
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectArtifact {
    pub id: String,
    pub project_id: String,
    pub task_id: Option<String>,
    pub agent_id: String,
    pub artifact_type: ArtifactType,
    pub name: String,
    pub description: Option<String>,
    /// File path or content
    pub content: String,
    /// MIME type
    pub mime_type: Option<String>,
    /// Size in bytes
    pub size_bytes: Option<u64>,
    /// Version number
    pub version: u32,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// ISO 8601 timestamp
    pub created_at: String,
    /// ISO 8601 timestamp
    pub updated_at: String,
}

impl ProjectArtifact {
    pub fn new(
        id: String,
        project_id: String,
        agent_id: String,
        artifact_type: ArtifactType,
        name: String,
        content: String,
    ) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id,
            project_id,
            task_id: None,
            agent_id,
            artifact_type,
            name,
            description: None,
            content,
            mime_type: None,
            size_bytes: None,
            version: 1,
            tags: vec![],
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

/// A task within a project
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectTask {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: TaskStatus,
    pub priority: TaskPriority,
    /// Agent assigned to this task
    pub assigned_agent_id: Option<String>,
    /// Parent task ID for subtasks
    pub parent_task_id: Option<String>,
    /// Estimated effort in hours
    pub estimated_hours: Option<f64>,
    /// Actual effort in hours
    pub actual_hours: Option<f64>,
    /// Due date (ISO 8601)
    pub due_date: Option<String>,
    /// Completion percentage (0-100)
    pub progress: u8,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// Related artifact IDs
    pub artifact_ids: Vec<String>,
    /// Dependency task IDs (must complete before this task)
    pub dependency_ids: Vec<String>,
    /// ISO 8601 timestamp
    pub created_at: String,
    /// ISO 8601 timestamp
    pub updated_at: String,
    /// ISO 8601 timestamp when completed
    pub completed_at: Option<String>,
}

impl ProjectTask {
    pub fn new(id: String, project_id: String, title: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id,
            project_id,
            title,
            description: None,
            status: TaskStatus::default(),
            priority: TaskPriority::default(),
            assigned_agent_id: None,
            parent_task_id: None,
            estimated_hours: None,
            actual_hours: None,
            due_date: None,
            progress: 0,
            tags: vec![],
            artifact_ids: vec![],
            dependency_ids: vec![],
            created_at: now.clone(),
            updated_at: now,
            completed_at: None,
        }
    }

    /// Mark the task as complete
    pub fn complete(&mut self) {
        self.status = TaskStatus::Done;
        self.progress = 100;
        self.completed_at = Some(chrono::Utc::now().to_rfc3339());
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }
}

/// Project status
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum ProjectStatus {
    Planning,
    Active,
    OnHold,
    Completed,
    Archived,
    Cancelled,
}

impl Default for ProjectStatus {
    fn default() -> Self {
        Self::Planning
    }
}

/// An enhanced project containing workflows and tasks
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnhancedProject {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub status: ProjectStatus,
    /// Owner user ID
    pub owner_id: Option<String>,
    /// Workflow IDs associated with this project
    pub workflow_ids: Vec<String>,
    /// Agent IDs in this project
    pub agent_ids: Vec<String>,
    /// Project settings
    pub settings: ProjectSettings,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// ISO 8601 timestamp
    pub created_at: String,
    /// ISO 8601 timestamp
    pub updated_at: String,
}

/// Project settings
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSettings {
    /// Default agent mode for new agents
    pub default_agent_mode: Option<String>,
    /// Auto-save interval in seconds
    pub auto_save_interval: Option<u32>,
    /// Enable notifications
    pub notifications_enabled: bool,
    /// Custom settings
    pub custom: Option<serde_json::Value>,
}

impl EnhancedProject {
    pub fn new(id: String, name: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id,
            name,
            description: None,
            status: ProjectStatus::default(),
            owner_id: None,
            workflow_ids: vec![],
            agent_ids: vec![],
            settings: ProjectSettings::default(),
            tags: vec![],
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

// Database row types

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectRow {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub status: String,
    pub owner_id: Option<String>,
    pub workflow_ids_json: String,
    pub agent_ids_json: String,
    pub settings_json: String,
    pub tags_json: String,
    pub created_at: String,
    pub updated_at: String,
}

impl From<EnhancedProject> for ProjectRow {
    fn from(project: EnhancedProject) -> Self {
        Self {
            id: project.id,
            name: project.name,
            description: project.description,
            status: serde_json::to_string(&project.status).unwrap_or_default(),
            owner_id: project.owner_id,
            workflow_ids_json: serde_json::to_string(&project.workflow_ids).unwrap_or_default(),
            agent_ids_json: serde_json::to_string(&project.agent_ids).unwrap_or_default(),
            settings_json: serde_json::to_string(&project.settings).unwrap_or_default(),
            tags_json: serde_json::to_string(&project.tags).unwrap_or_default(),
            created_at: project.created_at,
            updated_at: project.updated_at,
        }
    }
}

impl TryFrom<ProjectRow> for EnhancedProject {
    type Error = serde_json::Error;

    fn try_from(row: ProjectRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            name: row.name,
            description: row.description,
            status: serde_json::from_str(&row.status)?,
            owner_id: row.owner_id,
            workflow_ids: serde_json::from_str(&row.workflow_ids_json)?,
            agent_ids: serde_json::from_str(&row.agent_ids_json)?,
            settings: serde_json::from_str(&row.settings_json)?,
            tags: serde_json::from_str(&row.tags_json)?,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskRow {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub priority: String,
    pub assigned_agent_id: Option<String>,
    pub parent_task_id: Option<String>,
    pub estimated_hours: Option<f64>,
    pub actual_hours: Option<f64>,
    pub due_date: Option<String>,
    pub progress: i32,
    pub tags_json: String,
    pub artifact_ids_json: String,
    pub dependency_ids_json: String,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
}

impl From<ProjectTask> for TaskRow {
    fn from(task: ProjectTask) -> Self {
        Self {
            id: task.id,
            project_id: task.project_id,
            title: task.title,
            description: task.description,
            status: serde_json::to_string(&task.status).unwrap_or_default(),
            priority: serde_json::to_string(&task.priority).unwrap_or_default(),
            assigned_agent_id: task.assigned_agent_id,
            parent_task_id: task.parent_task_id,
            estimated_hours: task.estimated_hours,
            actual_hours: task.actual_hours,
            due_date: task.due_date,
            progress: task.progress as i32,
            tags_json: serde_json::to_string(&task.tags).unwrap_or_default(),
            artifact_ids_json: serde_json::to_string(&task.artifact_ids).unwrap_or_default(),
            dependency_ids_json: serde_json::to_string(&task.dependency_ids).unwrap_or_default(),
            created_at: task.created_at,
            updated_at: task.updated_at,
            completed_at: task.completed_at,
        }
    }
}

impl TryFrom<TaskRow> for ProjectTask {
    type Error = serde_json::Error;

    fn try_from(row: TaskRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            project_id: row.project_id,
            title: row.title,
            description: row.description,
            status: serde_json::from_str(&row.status)?,
            priority: serde_json::from_str(&row.priority)?,
            assigned_agent_id: row.assigned_agent_id,
            parent_task_id: row.parent_task_id,
            estimated_hours: row.estimated_hours,
            actual_hours: row.actual_hours,
            due_date: row.due_date,
            progress: row.progress as u8,
            tags: serde_json::from_str(&row.tags_json)?,
            artifact_ids: serde_json::from_str(&row.artifact_ids_json)?,
            dependency_ids: serde_json::from_str(&row.dependency_ids_json)?,
            created_at: row.created_at,
            updated_at: row.updated_at,
            completed_at: row.completed_at,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactRow {
    pub id: String,
    pub project_id: String,
    pub task_id: Option<String>,
    pub agent_id: String,
    pub artifact_type: String,
    pub name: String,
    pub description: Option<String>,
    pub content: String,
    pub mime_type: Option<String>,
    pub size_bytes: Option<i64>,
    pub version: i32,
    pub tags_json: String,
    pub created_at: String,
    pub updated_at: String,
}

impl From<ProjectArtifact> for ArtifactRow {
    fn from(artifact: ProjectArtifact) -> Self {
        Self {
            id: artifact.id,
            project_id: artifact.project_id,
            task_id: artifact.task_id,
            agent_id: artifact.agent_id,
            artifact_type: serde_json::to_string(&artifact.artifact_type).unwrap_or_default(),
            name: artifact.name,
            description: artifact.description,
            content: artifact.content,
            mime_type: artifact.mime_type,
            size_bytes: artifact.size_bytes.map(|s| s as i64),
            version: artifact.version as i32,
            tags_json: serde_json::to_string(&artifact.tags).unwrap_or_default(),
            created_at: artifact.created_at,
            updated_at: artifact.updated_at,
        }
    }
}

impl TryFrom<ArtifactRow> for ProjectArtifact {
    type Error = serde_json::Error;

    fn try_from(row: ArtifactRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            project_id: row.project_id,
            task_id: row.task_id,
            agent_id: row.agent_id,
            artifact_type: serde_json::from_str(&row.artifact_type)?,
            name: row.name,
            description: row.description,
            content: row.content,
            mime_type: row.mime_type,
            size_bytes: row.size_bytes.map(|s| s as u64),
            version: row.version as u32,
            tags: serde_json::from_str(&row.tags_json)?,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}
