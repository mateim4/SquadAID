//! Data models for SquadAID
//! 
//! This module contains all the Rust type definitions that mirror
//! the TypeScript types in the frontend.

pub mod role;
pub mod relationship;
pub mod interaction;
pub mod agent;
pub mod project;

pub use role::*;
pub use relationship::*;
pub use interaction::*;
pub use agent::*;
pub use project::*;
