// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{HashMap, HashSet, VecDeque};
use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind, TauriSql};

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

// ... (existing commands: greet, db_init, save_workflow, load_workflow) ...

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

fn main() {
    tauri::Builder::default()
        .plugin(TauriSql::default().add_migrations(
            "sqlite:app_data.db",
            vec![Migration {
                version: 1,
                description: "create initial tables",
                sql: "",
                kind: MigrationKind::Up,
            }],
        ))
        .invoke_handler(tauri::generate_handler![
            greet,
            db_init,
            save_workflow,
            load_workflow,
            run_workflow
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}