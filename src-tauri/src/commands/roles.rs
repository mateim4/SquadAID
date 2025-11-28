//! Role commands for Tauri

use crate::models::{Role, RoleRow};
use sqlx::SqlitePool;
use tauri::State;

/// Get all roles
#[tauri::command]
pub async fn get_roles(pool: State<'_, SqlitePool>) -> Result<Vec<Role>, String> {
    let rows: Vec<RoleRow> = sqlx::query_as!(
        RoleRow,
        r#"
        SELECT 
            id, name, description, icon, color, 
            capabilities_json, system_prompt, tools_json,
            constraints_json, is_built_in as "is_built_in: bool",
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
    let row: Option<RoleRow> = sqlx::query_as!(
        RoleRow,
        r#"
        SELECT 
            id, name, description, icon, color, 
            capabilities_json, system_prompt, tools_json,
            constraints_json, is_built_in as "is_built_in: bool",
            version, tags_json, created_at, updated_at
        FROM roles
        WHERE id = ?
        "#,
        id
    )
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
    
    sqlx::query!(
        r#"
        INSERT INTO roles (
            id, name, description, icon, color,
            capabilities_json, system_prompt, tools_json,
            constraints_json, is_built_in, version, tags_json,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
        row.id,
        row.name,
        row.description,
        row.icon,
        row.color,
        row.capabilities_json,
        row.system_prompt,
        row.tools_json,
        row.constraints_json,
        row.is_built_in,
        row.version,
        row.tags_json,
        row.created_at,
        row.updated_at
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to create role: {}", e))?;

    Ok(role)
}

/// Update an existing role
#[tauri::command]
pub async fn update_role(pool: State<'_, SqlitePool>, role: Role) -> Result<Role, String> {
    // Check if role is built-in
    let is_built_in: bool = sqlx::query_scalar!(
        r#"SELECT is_built_in as "is_built_in: bool" FROM roles WHERE id = ?"#,
        role.id
    )
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| format!("Failed to check role: {}", e))?
    .flatten()
    .unwrap_or(false);

    if is_built_in {
        return Err("Cannot modify built-in roles".to_string());
    }

    let row = RoleRow::from(role.clone());
    let updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query!(
        r#"
        UPDATE roles SET
            name = ?, description = ?, icon = ?, color = ?,
            capabilities_json = ?, system_prompt = ?, tools_json = ?,
            constraints_json = ?, version = ?, tags_json = ?,
            updated_at = ?
        WHERE id = ?
        "#,
        row.name,
        row.description,
        row.icon,
        row.color,
        row.capabilities_json,
        row.system_prompt,
        row.tools_json,
        row.constraints_json,
        row.version,
        row.tags_json,
        updated_at,
        row.id
    )
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to update role: {}", e))?;

    Ok(role)
}

/// Delete a role
#[tauri::command]
pub async fn delete_role(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    // Check if role is built-in
    let is_built_in: bool = sqlx::query_scalar!(
        r#"SELECT is_built_in as "is_built_in: bool" FROM roles WHERE id = ?"#,
        id
    )
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| format!("Failed to check role: {}", e))?
    .flatten()
    .unwrap_or(false);

    if is_built_in {
        return Err("Cannot delete built-in roles".to_string());
    }

    sqlx::query!("DELETE FROM roles WHERE id = ?", id)
        .execute(pool.inner())
        .await
        .map_err(|e| format!("Failed to delete role: {}", e))?;

    Ok(())
}

/// Get built-in roles only
#[tauri::command]
pub async fn get_built_in_roles(pool: State<'_, SqlitePool>) -> Result<Vec<Role>, String> {
    let rows: Vec<RoleRow> = sqlx::query_as!(
        RoleRow,
        r#"
        SELECT 
            id, name, description, icon, color, 
            capabilities_json, system_prompt, tools_json,
            constraints_json, is_built_in as "is_built_in: bool",
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
