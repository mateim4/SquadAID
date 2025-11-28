//! Agent commands for Tauri

use crate::models::{EnhancedAgent, AgentRow, AgentStatus};
use sqlx::SqlitePool;
use tauri::State;

/// Get all agents
#[tauri::command]
pub async fn get_agents(pool: State<'_, SqlitePool>) -> Result<Vec<EnhancedAgent>, String> {
    let rows: Vec<AgentRow> = sqlx::query_as!(
        AgentRow,
        r#"
        SELECT 
            id, name, description, role_id, mode, status,
            provider_config_json, system_prompt_override, metrics_json,
            position_x, position_y, 
            expanded as "expanded: bool", 
            selected as "selected: bool",
            created_at, updated_at
        FROM agents
        ORDER BY name
        "#
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch agents: {}", e))?;

    rows.into_iter()
        .map(|row| EnhancedAgent::try_from(row).map_err(|e| e.to_string()))
        .collect()
}

/// Get a single agent by ID
#[tauri::command]
pub async fn get_agent(pool: State<'_, SqlitePool>, id: String) -> Result<Option<EnhancedAgent>, String> {
    let row: Option<AgentRow> = sqlx::query_as!(
        AgentRow,
        r#"
        SELECT 
            id, name, description, role_id, mode, status,
            provider_config_json, system_prompt_override, metrics_json,
            position_x, position_y,
            expanded as "expanded: bool",
            selected as "selected: bool",
            created_at, updated_at
        FROM agents
        WHERE id = ?
        "#,
        id
    )
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch agent: {}", e))?;

    match row {
        Some(r) => Ok(Some(EnhancedAgent::try_from(r).map_err(|e| e.to_string())?)),
        None => Ok(None),
    }
}

/// Create a new agent
#[tauri::command]
pub async fn create_agent(pool: State<'_, SqlitePool>, agent: EnhancedAgent) -> Result<EnhancedAgent, String> {
    let row = AgentRow::from(agent.clone());
    
    sqlx::query!(
        r#"
        INSERT INTO agents (
            id, name, description, role_id, mode, status,
            provider_config_json, system_prompt_override, metrics_json,
            position_x, position_y, expanded, selected,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
        row.id,
        row.name,
        row.description,
        row.role_id,
        row.mode,
        row.status,
        row.provider_config_json,
        row.system_prompt_override,
        row.metrics_json,
        row.position_x,
        row.position_y,
        row.expanded,
        row.selected,
        row.created_at,
        row.updated_at
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to create agent: {}", e))?;

    Ok(agent)
}

/// Update an existing agent
#[tauri::command]
pub async fn update_agent(pool: State<'_, SqlitePool>, agent: EnhancedAgent) -> Result<EnhancedAgent, String> {
    let row = AgentRow::from(agent.clone());
    let updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query!(
        r#"
        UPDATE agents SET
            name = ?, description = ?, role_id = ?, mode = ?, status = ?,
            provider_config_json = ?, system_prompt_override = ?, metrics_json = ?,
            position_x = ?, position_y = ?, expanded = ?, selected = ?,
            updated_at = ?
        WHERE id = ?
        "#,
        row.name,
        row.description,
        row.role_id,
        row.mode,
        row.status,
        row.provider_config_json,
        row.system_prompt_override,
        row.metrics_json,
        row.position_x,
        row.position_y,
        row.expanded,
        row.selected,
        updated_at,
        row.id
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to update agent: {}", e))?;

    Ok(agent)
}

/// Delete an agent
#[tauri::command]
pub async fn delete_agent(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    sqlx::query!("DELETE FROM agents WHERE id = ?", id)
        .execute(pool.inner())
        .await
        .map_err(|e| format!("Failed to delete agent: {}", e))?;

    Ok(())
}

/// Update agent status
#[tauri::command]
pub async fn update_agent_status(
    pool: State<'_, SqlitePool>,
    id: String,
    status: AgentStatus,
) -> Result<(), String> {
    let status_json = serde_json::to_string(&status).map_err(|e| e.to_string())?;
    let updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query!(
        "UPDATE agents SET status = ?, updated_at = ? WHERE id = ?",
        status_json,
        updated_at,
        id
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to update agent status: {}", e))?;

    Ok(())
}

/// Assign a role to an agent
#[tauri::command]
pub async fn assign_role_to_agent(
    pool: State<'_, SqlitePool>,
    agent_id: String,
    role_id: Option<String>,
) -> Result<(), String> {
    let updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query!(
        "UPDATE agents SET role_id = ?, updated_at = ? WHERE id = ?",
        role_id,
        updated_at,
        agent_id
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to assign role: {}", e))?;

    Ok(())
}

/// Get agents by role ID
#[tauri::command]
pub async fn get_agents_by_role(
    pool: State<'_, SqlitePool>,
    role_id: String,
) -> Result<Vec<EnhancedAgent>, String> {
    let rows: Vec<AgentRow> = sqlx::query_as!(
        AgentRow,
        r#"
        SELECT 
            id, name, description, role_id, mode, status,
            provider_config_json, system_prompt_override, metrics_json,
            position_x, position_y,
            expanded as "expanded: bool",
            selected as "selected: bool",
            created_at, updated_at
        FROM agents
        WHERE role_id = ?
        ORDER BY name
        "#,
        role_id
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch agents by role: {}", e))?;

    rows.into_iter()
        .map(|row| EnhancedAgent::try_from(row).map_err(|e| e.to_string()))
        .collect()
}
