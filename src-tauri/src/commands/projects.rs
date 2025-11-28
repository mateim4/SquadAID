//! Project commands for Tauri

use crate::models::{EnhancedProject, ProjectRow, ProjectTask, TaskRow, ProjectArtifact, ArtifactRow};
use sqlx::SqlitePool;
use tauri::State;

// === Project Commands ===

/// Get all projects
#[tauri::command]
pub async fn get_projects(pool: State<'_, SqlitePool>) -> Result<Vec<EnhancedProject>, String> {
    let rows: Vec<ProjectRow> = sqlx::query_as!(
        ProjectRow,
        r#"
        SELECT 
            id, name, description, status, owner_id,
            workflow_ids_json, agent_ids_json, settings_json,
            tags_json, created_at, updated_at
        FROM projects
        ORDER BY updated_at DESC
        "#
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch projects: {}", e))?;

    rows.into_iter()
        .map(|row| EnhancedProject::try_from(row).map_err(|e| e.to_string()))
        .collect()
}

/// Get a single project by ID
#[tauri::command]
pub async fn get_project(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<EnhancedProject>, String> {
    let row: Option<ProjectRow> = sqlx::query_as!(
        ProjectRow,
        r#"
        SELECT 
            id, name, description, status, owner_id,
            workflow_ids_json, agent_ids_json, settings_json,
            tags_json, created_at, updated_at
        FROM projects
        WHERE id = ?
        "#,
        id
    )
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch project: {}", e))?;

    match row {
        Some(r) => Ok(Some(EnhancedProject::try_from(r).map_err(|e| e.to_string())?)),
        None => Ok(None),
    }
}

/// Create a new project
#[tauri::command]
pub async fn create_project(
    pool: State<'_, SqlitePool>,
    project: EnhancedProject,
) -> Result<EnhancedProject, String> {
    let row = ProjectRow::from(project.clone());
    
    sqlx::query!(
        r#"
        INSERT INTO projects (
            id, name, description, status, owner_id,
            workflow_ids_json, agent_ids_json, settings_json,
            tags_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
        row.id,
        row.name,
        row.description,
        row.status,
        row.owner_id,
        row.workflow_ids_json,
        row.agent_ids_json,
        row.settings_json,
        row.tags_json,
        row.created_at,
        row.updated_at
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to create project: {}", e))?;

    Ok(project)
}

/// Update an existing project
#[tauri::command]
pub async fn update_project(
    pool: State<'_, SqlitePool>,
    project: EnhancedProject,
) -> Result<EnhancedProject, String> {
    let row = ProjectRow::from(project.clone());
    let updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query!(
        r#"
        UPDATE projects SET
            name = ?, description = ?, status = ?, owner_id = ?,
            workflow_ids_json = ?, agent_ids_json = ?, settings_json = ?,
            tags_json = ?, updated_at = ?
        WHERE id = ?
        "#,
        row.name,
        row.description,
        row.status,
        row.owner_id,
        row.workflow_ids_json,
        row.agent_ids_json,
        row.settings_json,
        row.tags_json,
        updated_at,
        row.id
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to update project: {}", e))?;

    Ok(project)
}

/// Delete a project
#[tauri::command]
pub async fn delete_project(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    sqlx::query!("DELETE FROM projects WHERE id = ?", id)
        .execute(pool.inner())
        .await
        .map_err(|e| format!("Failed to delete project: {}", e))?;

    Ok(())
}

// === Task Commands ===

/// Get all tasks for a project
#[tauri::command]
pub async fn get_project_tasks(
    pool: State<'_, SqlitePool>,
    project_id: String,
) -> Result<Vec<ProjectTask>, String> {
    let rows: Vec<TaskRow> = sqlx::query_as!(
        TaskRow,
        r#"
        SELECT 
            id, project_id, title, description, status, priority,
            assigned_agent_id, parent_task_id, estimated_hours, actual_hours,
            due_date, progress, tags_json, artifact_ids_json, dependency_ids_json,
            created_at, updated_at, completed_at
        FROM tasks
        WHERE project_id = ?
        ORDER BY created_at ASC
        "#,
        project_id
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch tasks: {}", e))?;

    rows.into_iter()
        .map(|row| ProjectTask::try_from(row).map_err(|e| e.to_string()))
        .collect()
}

/// Create a new task
#[tauri::command]
pub async fn create_task(pool: State<'_, SqlitePool>, task: ProjectTask) -> Result<ProjectTask, String> {
    let row = TaskRow::from(task.clone());
    
    sqlx::query!(
        r#"
        INSERT INTO tasks (
            id, project_id, title, description, status, priority,
            assigned_agent_id, parent_task_id, estimated_hours, actual_hours,
            due_date, progress, tags_json, artifact_ids_json, dependency_ids_json,
            created_at, updated_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
        row.id,
        row.project_id,
        row.title,
        row.description,
        row.status,
        row.priority,
        row.assigned_agent_id,
        row.parent_task_id,
        row.estimated_hours,
        row.actual_hours,
        row.due_date,
        row.progress,
        row.tags_json,
        row.artifact_ids_json,
        row.dependency_ids_json,
        row.created_at,
        row.updated_at,
        row.completed_at
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to create task: {}", e))?;

    Ok(task)
}

/// Update an existing task
#[tauri::command]
pub async fn update_task(pool: State<'_, SqlitePool>, task: ProjectTask) -> Result<ProjectTask, String> {
    let row = TaskRow::from(task.clone());
    let updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query!(
        r#"
        UPDATE tasks SET
            title = ?, description = ?, status = ?, priority = ?,
            assigned_agent_id = ?, parent_task_id = ?, estimated_hours = ?,
            actual_hours = ?, due_date = ?, progress = ?, tags_json = ?,
            artifact_ids_json = ?, dependency_ids_json = ?, updated_at = ?,
            completed_at = ?
        WHERE id = ?
        "#,
        row.title,
        row.description,
        row.status,
        row.priority,
        row.assigned_agent_id,
        row.parent_task_id,
        row.estimated_hours,
        row.actual_hours,
        row.due_date,
        row.progress,
        row.tags_json,
        row.artifact_ids_json,
        row.dependency_ids_json,
        updated_at,
        row.completed_at,
        row.id
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to update task: {}", e))?;

    Ok(task)
}

/// Delete a task
#[tauri::command]
pub async fn delete_task(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    sqlx::query!("DELETE FROM tasks WHERE id = ?", id)
        .execute(pool.inner())
        .await
        .map_err(|e| format!("Failed to delete task: {}", e))?;

    Ok(())
}

// === Artifact Commands ===

/// Get all artifacts for a project
#[tauri::command]
pub async fn get_project_artifacts(
    pool: State<'_, SqlitePool>,
    project_id: String,
) -> Result<Vec<ProjectArtifact>, String> {
    let rows: Vec<ArtifactRow> = sqlx::query_as!(
        ArtifactRow,
        r#"
        SELECT 
            id, project_id, task_id, agent_id, artifact_type,
            name, description, content, mime_type, 
            size_bytes as "size_bytes: i64", 
            version, tags_json, created_at, updated_at
        FROM artifacts
        WHERE project_id = ?
        ORDER BY created_at DESC
        "#,
        project_id
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch artifacts: {}", e))?;

    rows.into_iter()
        .map(|row| ProjectArtifact::try_from(row).map_err(|e| e.to_string()))
        .collect()
}

/// Create a new artifact
#[tauri::command]
pub async fn create_artifact(
    pool: State<'_, SqlitePool>,
    artifact: ProjectArtifact,
) -> Result<ProjectArtifact, String> {
    let row = ArtifactRow::from(artifact.clone());
    
    sqlx::query!(
        r#"
        INSERT INTO artifacts (
            id, project_id, task_id, agent_id, artifact_type,
            name, description, content, mime_type, size_bytes,
            version, tags_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
        row.id,
        row.project_id,
        row.task_id,
        row.agent_id,
        row.artifact_type,
        row.name,
        row.description,
        row.content,
        row.mime_type,
        row.size_bytes,
        row.version,
        row.tags_json,
        row.created_at,
        row.updated_at
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to create artifact: {}", e))?;

    Ok(artifact)
}

/// Delete an artifact
#[tauri::command]
pub async fn delete_artifact(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    sqlx::query!("DELETE FROM artifacts WHERE id = ?", id)
        .execute(pool.inner())
        .await
        .map_err(|e| format!("Failed to delete artifact: {}", e))?;

    Ok(())
}
