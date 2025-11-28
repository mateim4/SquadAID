//! Tauri commands for SquadAID
//! 
//! Exposes CRUD operations for all entity types to the frontend.

pub mod roles;
pub mod agents;
pub mod relationships;
pub mod interactions;
pub mod projects;

// Re-export all command functions for easy registration
pub use roles::*;
pub use agents::*;
pub use relationships::*;
pub use interactions::*;
pub use projects::*;
