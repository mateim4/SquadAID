/**
 * @file icons/index.ts
 * @description Centralized icon exports for consistent iconography throughout the app.
 * 
 * Icon Naming Convention:
 * - All icons use 24px size for consistency (except breadcrumbs which use 20px)
 * - Regular variant for default state, Filled for emphasis/active state
 * 
 * Icon Categories:
 * - Navigation: App navigation and routing
 * - Actions: User interactions (save, delete, play, etc.)
 * - Status: State indicators (success, warning, error, etc.)
 * - Content: Content types (document, code, agent, etc.)
 * - UI: Interface elements (chevrons, arrows, etc.)
 */

// ============================================
// NAVIGATION ICONS
// ============================================
export {
  // Main navigation tabs
  Briefcase24Regular as ProjectsIcon,           // Projects tab
  PeopleTeam24Regular as TeamBuilderIcon,       // Team Builder tab
  PlayCircle24Regular as PlaygroundIcon,        // Playground tab
  Cube24Regular as AnalyticsIcon,               // Analytics tab (also used as app logo)
  Settings24Regular as SettingsIcon,            // Settings tab
  
  // Theme toggle
  WeatherSunny24Regular as LightModeIcon,
  WeatherMoon24Regular as DarkModeIcon,
  
  // Breadcrumbs (smaller size)
  Home20Regular as HomeIcon,
  ChevronRight20Regular as BreadcrumbSeparatorIcon,
} from '@fluentui/react-icons';

// ============================================
// ACTION ICONS
// ============================================
export {
  // CRUD operations
  Add24Regular as AddIcon,
  Dismiss24Regular as CloseIcon,
  Dismiss24Regular as DeleteIcon,              // Alias for delete actions
  Save24Regular as SaveIcon,
  
  // Playback controls
  Play24Regular as PlayIcon,
  Pause24Regular as PauseIcon,
  Stop24Regular as StopIcon,
  ArrowClockwise24Regular as RestartIcon,
  ArrowClockwise24Regular as RefreshIcon,      // Alias for refresh
  ArrowSync24Regular as SyncIcon,
  
  // Undo/Redo
  ArrowUndo24Regular as UndoIcon,
  ArrowRedo24Regular as RedoIcon,
  
  // Zoom controls
  ZoomIn24Regular as ZoomInIcon,
  ZoomOut24Regular as ZoomOutIcon,
  ArrowReset24Regular as FitViewIcon,
  Map24Regular as MinimapIcon,
  
  // Navigation actions
  Next24Regular as NextIcon,
  Open24Regular as OpenExternalIcon,
  
  // Search & Filter
  Search24Regular as SearchIcon,
  Search24Filled as SearchFilledIcon,
  Filter24Regular as FilterIcon,
} from '@fluentui/react-icons';

// ============================================
// STATUS ICONS
// ============================================
export {
  // Success/Error states
  Checkmark24Regular as SuccessIcon,
  CheckmarkCircle24Regular as SuccessCircleIcon,
  Warning24Regular as WarningIcon,
  ErrorCircle24Regular as ErrorIcon,
  
  // Progress states
  Clock24Regular as PendingIcon,
  Clock24Regular as TimeIcon,                   // Alias for time display
  
  // Connection/Health
  Link24Regular as LinkedIcon,
} from '@fluentui/react-icons';

// ============================================
// CONTENT TYPE ICONS
// ============================================
export {
  // Agents & People
  PersonCircle24Regular as UserIcon,
  Person24Regular as PersonIcon,
  Person24Filled as PersonFilledIcon,
  Bot24Regular as BotIcon,
  People24Regular as TeamIcon,
  Group24Regular as GroupIcon,
  
  // Documents & Code
  DocumentText24Regular as DocumentIcon,
  DocumentBulletList24Regular as ListIcon,
  Code24Regular as CodeIcon,
  
  // Workflow & Structure
  Cube24Regular as NodeIcon,                    // Generic node
  Timeline24Regular as TimelineIcon,
  
  // Roles & Categories
  Building24Regular as BusinessIcon,
  DesignIdeas24Regular as DesignIcon,
  BrainCircuit24Regular as AiIcon,
  Briefcase24Regular as WorkIcon,
  Info24Regular as InfoIcon,
  Info16Regular as InfoSmallIcon,
  Sparkle24Regular as SparkleIcon,
  
  // Folders & Projects
  Folder24Regular as FolderIcon,
} from '@fluentui/react-icons';

// ============================================
// UI ELEMENT ICONS
// ============================================
export {
  // Expand/Collapse
  ChevronDown24Regular as ExpandIcon,
  ChevronUp24Regular as CollapseIcon,
  
  // Directional arrows
  ArrowRight24Regular as ArrowRightIcon,
  ArrowsBidirectional24Regular as BidirectionalIcon,
} from '@fluentui/react-icons';

// ============================================
// ICON SIZE CONSTANTS (from designTokens)
// ============================================
export const ICON_SIZES = {
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '28px',
  xxl: '32px',
} as const;

// ============================================
// ROLE CATEGORY ICON MAP
// For dynamic icon selection based on role category
// ============================================
import {
  Building24Regular,
  Code24Regular,
  CheckmarkCircle24Regular,
  People24Regular,
  Search24Filled,
  DesignIdeas24Regular,
  Briefcase24Regular,
  Info24Regular,
} from '@fluentui/react-icons';

export const ROLE_CATEGORY_ICONS = {
  Business: Building24Regular,
  Code: Code24Regular,
  CheckmarkCircle: CheckmarkCircle24Regular,
  People: People24Regular,
  Search: Search24Filled,
  DesignIdeas: DesignIdeas24Regular,
  Briefcase: Briefcase24Regular,
  Default: Info24Regular,
} as const;

export type RoleCategoryIconName = keyof typeof ROLE_CATEGORY_ICONS;

/**
 * Get icon component for a role category
 */
export function getRoleCategoryIcon(iconName?: string) {
  if (!iconName) return ROLE_CATEGORY_ICONS.Default;
  return ROLE_CATEGORY_ICONS[iconName as RoleCategoryIconName] || ROLE_CATEGORY_ICONS.Default;
}

// ============================================
// AGENT STATUS ICON MAP
// For dynamic icon selection based on agent status
// ============================================
import {
  Checkmark24Regular,
  Warning24Regular,
  Clock24Regular,
} from '@fluentui/react-icons';

export const AGENT_STATUS_ICONS = {
  idle: Clock24Regular,
  working: Clock24Regular,
  success: Checkmark24Regular,
  error: Warning24Regular,
  waiting: Clock24Regular,
} as const;

export type AgentStatusIconName = keyof typeof AGENT_STATUS_ICONS;

/**
 * Get icon component for agent status
 */
export function getAgentStatusIcon(status: string) {
  return AGENT_STATUS_ICONS[status as AgentStatusIconName] || AGENT_STATUS_ICONS.idle;
}
