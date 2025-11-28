//! Role commands for Tauri

use crate::models::{Role, RoleRow};
use sqlx::SqlitePool;
use tauri::State;

/// Get all roles
#[tauri::command]
pub async fn get_roles(pool: State<'_, SqlitePool>) -> Result<Vec<Role>, String> {
    let rows: Vec<RoleRow> = sqlx::query_as::<_, RoleRow>(
        r#"
        SELECT 
            id, name, description, icon, color, 
            capabilities_json, system_prompt, tools_json,
            constraints_json, is_built_in,
            version, tags_json, created_at, updated_at
        FROM roles
        ORDER BY name
        "#
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch roles: {}", e))?;

    rows.into_iter()
        .map(|row| Role::try_from(row).map_err(|e| e.to_string()))
        .collect()
}

/// Get a single role by ID
#[tauri::command]
pub async fn get_role(pool: State<'_, SqlitePool>, id: String) -> Result<Option<Role>, String> {
    let row: Option<RoleRow> = sqlx::query_as::<_, RoleRow>(
        r#"
        SELECT 
            id, name, description, icon, color, 
            capabilities_json, system_prompt, tools_json,
            constraints_json, is_built_in,
            version, tags_json, created_at, updated_at
        FROM roles
        WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch role: {}", e))?;

    match row {
        Some(r) => Ok(Some(Role::try_from(r).map_err(|e| e.to_string())?)),
        None => Ok(None),
    }
}

/// Create a new role
#[tauri::command]
pub async fn create_role(pool: State<'_, SqlitePool>, role: Role) -> Result<Role, String> {
    let row = RoleRow::from(role.clone());
    
    sqlx::query(
        r#"
        INSERT INTO roles (
            id, name, description, icon, color,
            capabilities_json, system_prompt, tools_json,
            constraints_json, is_built_in, version, tags_json,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&row.id)
    .bind(&row.name)
    .bind(&row.description)
    .bind(&row.icon)
    .bind(&row.color)
    .bind(&row.capabilities_json)
    .bind(&row.system_prompt)
    .bind(&row.tools_json)
    .bind(&row.constraints_json)
    .bind(row.is_built_in)
    .bind(&row.version)
    .bind(&row.tags_json)
    .bind(&row.created_at)
    .bind(&row.updated_at)
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to create role: {}", e))?;

    Ok(role)
}

/// Update an existing role
#[tauri::command]
pub async fn update_role(pool: State<'_, SqlitePool>, role: Role) -> Result<Role, String> {
    // Check if role is built-in
    let is_built_in: bool = sqlx::query_scalar::<_, bool>(
        r#"SELECT is_built_in FROM roles WHERE id = ?"#
    )
    .bind(&role.id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| format!("Failed to check role: {}", e))?
    .unwrap_or(false);

    if is_built_in {
        return Err("Cannot modify built-in roles".to_string());
    }

    let row = RoleRow::from(role.clone());
    let updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        r#"
        UPDATE roles SET
            name = ?, description = ?, icon = ?, color = ?,
            capabilities_json = ?, system_prompt = ?, tools_json = ?,
            constraints_json = ?, version = ?, tags_json = ?,
            updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(&row.name)
    .bind(&row.description)
    .bind(&row.icon)
    .bind(&row.color)
    .bind(&row.capabilities_json)
    .bind(&row.system_prompt)
    .bind(&row.tools_json)
    .bind(&row.constraints_json)
    .bind(&row.version)
    .bind(&row.tags_json)
    .bind(&updated_at)
    .bind(&row.id)
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to update role: {}", e))?;

    Ok(role)
}

/// Delete a role
#[tauri::command]
pub async fn delete_role(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    // Check if role is built-in
    let is_built_in: bool = sqlx::query_scalar::<_, bool>(
        r#"SELECT is_built_in FROM roles WHERE id = ?"#
    )
    .bind(&id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| format!("Failed to check role: {}", e))?
    .unwrap_or(false);

    if is_built_in {
        return Err("Cannot delete built-in roles".to_string());
    }

    sqlx::query("DELETE FROM roles WHERE id = ?")
        .bind(&id)
        .execute(pool.inner())
        .await
        .map_err(|e| format!("Failed to delete role: {}", e))?;

    Ok(())
}

/// Get built-in roles only
#[tauri::command]
pub async fn get_built_in_roles(pool: State<'_, SqlitePool>) -> Result<Vec<Role>, String> {
    let rows: Vec<RoleRow> = sqlx::query_as::<_, RoleRow>(
        r#"
        SELECT 
            id, name, description, icon, color, 
            capabilities_json, system_prompt, tools_json,
            constraints_json, is_built_in,
            version, tags_json, created_at, updated_at
        FROM roles
        WHERE is_built_in = 1
        ORDER BY name
        "#
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch built-in roles: {}", e))?;

    rows.into_iter()
        .map(|row| Role::try_from(row).map_err(|e| e.to_string()))
        .collect()
}
