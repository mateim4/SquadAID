//! Interaction commands for Tauri

use crate::models::{AgentInteraction, InteractionRow, InteractionStatus};
use sqlx::SqlitePool;
use tauri::State;

/// Get all interactions
#[tauri::command]
pub async fn get_interactions(pool: State<'_, SqlitePool>) -> Result<Vec<AgentInteraction>, String> {
    let rows: Vec<InteractionRow> = sqlx::query_as::<_, InteractionRow>(
        r#"
        SELECT 
            id, workflow_id, initiator_agent_id, target_agent_ids_json,
            interaction_type, status, priority, content_json,
            related_task_id, parent_interaction_id, duration_ms,
            created_at, completed_at
        FROM interactions
        ORDER BY created_at DESC
        LIMIT 1000
        "#
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch interactions: {}", e))?;

    rows.into_iter()
        .map(|row| AgentInteraction::try_from(row).map_err(|e| e.to_string()))
        .collect()
}

/// Get interactions for a specific workflow
#[tauri::command]
pub async fn get_workflow_interactions(
    pool: State<'_, SqlitePool>,
    workflow_id: String,
) -> Result<Vec<AgentInteraction>, String> {
    let rows: Vec<InteractionRow> = sqlx::query_as::<_, InteractionRow>(
        r#"
        SELECT 
            id, workflow_id, initiator_agent_id, target_agent_ids_json,
            interaction_type, status, priority, content_json,
            related_task_id, parent_interaction_id, duration_ms,
            created_at, completed_at
        FROM interactions
        WHERE workflow_id = ?
        ORDER BY created_at ASC
        "#
    )
    .bind(&workflow_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch workflow interactions: {}", e))?;

    rows.into_iter()
        .map(|row| AgentInteraction::try_from(row).map_err(|e| e.to_string()))
        .collect()
}

/// Create a new interaction
#[tauri::command]
pub async fn create_interaction(
    pool: State<'_, SqlitePool>,
    interaction: AgentInteraction,
) -> Result<AgentInteraction, String> {
    let row = InteractionRow::from(interaction.clone());
    
    sqlx::query(
        r#"
        INSERT INTO interactions (
            id, workflow_id, initiator_agent_id, target_agent_ids_json,
            interaction_type, status, priority, content_json,
            related_task_id, parent_interaction_id, duration_ms,
            created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&row.id)
    .bind(&row.workflow_id)
    .bind(&row.initiator_agent_id)
    .bind(&row.target_agent_ids_json)
    .bind(&row.interaction_type)
    .bind(&row.status)
    .bind(&row.priority)
    .bind(&row.content_json)
    .bind(&row.related_task_id)
    .bind(&row.parent_interaction_id)
    .bind(row.duration_ms)
    .bind(&row.created_at)
    .bind(&row.completed_at)
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to create interaction: {}", e))?;

    Ok(interaction)
}

/// Update interaction status
#[tauri::command]
pub async fn update_interaction_status(
    pool: State<'_, SqlitePool>,
    id: String,
    status: InteractionStatus,
) -> Result<(), String> {
    let status_json = serde_json::to_string(&status).map_err(|e| e.to_string())?;
    let completed_at = if matches!(status, InteractionStatus::Completed | InteractionStatus::Failed | InteractionStatus::Cancelled) {
        Some(chrono::Utc::now().to_rfc3339())
    } else {
        None
    };

    sqlx::query("UPDATE interactions SET status = ?, completed_at = ? WHERE id = ?")
        .bind(&status_json)
        .bind(&completed_at)
        .bind(&id)
        .execute(pool.inner())
        .await
        .map_err(|e| format!("Failed to update interaction status: {}", e))?;

    Ok(())
}

/// Delete interactions for a workflow
#[tauri::command]
pub async fn delete_workflow_interactions(
    pool: State<'_, SqlitePool>,
    workflow_id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM interactions WHERE workflow_id = ?")
        .bind(&workflow_id)
        .execute(pool.inner())
        .await
        .map_err(|e| format!("Failed to delete workflow interactions: {}", e))?;

    Ok(())
}

/// Get interaction statistics
#[tauri::command]
pub async fn get_interaction_stats(
    pool: State<'_, SqlitePool>,
    workflow_id: Option<String>,
) -> Result<serde_json::Value, String> {
    let (total, completed, failed, avg_duration) = if let Some(wf_id) = workflow_id {
        let total: i32 = sqlx::query_scalar::<_, i32>(
            "SELECT COUNT(*) FROM interactions WHERE workflow_id = ?"
        )
        .bind(&wf_id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

        let completed: i32 = sqlx::query_scalar::<_, i32>(
            r#"SELECT COUNT(*) FROM interactions WHERE workflow_id = ? AND status = '"completed"'"#
        )
        .bind(&wf_id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

        let failed: i32 = sqlx::query_scalar::<_, i32>(
            r#"SELECT COUNT(*) FROM interactions WHERE workflow_id = ? AND status = '"failed"'"#
        )
        .bind(&wf_id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

        let avg_duration: f64 = sqlx::query_scalar::<_, f64>(
            "SELECT COALESCE(AVG(duration_ms), 0) FROM interactions WHERE workflow_id = ? AND duration_ms IS NOT NULL"
        )
        .bind(&wf_id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

        (total, completed, failed, avg_duration)
    } else {
        let total: i32 = sqlx::query_scalar::<_, i32>("SELECT COUNT(*) FROM interactions")
            .fetch_one(pool.inner())
            .await
            .map_err(|e| e.to_string())?;

        let completed: i32 = sqlx::query_scalar::<_, i32>(
            r#"SELECT COUNT(*) FROM interactions WHERE status = '"completed"'"#
        )
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

        let failed: i32 = sqlx::query_scalar::<_, i32>(
            r#"SELECT COUNT(*) FROM interactions WHERE status = '"failed"'"#
        )
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

        let avg_duration: f64 = sqlx::query_scalar::<_, f64>(
            "SELECT COALESCE(AVG(duration_ms), 0) FROM interactions WHERE duration_ms IS NOT NULL"
        )
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

        (total, completed, failed, avg_duration)
    };

    Ok(serde_json::json!({
        "total": total,
        "completed": completed,
        "failed": failed,
        "pending": total - completed - failed,
        "averageDurationMs": avg_duration
    }))
}
