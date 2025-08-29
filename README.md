# SquadAID - Agent Orchestrator Studio

A collaborative agent teaming platform built with React, TypeScript, and Tauri. SquladAID enables teams to orchestrate AI agents for complex workflows and real-time collaboration.

## Features

- **Visual Agent Orchestration**: Drag-and-drop interface for building agent workflows
- **Real-time Execution**: Live streaming of agent interactions and results
- **Multi-Agent Support**: Assistant agents and user proxy agents for diverse workflows
- **Cross-platform Desktop App**: Built with Tauri for native performance
- **Modern UI**: Fluent UI components with dark/light theme support

## Tech Stack

- **Frontend**: React 18, TypeScript, Fluent UI
- **Backend**: Rust (Tauri)
- **State Management**: Zustand
- **Routing**: React Router
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

### Building

```bash
# Build for production
npm run build

# Build Tauri app
npm run tauri build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── nodes/          # Agent node components
│   ├── Palette.tsx     # Component palette
│   └── Shell.tsx       # App shell
├── pages/              # Application pages
│   ├── BuilderPage.tsx # Workflow builder
│   ├── PlaygroundPage.tsx # Execution environment
│   └── SettingsPage.tsx # Configuration
└── store/              # State management
    ├── flow.ts         # Workflow state
    └── theme.ts        # Theme state

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details