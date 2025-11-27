# SquadAID Progress Log

This document summarizes the current project state and tracks major milestones. For the live checklist, see the auto-managed GitHub issue titled “SquadAID: Unified Tracking Checklist”.

## Highlights (as of 2025-09-15)

- Canvas
  - Nodes collapsed by default, improved drag/selection, edges with hoverable center + inline condition editor, reconnect/unlink on pane drop.
- Agents
  - Restored legacy agents and mappings; added Claude model dropdown (Sonnet 4 / Opus 4.1).
- Settings
  - Real credentials UI: GitHub PAT (with Test Connection), Google (Jules), Claude Code. Secrets stored in SurrealDB.
- Projects
  - UI aligned with Team Builder: collapsible sidebars; stage columns with per-stage quick add; inline stage move.
  - Modes: Local-only, GitHub-only, Hybrid.
    - GitHub-only: lists issues for the configured repo, open in GitHub, refresh.
    - Hybrid: local tasks persist in Surreal; new tasks mirrored as GitHub issues when repo is set; manual “Link issue #”.
    - Two-way sync (polling every 15s): local titles/status/labels updated from GitHub; task status changes mirror open/closed to GitHub.
  - Task Detail dialog: edit title/description/labels, change status, link workflow, “Run for Task” invokes Tauri and streams logs; posts a log tail as a comment on the linked issue.

## Next Up

- Two-way sync extensions: labels/comments both directions; assignees mapping.
- Load and run the exact saved workflow graph by default when linked (now supported if selected in dialog).
- Optional webhook companion for push-based GitHub updates.
- PR automation: branch, commit, open PR, add Copilot reviewer.

## Quality Gates

- Build: passing
- Type-check: passing in build
- Tests: manual coverage in this iteration; Playwright specs exist, not run here.

## Files Added/Updated

- .github/workflows/tracking-issue.yml — Auto-updates tracking issue from .github/TRACKING_ISSUE.md
- .github/TRACKING_ISSUE.md — Single-source checklist for the tracking issue
- src/pages/SettingsPage.tsx — Tokens UI + GitHub Test Connection
- src/services/surreal.ts — Task GitHub linking fields
- src/types/index.ts — Task type extended with GitHub metadata
- src/pages/ProjectsPage.tsx — GitHub-only, Hybrid sync, Task dialog with runs, and UI structure alignment

---

For any change, update this PROGRESS.md and the tracking issue as needed.
