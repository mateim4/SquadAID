# SquadAID Architecture Documentation

## Table of Contents
- [Overview](#overview)
- [Data Model](#data-model)
- [Agent Interaction Architecture](#agent-interaction-architecture)
- [Communication Patterns](#communication-patterns)
- [Execution Flow](#execution-flow)

---

## Overview

SquadAID is a multi-agent orchestration platform that enables visual workflow composition and execution. It combines a React/TypeScript frontend with multiple backend services (Gradio, Tauri, SurrealDB) to provide both local and cloud-based AI agent orchestration.

### Key Technologies
- **Frontend**: React + TypeScript + Vite + React Flow
- **Backend**: Rust (Tauri) + Python (Gradio)
- **Database**: SurrealDB
- **UI Framework**: Microsoft Fluent UI 2

---

## Data Model

```
╔════════════════════════════════════════════════════════════════════════════╗
║                        SquadAID Data Model (SurrealDB)                     ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│  CORE ENTITIES                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     PROJECT      │         Mode: 'local' | 'github' | 'hybrid'
├──────────────────┤
│ id               │ ◄───┐
│ slug  (unique)   │     │
│ name             │     │
│ description      │     │
│ repo             │     │    has many
│ folder           │     ├─────────────┐
│ mode             │     │             │
│ props (JSON)     │     │             ▼
│ created_at       │     │   ┌──────────────────┐
│ updated_at       │     │   │      STAGE       │
└──────────────────┘     │   ├──────────────────┤
         │               │   │ id               │
         │               │   │ project  ────────┘
         │               │   │ index   (order)  │
         │               │   │ title            │
         │ has many      │   │ description      │
         │               │   │ created_at       │
         ▼               │   │ updated_at       │
┌──────────────────┐     │   └──────────────────┘
│    WORKFLOW      │     │            │
├──────────────────┤     │            │ has many
│ id               │     │            │
│ project  ────────┘     │            ▼
│ name             │     │   ┌──────────────────┐
│ description      │     │   │       TASK       │
│ viewport (JSON)  │     │   ├──────────────────┤
│ status  (draft)  │     │   │ id               │
│ created_at       │     │   │ project  ────────┘
│ updated_at       │     │   │ stage    (opt)  ◄─┘
└──────────────────┘     │   │ workflow_id (opt) ──┐
         │               │   │ title            │   │
         │               │   │ description      │   │
         │ has many      │   │ status           │   │
         │               │   │ priority         │   │
         ├───────────────┼───│ labels[]         │   │
         │               │   │ assignees[]      │   │
         ▼               │   │ github_repo      │   │
┌──────────────────┐     │   │ github_issue_#   │   │
│     WF_NODE      │     │   │ created_at       │   │
├──────────────────┤     │   │ updated_at       │   │
│ id               │     │   └──────────────────┘   │
│ workflow  ───────┘     │                          │
│ key  (node.id)   │     │   Status: 'triage' |    │
│ type             │     │          'ready' |       │
│ label            │     │          'in_progress' | │
│ name             │     │          'blocked' |     │
│ data (JSON)      │     │          'done' |        │
│ position (x,y)   │     │          'archived'      │
│ agent (ref)      │     │                          │
└──────────────────┘     │                          │
         │               │   linked via workflow_id │
         │               │                          │
         │ connected by  └──────────────────────────┘
         │
         ▼
┌──────────────────┐
│     WF_EDGE      │     (Graph Relation: src -> WF_EDGE -> dst)
├──────────────────┤
│ id               │
│ workflow         │
│ in   (target)    │ ──► points to WF_NODE
│ out  (source)    │ ──► points to WF_NODE
│ source_handle    │
│ target_handle    │
│ label            │
│ condition        │
│ type  (default)  │
└──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│  AGENT SYSTEM                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│      AGENT       │     Built-in agents (seeded)
├──────────────────┤
│ id               │
│ kind  (builtin)  │
│ name             │
│ description      │
│ backend_type     │
│ icon_key         │
│ config (JSON)    │
│ created_at       │
│ updated_at       │
└──────────────────┘
         │
         │ referenced by
         │
         └──► WF_NODE.agent


┌─────────────────────────────────────────────────────────────────────────────┐
│  SETTINGS & SECRETS                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     SECRET       │     Key-value store for API keys
├──────────────────┤
│ key   (unique)   │     Keys: 'github_token'
│ value            │           'google_token'
│ created_at       │           'claude_token'
│ updated_at       │           'jules_token'
└──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│  RELATIONSHIPS SUMMARY                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

PROJECT (1) ──< (N) WORKFLOW
PROJECT (1) ──< (N) STAGE
PROJECT (1) ──< (N) TASK

STAGE (1) ──< (N) TASK  [optional]
WORKFLOW (1) ──< (N) TASK  [optional via workflow_id]
WORKFLOW (1) ──< (N) WF_NODE
WF_NODE (N) ──< (N) WF_EDGE  [graph edges connect nodes]

AGENT (1) ──< (N) WF_NODE  [agent can be referenced by multiple nodes]

TASK → GitHub Issue  [external linkage via github_repo + github_issue_number]
```

### Key Features
- **Multi-project workspace** with 3 modes: local, github, hybrid
- **Visual workflow builder** with React Flow (nodes + edges)
- **Kanban-style task management** with customizable stages
- **GitHub integration** for issue tracking and sync
- **API key management** for multiple AI services
- **Agent orchestration system** with pluggable backends
- **Graph-based workflow execution** model

---

## Agent Interaction Architecture

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    SquadAID Agent Interaction Architecture                 ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│  OVERVIEW: Multi-Layer Agent Communication Model                           │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────┐
   │                       Frontend (React/Vite)                      │
   └──────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
         ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
         │ React Flow   │  │  API Layer  │  │  Bridge      │
         │  Canvas      │  │   Service   │  │  Services    │
         └──────────────┘  └─────────────┘  └──────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
         ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
         │   Gradio     │  │    Tauri    │  │   GitHub     │
         │   Backend    │  │   Native    │  │   Issues     │
         └──────────────┘  └─────────────┘  └──────────────┘
```

### Layer 1: Visual Workflow Builder

Users create workflows visually by dragging nodes onto a canvas using React Flow. Each node represents an agent or operation, and edges represent data flow between nodes.

**Storage**: Workflows are persisted to SurrealDB as:
- `WF_NODE`: Visual nodes with position, configuration, and data
- `WF_EDGE`: Connections between nodes with conditional logic

### Layer 2: Workflow Execution Engine

**Hook**: `useWorkflowExecution()`

**State Management**:
- `isExecuting`: Current execution status
- `progress`: Percentage complete
- `currentNode`: Currently executing node ID
- `results`: Array of agent responses
- `error`: Error message if execution fails

**Actions**:
- `executeWorkflow(nodes, edges)`: Convert visual graph to execution request
- `testNode(node)`: Test single agent in isolation
- `reset()`: Clear execution state

**Execution Flow**:
1. User clicks "Run Workflow"
2. Canvas nodes & edges → `WorkflowExecutionRequest`
3. Request sent to backend via `APIService`
4. Backend orchestrates agent communication
5. Results streamed back to frontend
6. UI updates with progress & results

### Layer 3: API Service

**File**: `src/services/api.ts`

**Responsibilities**:
- Session management with unique `sessionHash`
- Workflow execution via Gradio API
- Individual agent testing
- Health checks and backend initialization

**Agent Function Mapping**:
```typescript
{
  'architect':      fn_index: 1,
  'qwen_qa':        fn_index: 2,
  'copilot_bridge': fn_index: 3,
  'jules_bridge':   fn_index: 4,
  'claude_bridge':  fn_index: 5,
  'ollama_bridge':  fn_index: 6,
  'msty_bridge':    fn_index: 7,
  'workflow':       fn_index: 0
}
```

**API Endpoints**:
- `POST /gradio_api/predict`: Execute workflow or agent
- `GET /config`: Backend configuration and health check

### Layer 4: Backend Execution (Gradio)

**Note**: The Gradio Python backend is separate from this TypeScript codebase.

**Workflow**:
1. Receives workflow execution request
2. Parses nodes & edges into directed graph
3. Performs topological sort to determine execution order
4. For each node in sequence:
   - Identify agent type
   - Load agent configuration
   - Execute agent with inputs from previous nodes
   - Collect output for next nodes
5. Return aggregated results to frontend

### Layer 5: Bridge Services

Bridge services connect SquadAID to external AI services and platforms.

#### Jules Bridge (`julesBridge.ts`)

**Communication**: GitHub Issues as asynchronous message channel

**Flow**:
1. `ensureSessionIssue()` → Creates GitHub issue if needed
2. `sendMessage()` → Posts comment to issue
3. `fetchNewMessages()` → Polls issue comments
4. Filter by `julesActor` username to get Jules responses

**Session Structure**:
```typescript
{
  repo: "owner/name",
  issueNumber: 123,
  julesActor: "google-jules-bot"
}
```

#### Ollama Bridge (`ollama.ts`)

**Communication**: HTTP REST API to local Ollama server

**Functions**:
- `listLocalModels()`: GET `/ollama-api/api/tags`
- `testOllamaConnection()`: GET `/ollama-api/`

**Platform Detection**:
- **Tauri**: `invoke("list_ollama_models")` (Rust command)
- **Web**: `fetch('/ollama-api/api/tags')` (via Vite proxy)

**Vite Proxy** (development):
```
/ollama-api/* → http://localhost:11434/*
```

#### GitHub Bridge (`github.ts`)

**Communication**: GitHub REST API v3

**Functions**:
- `createIssue(repo, title, body, labels)`
- `getIssueComments(repo, number)`
- `addIssueComment(repo, number, body)`
- `getUser()`
- OAuth device flow for authentication

**Auth**: Bearer token from `SECRET` table (`github_token`)

---

## Communication Patterns

### Pattern 1: Direct API (Ollama, Claude)
```
Frontend → HTTP → Local/Cloud Service → Response
```

Simple synchronous request-response pattern for direct API calls.

### Pattern 2: GitHub Issues (Jules)
```
Frontend → GitHub API → Issue Comment → Jules reads →
Jules responds → Frontend polls → Gets response
```

Asynchronous communication through GitHub issues, allowing Jules to process requests and respond when ready.

### Pattern 3: Gradio Backend (Main Orchestration)
```
Frontend → Gradio → Python Agents → External Services → 
Results → Frontend
```

The main workflow orchestration pattern where Gradio manages the execution graph.

### Pattern 4: Tauri IPC (Desktop)
```
Frontend → invoke() → Rust Backend → System Resources → Response
```

Native desktop capabilities through Rust commands when running as a Tauri application.

---

## Execution Flow Example

### Scenario: Jules Agent Workflow

**User Action**:
1. Drops "Jules Agent" node onto canvas
2. Connects it to input/output nodes
3. Clicks "Run Workflow"

**Frontend** (`src/hooks/useWorkflowExecution.ts`):
1. `useWorkflowExecution.executeWorkflow()`
   - Collects nodes: `[inputNode, julesNode, outputNode]`
   - Collects edges: `[input→jules, jules→output]`
   - Creates `WorkflowExecutionRequest`

2. `apiService.executeWorkflow(request)`
   - POST to Gradio backend at `/gradio_api/predict`
   - `fn_index: 4` (jules_bridge)

**Backend** (Gradio Python - separate codebase):
3. Receives workflow execution
   - Identifies `jules_bridge` agent
   - Calls Jules bridge handler
   - **Jules Bridge Handler**:
     - Gets Jules API key from environment/config
     - Creates/finds GitHub issue session
     - Posts user message as issue comment
     - Waits for Jules response (polls comments)
     - Filters for `julesActor` username
     - Returns Jules response

4. Returns result to frontend
   ```json
   {
     "agent": "jules",
     "message": "...",
     "data": {...}
   }
   ```

**Frontend Updates**:
5. `useWorkflowExecution` updates state
   - `results.push(response)`
   - `isExecuting = false`
   - UI shows Jules response

---

## Key Architectural Concepts

### 1. Visual → Executable

Users build workflows visually using React Flow. The graph is serialized to JSON (nodes + edges) and sent to the backend, which interprets and executes it.

### 2. Bridge Pattern

Each external service has a dedicated "bridge" service that handles:
- Authentication and API key management
- API calls and error handling
- Response formatting and normalization
- Platform-specific implementations (Tauri vs Web)

This provides a consistent interface across different AI backends.

### 3. Dual Execution Modes

- **Synchronous**: `testNode()` - Test single agent in isolation
- **Asynchronous**: `executeWorkflow()` - Run entire workflow graph

### 4. State Persistence

- Workflows saved to SurrealDB as `WF_NODE` + `WF_EDGE`
- API keys stored in `SECRET` table
- Execution results can be linked to `TASK` entities
- Graph topology and viewport state preserved

### 5. Platform Detection

The application runs in two modes:

**Tauri (Desktop)**:
- Native Rust commands via `invoke()`
- Direct system access
- Better performance for local AI models

**Web (Browser)**:
- HTTP fetch with Vite dev proxy
- Cross-platform compatibility
- Cloud-based execution

The same TypeScript code works in both environments through runtime platform detection.

---

## Security Considerations

1. **API Key Storage**: All API keys are stored in the SurrealDB `SECRET` table, not in code or config files
2. **Token Caching**: In-memory token cache with localStorage fallback for performance
3. **CORS Handling**: Vite proxy for development, proper CORS headers in production
4. **Authentication**: OAuth device flow for GitHub, bearer tokens for API services
5. **Input Validation**: All user inputs validated before execution

---

## Performance Optimizations

1. **Lazy Loading**: Components and services loaded on-demand
2. **Debounced Saves**: Workflow changes saved with debouncing to reduce DB writes
3. **Session Caching**: Gradio session hash reused across requests
4. **React Flow Optimization**: Canvas rendering optimized with React Flow's built-in virtualization
5. **Conditional Execution**: Workflow nodes only execute when inputs change

---

## Future Architecture Considerations

1. **WebSocket Support**: Real-time workflow execution updates
2. **Workflow Versioning**: Track and restore previous workflow versions
3. **Agent Marketplace**: Plugin system for third-party agents
4. **Distributed Execution**: Run workflows across multiple backend servers
5. **Workflow Templates**: Pre-built workflows for common tasks
6. **Execution History**: Detailed logs and replay functionality
