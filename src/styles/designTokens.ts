/**
 * @file designTokens.ts
 * @description Centralized design tokens for consistent styling across the application.
 * Includes icon sizes, breakpoints, status colors, and spacing scales.
 */

import { tokens } from '@fluentui/react-components';

// =============================================================================
// LAYOUT TOKENS
// =============================================================================

/** Sidebar width for desktop layouts */
export const SIDEBAR_WIDTH = '340px';

/** Standard breakpoints for responsive design */
export const breakpoints = {
  /** Mobile devices (up to 640px) */
  mobile: '640px',
  /** Tablet devices (up to 1024px) */
  tablet: '1024px',
  /** Desktop devices (1025px and up) */
  desktop: '1025px',
} as const;

/** Media query helpers */
export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.mobile})`,
  tablet: `(max-width: ${breakpoints.tablet})`,
  desktop: `(min-width: ${breakpoints.desktop})`,
  /** Touch devices */
  touch: '(hover: none) and (pointer: coarse)',
} as const;

// =============================================================================
// ICON SIZE SCALE
// =============================================================================

/** Standardized icon sizes */
export const iconSizes = {
  /** Extra small icons (12px) - inline indicators */
  xs: 12,
  /** Small icons (16px) - compact UI */
  sm: 16,
  /** Medium icons (20px) - default for most UI */
  md: 20,
  /** Large icons (24px) - primary actions */
  lg: 24,
  /** Extra large icons (32px) - feature highlights */
  xl: 32,
  /** 2x large (48px) - empty states */
  '2xl': 48,
  /** 3x large (64px) - hero sections */
  '3xl': 64,
} as const;

// =============================================================================
// STATUS COLORS
// =============================================================================

/** Semantic status colors for consistent feedback */
export const statusColors = {
  /** Success states */
  success: {
    background: tokens.colorPaletteGreenBackground3,
    foreground: tokens.colorPaletteGreenForeground1,
    border: tokens.colorPaletteGreenBorder1,
  },
  /** Warning states */
  warning: {
    background: tokens.colorPaletteYellowBackground3,
    foreground: tokens.colorPaletteYellowForeground1,
    border: tokens.colorPaletteYellowBorder1,
  },
  /** Error states */
  error: {
    background: tokens.colorPaletteRedBackground3,
    foreground: tokens.colorPaletteRedForeground1,
    border: tokens.colorPaletteRedBorder1,
  },
  /** Info states */
  info: {
    background: tokens.colorPaletteBlueBorderActive,
    foreground: tokens.colorPaletteBlueForeground2,
    border: tokens.colorPaletteBlueBorderActive,
  },
  /** Neutral/inactive states */
  neutral: {
    background: tokens.colorNeutralBackground4,
    foreground: tokens.colorNeutralForeground3,
    border: tokens.colorNeutralStroke2,
  },
} as const;

// =============================================================================
// AGENT STATUS COLORS
// =============================================================================

/** Agent-specific status colors */
export const agentStatusColors = {
  idle: statusColors.neutral.background,
  active: statusColors.success.background,
  busy: statusColors.warning.background,
  error: statusColors.error.background,
  connecting: tokens.colorPaletteDarkOrangeBorder2,
  paused: tokens.colorNeutralForeground3,
} as const;

// =============================================================================
// SPACING SCALE
// =============================================================================

/** Consistent spacing values */
export const spacing = {
  /** 4px */
  xs: tokens.spacingVerticalXS,
  /** 8px */
  sm: tokens.spacingVerticalS,
  /** 12px */
  md: tokens.spacingVerticalM,
  /** 16px */
  lg: tokens.spacingVerticalL,
  /** 24px */
  xl: tokens.spacingVerticalXL,
  /** 32px */
  '2xl': tokens.spacingVerticalXXL,
} as const;

// =============================================================================
// TOUCH TARGETS
// =============================================================================

/** Minimum touch target sizes for accessibility */
export const touchTargets = {
  /** Minimum size for interactive elements (44px per WCAG) */
  minimum: '44px',
  /** Comfortable touch target (48px) */
  comfortable: '48px',
  /** Large touch target (56px) */
  large: '56px',
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

/** Z-index layering system */
export const zIndex = {
  /** Background elements */
  background: -1,
  /** Default layer */
  base: 0,
  /** Elevated content (cards, panels) */
  elevated: 10,
  /** Sticky elements (headers, sidebars) */
  sticky: 100,
  /** Overlays (drawers, sheets) */
  overlay: 200,
  /** Modal dialogs */
  modal: 300,
  /** Popovers, tooltips */
  popover: 400,
  /** Toast notifications */
  toast: 500,
} as const;

// =============================================================================
// NODE DIMENSIONS
// =============================================================================

/** Standardized dimensions for workflow nodes */
export const nodeDimensions = {
  /** Standard node width */
  width: 320,
  /** Minimum node height */
  minHeight: 100,
  /** Collapsed node height */
  collapsedHeight: 60,
} as const;

// =============================================================================
// ANIMATION DURATIONS
// =============================================================================

/** Standard animation durations */
export const durations = {
  /** Fast transitions (100ms) */
  fast: '100ms',
  /** Normal transitions (200ms) */
  normal: '200ms',
  /** Slow transitions (300ms) */
  slow: '300ms',
  /** Very slow transitions (500ms) */
  slower: '500ms',
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

/** Standardized border radius values */
export const radii = {
  /** Small radius (4px) */
  sm: tokens.borderRadiusSmall,
  /** Medium radius (8px) */
  md: tokens.borderRadiusMedium,
  /** Large radius (12px) */
  lg: tokens.borderRadiusLarge,
  /** Extra large radius (16px) */
  xl: tokens.borderRadiusXLarge,
  /** Circular/pill shape */
  full: tokens.borderRadiusCircular,
} as const;
