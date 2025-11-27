# SquadAID: Unified Tracking Checklist

Use this single issue to track progress. Check items as they’re completed. Avoid mocks in-app; use real integrations. If something is partially done, mark it accordingly and add a short note.

## Canvas & Agents
- [ ] Nodes collapsed by default; remove pre-seeded nodes
- [ ] Restore dragging; guard form controls from drag
- [ ] Edge center hoverable circle; inline trigger editor; persist conditions
- [ ] Edge reconnect/unlink via pane drop
- [ ] Settings tab present
- [ ] Confirm IPC bridge usage and events

## Legacy Agents & Parameters
- [ ] Restore legacy agents and parameters (architect, qwen_qa, jules-coder, copilot, claude, ollama, msty)
- [ ] Map agents to backend bridges correctly
- [ ] Claude model dropdown (Sonnet 4, Opus 4.1)
- [ ] Clarify label listener for Copilot async coding agent

## Projects, Stages, Tasks
- [ ] Projects page UI with right-side Tasks panel
- [ ] Stages per project (own to-do/team)
- [ ] Higher-level project to-do list
- [ ] Architect AI tracks tasks/subtasks

## Modes: Local / GitHub / Hybrid
- [ ] Per-project mode switch (local-only, github-only, hybrid)
- [ ] Local-only: persist tasks in SurrealDB
- [ ] GitHub-only: list and manage GitHub issues directly
- [ ] Hybrid: SurrealDB primary, GitHub kept in sync

## Integrations & Credentials (No mocks)
- [ ] Settings UI for credentials:
  - [ ] GitHub PAT with “Test Connection”
  - [ ] Google (Jules) token
  - [ ] Claude Code token
- [ ] SurrealDB secrets storage wired
- [ ] GitHub client using stored token

## GitHub Sync Behavior
- [ ] Tasks → Issues; Subtasks → Requests
- [ ] Labels/comments mirroring
- [ ] Two-way sync in Hybrid (polling worker or webhook companion)
- [ ] “Link Issue” button on tasks

## Runs & PR Automation
- [ ] Task detail drawer with status transitions and subtasks
- [ ] “Run for Task” via Tauri runner; stream logs; update task/run rows
- [ ] Post results as GitHub issue comments when linked
- [ ] Create branch; commit; open PR; assign Copilot reviewer

## Quality Gates
- [ ] Build passes (Vite + TS)
- [ ] Lint/typecheck clean
- [ ] Core unit tests for services (Surreal, GitHub)

Notes:
- No mocks in-app; dev-only scripts must not be used in production flows.
- Prefer minimal, pinned dependencies. Ensure credentials are stored securely.
