# SquadAID - Agent Orchestrator Studio

A collaborative agent teaming platform built with React, TypeScript, and Tauri. SquadAID enables teams to orchestrate AI agents for complex workflows and real-time collaboration.

## Features

- **Visual Agent Orchestration**: Drag-and-drop interface for building agent workflows
- **Real-time Execution**: Live streaming of agent interactions and results
- **Multi-Agent Support**: Assistant agents and user proxy agents for diverse workflows
- **Cross-platform Desktop App**: Built with Tauri for native performance
- **Modern UI**: Fluent UI components with dark/light theme support

## Projects Module

The Projects section provides Local-only, GitHub-only, and Hybrid modes:

- GitHub-only: lists issues from a configured repo; open in GitHub; refresh.
- Local-only: tasks stored in SurrealDB; stage-based organization.
- Hybrid: SurrealDB primary with GitHub kept in sync; create local tasks mirrored as GitHub issues; link existing issues; two-way polling sync for titles/status/labels; status changes close/reopen issues.

Task Detail includes status changes, workflow linking, and “Run for Task” which executes via Tauri and posts a logs tail to the linked GitHub issue.

See PROGRESS.md for a current status overview, and .github/TRACKING_ISSUE.md for the single tracking checklist that auto-updates into a GitHub issue.

## Tech Stack

- **Frontend**: React 18, TypeScript, Fluent UI
- **Backend**: Rust (Tauri)
- **State Management**: Zustand
- **State Management**: Zustand
- **Build Tools**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Rust (for Tauri)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mateim/SquadAID.git
cd SquadAID

# Install dependencies
npm install

# Run development server
npm run dev

# Run Tauri app
npm run tauri dev
```

### Building & QA

```bash
# Build for production
npm run build

# Lint (ESLint)
npm run lint

# Format (Prettier)
npm run format

# Build Tauri app
npm run tauri build
```

## Project Structure (key parts)

```
src/
├── components/
│   ├── background/AnimatedBackground.tsx
│   ├── canvas/WorkflowCanvas.tsx
│   ├── edges/ConditionalEdge.tsx
│   ├── layout/AgentLibrary.tsx
│   ├── layout/WorkflowLibrary.tsx
│   ├── nodes/AssistantAgentNode.tsx
│   └── nodes/UserProxyAgentNode.tsx
├── data/
│   ├── agents.ts
│   └── canvas.ts
├── services/
│   ├── api.ts
│   ├── persistence.ts
│   └── surreal.ts
└── store/
    ├── workflowStore.ts
    └── metricsStore.ts

src-tauri/
└── src/
    └── main.rs         # Tauri backend
```

## Development

This project was developed collaboratively with AI assistance and follows modern development practices including:

- Real-time event-driven architecture
- Comprehensive testing plans
- Detailed development logging
- Cross-platform compatibility

### GitHub Device Flow setup

To sign in with GitHub and use repo features (Hybrid/GitHub modes, Jules/Copilot gating), the frontend needs a GitHub OAuth App Client ID exposed as `VITE_GITHUB_CLIENT_ID`.

1) Create a GitHub OAuth App (if you don't have one). For local dev, the Homepage URL can be your repo URL and the Authorization callback can be any placeholder (device flow doesn't use it).
2) Add a `.env.local` file to the project root with:

```
VITE_GITHUB_CLIENT_ID=YOUR_OAUTH_APP_CLIENT_ID
```

3) Restart the dev server. In Settings or Create Project, click “Sign in with GitHub”. You'll be shown a code and link; complete the device flow in your browser. The access token is stored locally (Surreal `secret` table) and persists across restarts.

If this var is missing, the button may appear to do nothing due to the flow failing early.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details