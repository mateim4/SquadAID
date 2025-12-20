# Final Regression Testing Plan

**Goal:** This document provides a comprehensive set of tests to ensure all core features of the Agent Orchestrator Studio are functioning correctly. It should be used for regression testing after making any significant changes.

## Automated Test Coverage

### Unit Tests (Vitest)
Run with: `npm run test:unit`

#### Components
- **Palette Component** (`src/components/__tests__/Palette.test.tsx`)
  - Renders with proper ARIA labels
  - Shows agent and role tabs
  - Draggable items work correctly
  - Loading states display properly
  - Keyboard navigation support

- **AssistantAgentNode Component** (`src/components/__tests__/AssistantAgentNode.test.tsx`)
  - Renders name and instruction prompt fields

- **ConditionalEdge Component** (`src/components/__tests__/ConditionalEdge.test.tsx`)
  - Allows editing conditions
  - Persists changes via updateEdgeData

#### Hooks
- **useMediaQuery** (`src/hooks/__tests__/useMediaQuery.test.ts`)
  - Returns correct values based on media queries
  - Registers and cleans up event listeners
  - Handles different query types

#### Stores
- **ProjectStore** (`src/store/__tests__/projectStore.test.ts`)
  - Initializes with undefined values
  - Sets and updates project info
  - Clears project info
  - Handles different project modes
  - Manages repo information

### E2E Tests (Playwright)
Run with: `npm run test:e2e`

#### Projects Page Tests (`tests/projects-page.spec.ts`)
- **Create Project Dialog**
  - Opens when Add Project button is clicked
  - Closes when Cancel is clicked
  - Shows validation errors for empty fields
  - Auto-generates slug from project name
  - Allows manual slug editing with sanitization
  - Selects project type with radio buttons
  - Shows GitHub auth section for hybrid/GitHub projects
  - Enables Create button when required fields filled
  - Has accessible form labels and descriptions
  
- **Project List**
  - Displays projects sidebar
  - Shows Add Project button

#### UI/UX Tests (`tests/ui-ux.spec.ts`)
- Application loads with correct title
- Navigation sidebar works properly
- Theme toggle functions
- Agent palette is visible and functional
- Canvas is interactive
- Drag and drop functionality
- Responsive design on mobile
- Accessibility features
- Visual consistency and modern design
- Performance and loading states

#### Data Model Enhancement Tests (`tests/data-model-enhancement.spec.ts`)
- Role system tests
- Enhanced agent node tests
- Relationship edge tests
- Execution dashboard tests
- Navigation and page routing tests
- State persistence tests
- Provider configuration tests
- Error handling tests
- Accessibility tests
- Performance tests
- Responsive design tests

#### Fluent Design Validation Tests (`tests/fluent-design-validation.spec.ts`)
- Captures current design state
- Tests drag and drop interactions
- Analyzes color usage against Fluent 2 DS palette
- Validates acrylic materials
- Validates depth and layering

---

## Manual Testing Checklist

The following tests should be performed manually to ensure full coverage:

### Test Case 1: Application Integrity

**Goal:** Verify that the application starts and all UI components render correctly.
**Steps:**
1.  Run `npm run tauri dev`.
2.  **Confirm**: The application window appears without any build errors.
3.  **Confirm**: The UI displays a sidebar with "Builder" and "Play" icons, and the "Builder" view is shown by default.
4.  **Confirm**: The default "Researcher" node is visible on the canvas.

---

### Test Case 2: State Persistence

**Goal:** Verify that workflow changes are saved and loaded correctly across sessions.
**Steps:**
1.  In the "Builder" view, move the default node to a new position (e.g., top-right corner).
2.  Wait 2-3 seconds for the debounced save to trigger.
3.  Close the application completely.
4.  Restart the application (`npm run tauri dev`).
5.  **Confirm**: The node appears in the new position you moved it to, not the default position.

---

### Test Case 3: Dynamic Workflow Building

**Goal:** Verify that new nodes can be added, connected, and are persisted.
**Steps:**
1.  Drag a "User Proxy Agent" from the "Node Palette" onto the canvas.
2.  Drag an edge from the source handle of the "Researcher" node to the target handle of the "User Proxy Agent" node.
3.  Modify the names of the nodes by typing in their respective input fields.
4.  Close and restart the application.
5.  **Confirm**: Both nodes are present, their connection exists, and their modified names have been saved.

---

### Test Case 4: Workflow Execution and Real-time Logging

**Goal:** Verify that the playground can execute a workflow and stream logs correctly.
**Steps:**
1.  Ensure you have a valid, connected workflow from Test Case 3 (Start Node -> End Node).
2.  Navigate to the "Playground" view by clicking the "Play" icon.
3.  Click the "Run Workflow" button.
4.  **Confirm**: The button becomes disabled and displays "Running...".
5.  **Confirm**: The "Execution Log" populates with log messages for each node in the correct traversal order.
6.  **Confirm**: After the final log message appears, the "Run Workflow" button becomes enabled again.

---

### Test Case 5: Graph Structure Error Handling

**Goal:** Verify that the backend correctly handles invalid graph structures.
**Steps:**
1.  Navigate to the "Builder" view.
2.  Drag a new "Assistant Agent" onto the canvas but do not connect it to anything. The graph now has two "start nodes".
3.  Navigate to the "Playground" view and click "Run Workflow".
4.  **Confirm**: The "Execution Log" displays a frontend error message indicating that the workflow failed to start.
5.  **Confirm**: The error message contains the text: `Workflow must have exactly one start node... Found 2.`
6.  **Confirm**: The "Run Workflow" button is re-enabled after the error.