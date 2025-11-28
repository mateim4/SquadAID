//! Relationship commands for Tauri

use crate::models::{AgentRelationship, RelationshipRow, RelationshipType};
use sqlx::SqlitePool;
use tauri::State;

/// Get all relationships
#[tauri::command]
pub async fn get_relationships(pool: State<'_, SqlitePool>) -> Result<Vec<AgentRelationship>, String> {
    let rows: Vec<RelationshipRow> = sqlx::query_as::<_, RelationshipRow>(
        r#"
        SELECT 
            id, source_agent_id, target_agent_id, relationship_type,
            metadata_json, created_at, updated_at
        FROM relationships
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch relationships: {}", e))?;

    rows.into_iter()
        .map(|row| AgentRelationship::try_from(row).map_err(|e| e.to_string()))
        .collect()
}

/// Get a single relationship by ID
#[tauri::command]
pub async fn get_relationship(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<AgentRelationship>, String> {
    let row: Option<RelationshipRow> = sqlx::query_as::<_, RelationshipRow>(
        r#"
        SELECT 
            id, source_agent_id, target_agent_id, relationship_type,
            metadata_json, created_at, updated_at
        FROM relationships
        WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch relationship: {}", e))?;

    match row {
        Some(r) => Ok(Some(AgentRelationship::try_from(r).map_err(|e| e.to_string())?)),
        None => Ok(None),
    }
}

/// Create a new relationship
#[tauri::command]
pub async fn create_relationship(
    pool: State<'_, SqlitePool>,
    relationship: AgentRelationship,
) -> Result<AgentRelationship, String> {
    let row = RelationshipRow::from(relationship.clone());
    
    sqlx::query(
        r#"
        INSERT INTO relationships (
            id, source_agent_id, target_agent_id, relationship_type,
            metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&row.id)
    .bind(&row.source_agent_id)
    .bind(&row.target_agent_id)
    .bind(&row.relationship_type)
    .bind(&row.metadata_json)
    .bind(&row.created_at)
    .bind(&row.updated_at)
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to create relationship: {}", e))?;

    Ok(relationship)
}

/// Update an existing relationship
#[tauri::command]
pub async fn update_relationship(
    pool: State<'_, SqlitePool>,
    relationship: AgentRelationship,
) -> Result<AgentRelationship, String> {
    let row = RelationshipRow::from(relationship.clone());
    let updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        r#"
        UPDATE relationships SET
            source_agent_id = ?, target_agent_id = ?, relationship_type = ?,
            metadata_json = ?, updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(&row.source_agent_id)
    .bind(&row.target_agent_id)
    .bind(&row.relationship_type)
    .bind(&row.metadata_json)
    .bind(&updated_at)
    .bind(&row.id)
    .execute(pool.inner())
    .await
    .map_err(|e| format!("Failed to update relationship: {}", e))?;

    Ok(relationship)
}

/// Delete a relationship
#[tauri::command]
pub async fn delete_relationship(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM relationships WHERE id = ?")
        .bind(&id)
        .execute(pool.inner())
        .await
        .map_err(|e| format!("Failed to delete relationship: {}", e))?;

    Ok(())
}

/// Get relationships for a specific agent
#[tauri::command]
pub async fn get_agent_relationships(
    pool: State<'_, SqlitePool>,
    agent_id: String,
) -> Result<Vec<AgentRelationship>, String> {
    let rows: Vec<RelationshipRow> = sqlx::query_as::<_, RelationshipRow>(
        r#"
        SELECT 
            id, source_agent_id, target_agent_id, relationship_type,
            metadata_json, created_at, updated_at
        FROM relationships
        WHERE source_agent_id = ? OR target_agent_id = ?
        ORDER BY created_at DESC
        "#
    )
    .bind(&agent_id)
    .bind(&agent_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch agent relationships: {}", e))?;

    rows.into_iter()
        .map(|row| AgentRelationship::try_from(row).map_err(|e| e.to_string()))
        .collect()
}

/// Get relationships by type
#[tauri::command]
pub async fn get_relationships_by_type(
    pool: State<'_, SqlitePool>,
    relationship_type: RelationshipType,
) -> Result<Vec<AgentRelationship>, String> {
    let type_json = serde_json::to_string(&relationship_type).map_err(|e| e.to_string())?;
    
    let rows: Vec<RelationshipRow> = sqlx::query_as::<_, RelationshipRow>(
        r#"
        SELECT 
            id, source_agent_id, target_agent_id, relationship_type,
            metadata_json, created_at, updated_at
        FROM relationships
        WHERE relationship_type = ?
        ORDER BY created_at DESC
        "#
    )
    .bind(&type_json)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| format!("Failed to fetch relationships by type: {}", e))?;

    rows.into_iter()
        .map(|row| AgentRelationship::try_from(row).map_err(|e| e.to_string()))
        .collect()
}
