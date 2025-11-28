// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod models;

use reqwest;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::SqlitePool;
use std::collections::{HashMap, HashSet, VecDeque};
use std::process::Command;
use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

// --- Data Structures ---

#[derive(Deserialize, Debug, Clone)]
struct Node {
    id: String,
    #[serde(rename = "type")]
    node_type: String,
    data: Value,
}

#[derive(Deserialize, Debug)]
struct Edge {
    id: String,
    source: String,
    target: String,
}

#[derive(Deserialize, Debug)]
struct GraphState {
    nodes: Vec<Node>,
    edges: Vec<Edge>,
}

#[derive(Clone, serde::Serialize)]
struct LogPayload {
    message: String,
}

/// @struct FinishedPayload
/// The payload for the event indicating the workflow has completed.
#[derive(Clone, serde::Serialize)]
struct FinishedPayload {
    success: bool,
}

#[derive(Serialize, Deserialize)]
struct GhDeviceCodeRequest {
    client_id: String,
    scope: String,
}

#[derive(Serialize, Deserialize)]
struct GhDeviceCodeResponse {
    device_code: String,
    user_code: String,
    verification_uri: String,
    expires_in: u32,
    interval: u32,
}

// --- Tauri Commands ---

#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}!", name))
}

#[tauri::command]
async fn db_init() -> Result<(), String> {
    // Database initialization logic...
    Ok(())
}

#[tauri::command]
async fn save_workflow(graph_state_json: String) -> Result<(), String> {
    // Workflow saving logic...
    Ok(())
}

#[tauri::command]
async fn load_workflow() -> Result<String, String> {
    // Workflow loading logic...
    Ok("".to_string())
}

/// # run_workflow
/// Final version of the command. It streams logs and emits a completion event.
#[tauri::command]
async fn run_workflow(
    window: tauri::Window,
    graph_state_json: String,
) -> Result<(), String> {
    // --- Setup Phase ---
    let graph: GraphState =
        serde_json::from_str(&graph_state_json).map_err(|e| e.to_string())?;

    if graph.nodes.is_empty() {
        window
            .emit(
                "execution-log",
                LogPayload {
                    message: "[INFO] Workflow is empty. Nothing to run.".to_string(),
                },
            )
            .map_err(|e| e.to_string())?;
        // Emit the finished event even for an empty workflow
        window
            .emit("execution-finished", FinishedPayload { success: true })
            .map_err(|e| e.to_string())?;
        return Ok(());
    }

    let mut adj_list: HashMap<String, Vec<String>> = HashMap::new();
    let mut node_map: HashMap<String, Node> = HashMap::new();
    let mut edge_targets: HashSet<String> = HashSet::new();

    for node in graph.nodes.iter() {
        node_map.insert(node.id.clone(), node.clone());
        adj_list.insert(node.id.clone(), Vec::new());
    }
    for edge in graph.edges.iter() {
        if let Some(successors) = adj_list.get_mut(&edge.source) {
            successors.push(edge.target.clone());
        }
        edge_targets.insert(edge.target.clone());
    }
    let start_nodes: Vec<&Node> = graph
        .nodes
        .iter()
        .filter(|node| !edge_targets.contains(&node.id))
        .collect();

    if start_nodes.len() != 1 {
        // Return an error, which will be caught by the frontend's `catch` block.
        // The `finally` block on the frontend will handle UI state.
        return Err(format!(
            "Workflow must have exactly one start node (a node with no incoming edges). Found {}.",
            start_nodes.len()
        ));
    }
    let start_node_id = start_nodes[0].id.clone();

    // --- Traversal and Event Emitting ---
    let mut queue: VecDeque<String> = VecDeque::new();
    let mut visited: HashSet<String> = HashSet::new();
    queue.push_back(start_node_id.clone());
    visited.insert(start_node_id);

    while let Some(node_id) = queue.pop_front() {
        if let Some(node) = node_map.get(&node_id) {
            let node_name = node.data["name"].as_str().unwrap_or("Unnamed");
            let message = format!(
                "[EXEC] Visiting node '{}' (Type: {})",
                node_name, node.node_type
            );
            window
                .emit("execution-log", LogPayload { message })
                .map_err(|e| e.to_string())?;

            // The artificial sleep has been REMOVED.
            // In a real app, this is where agent logic would run.

            if let Some(successors) = adj_list.get(&node_id) {
                for successor_id in successors {
                    if !visited.contains(successor_id) {
                        visited.insert(successor_id.clone());
                        queue.push_back(successor_id.clone());
                    }
                }
            }
        }
    }

    window
        .emit(
            "execution-log",
            LogPayload {
                message: "[INFO] Workflow traversal complete.".to_string(),
            },
        )
        .map_err(|e| e.to_string())?;

    // Emit the final "finished" event to signal completion to the frontend.
    window
        .emit("execution-finished", FinishedPayload { success: true })
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

#[tauri::command]
async fn begin_github_device_flow(client_id: String) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .post("https://github.com/login/device/code")
        .header("Accept", "application/json")
        .header("User-Agent", "SquadAID-Tauri-App")
        .json(&serde_json::json!({ "client_id": client_id }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        res.json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())
    } else {
        Err(format!("GitHub API failed with status: {}", res.status()))
    }
}

#[tauri::command]
async fn poll_github_device_token(
    client_id: String,
    device_code: String,
    grant_type: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .header("User-Agent", "SquadAID-Tauri-App")
        .json(&serde_json::json!({
            "client_id": client_id,
            "device_code": device_code,
            "grant_type": grant_type,
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        res.json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())
    } else {
        Err(format!("GitHub API failed with status: {}", res.status()))
    }
}

#[tauri::command]
async fn list_ollama_models() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .get("http://localhost:11434/api/tags")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        res.json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())
    } else {
        Err(format!("Ollama API failed with status: {}", res.status()))
    }
}

#[tauri::command]
async fn test_ollama_connection() -> Result<bool, String> {
    let client = reqwest::Client::new();
    let res = client
        .get("http://localhost:11434")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    Ok(res.status().is_success())
}

#[tauri::command]
async fn run_gemini(prompt: String, model: String) -> Result<String, String> {
    // Execute gemini-cli
    // We assume 'gemini' is in the PATH and accepts the prompt as a positional argument
    // and the model via --model flag.
    // Example: gemini "Hello world" --model gemini-1.5-pro
    let output = Command::new("gemini")
        .arg(&prompt)
        .arg("--model")
        .arg(&model)
        .output()
        .map_err(|e| format!("Failed to execute gemini: {}", e))?;

    if output.status.success() {
        String::from_utf8(output.stdout).map_err(|e| format!("Invalid UTF-8: {}", e))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Gemini CLI error: {}", stderr))
    }
}

/// Initialize the database pool and run migrations
async fn init_database(app_handle: &tauri::AppHandle) -> Result<SqlitePool, String> {
    let db_path = db::get_db_path(app_handle)?;
    println!("Database path: {:?}", db_path);
    
    let pool = db::create_pool(&db_path).await?;
    println!("Database pool created");
    
    db::init_database(&pool).await?;
    println!("Database migrations complete");
    
    Ok(pool)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().add_migrations(
            "sqlite:app_data.db",
            vec![Migration {
                version: 1,
                description: "create initial tables",
                sql: "",
                kind: MigrationKind::Up,
            }],
        ).build())
        .setup(|app| {
            let app_handle = app.handle();
            
            // Initialize database asynchronously
            tauri::async_runtime::spawn(async move {
                match init_database(&app_handle).await {
                    Ok(pool) => {
                        app_handle.manage(pool);
                        println!("Database initialized successfully");
                    }
                    Err(e) => {
                        eprintln!("Failed to initialize database: {}", e);
                    }
                }
            });
            
            app.listen_global("my-event", |event| {
                println!("Received event: {:?}", event.payload());
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Original commands
            begin_github_device_flow,
            poll_github_device_token,
            list_ollama_models,
            test_ollama_connection,
            greet,
            db_init,
            save_workflow,
            load_workflow,
            run_workflow,
            run_gemini,
            // Role commands
            commands::get_roles,
            commands::get_role,
            commands::create_role,
            commands::update_role,
            commands::delete_role,
            commands::get_built_in_roles,
            // Agent commands
            commands::get_agents,
            commands::get_agent,
            commands::create_agent,
            commands::update_agent,
            commands::delete_agent,
            commands::update_agent_status,
            commands::assign_role_to_agent,
            commands::get_agents_by_role,
            // Relationship commands
            commands::get_relationships,
            commands::get_relationship,
            commands::create_relationship,
            commands::update_relationship,
            commands::delete_relationship,
            commands::get_agent_relationships,
            commands::get_relationships_by_type,
            // Interaction commands
            commands::get_interactions,
            commands::get_workflow_interactions,
            commands::create_interaction,
            commands::update_interaction_status,
            commands::delete_workflow_interactions,
            commands::get_interaction_stats,
            // Project commands
            commands::get_projects,
            commands::get_project,
            commands::create_project,
            commands::update_project,
            commands::delete_project,
            commands::get_project_tasks,
            commands::create_task,
            commands::update_task,
            commands::delete_task,
            commands::get_project_artifacts,
            commands::create_artifact,
            commands::delete_artifact
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}