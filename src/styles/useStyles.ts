import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { SIDEBAR_WIDTH } from './designSystem';

export const rainbowGradient = 'linear-gradient(90deg, #f44336, #ff9800, #ffeb3b, #4caf50, #2196f3, #3f51b5, #9c27b0)';

export const useStyles = makeStyles({
  // --- Background Animations ---
  fall: {
    animationName: {
      to: { transform: 'translateY(120vh)' },
    },
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  moveFog: {
    animationName: {
      '0%': { transform: 'translateX(-30%) scale(1)', opacity: 0 },
      '25%': { opacity: 1 },
      '75%': { opacity: 1 },
      '100%': { transform: 'translateX(100%) translateY(10%) scale(1.2)', opacity: 0 },
    },
     animationTimingFunction: 'linear',
     animationIterationCount: 'infinite',
  },
  fallAsteroidLeft: {
     animationName: {
        '0%': { transform: 'translate(0, 0) rotate(var(--angle))', opacity: 1 },
        '100%': { transform: 'translate(120vw, 120vh) rotate(var(--angle))', opacity: 0 },
     },
     animationTimingFunction: 'linear',
     animationIterationCount: 'infinite',
  },
  fallAsteroidRight: {
     animationName: {
        '0%': { transform: 'translate(0, 0) rotate(var(--angle))', opacity: 1 },
        '100%': { transform: 'translate(-120vw, 120vh) rotate(var(--angle))', opacity: 0 },
     },
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
  },
  fallAsteroidTop: {
      animationName: {
        '0%': { transform: 'translate(0, 0) rotate(var(--angle))', opacity: 1 },
        '100%': { transform: 'translate(var(--translateX), 120vh) rotate(var(--angle))', opacity: 0 },
      },
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
  },
  rainbowContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150vmax',
    height: '150vmax',
    opacity: 0,
    zIndex: 2,
    animationName: {
        from: { opacity: 0, transform: 'translateX(-50%) scale(0.8)' },
        to: { opacity: 0.9, transform: 'translateX(-50%) scale(1)' },
    },
    animationDuration: '5s',
    animationTimingFunction: 'ease-in-out',
    animationDelay: '3s',
    animationFillMode: 'forwards',
  },
  rainbowSecondaryContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200vmax', // Larger to appear further away
    height: '200vmax',
    opacity: 0,
    zIndex: 1, // Behind the main rainbow
    animationName: {
        '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.7)' },
        '10%': { opacity: 0.3, transform: 'translate(-50%, -50%) scale(0.8)' },
        '20%': { opacity: 0 },
        '100%': { opacity: 0 },
    },
    animationDuration: '60s', // Appears rarely
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationDelay: '15s',
  },
  rainbow: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    filter: 'blur(15px)',
    background: 'radial-gradient(circle, transparent 59%, rgba(255, 179, 186, 0.75) 60.5%, rgba(255, 223, 186, 0.75) 62%, rgba(255, 255, 186, 0.75) 63.5%, rgba(186, 255, 201, 0.75) 65%, rgba(186, 225, 255, 0.75) 66.5%, rgba(204, 186, 255, 0.75) 68%, rgba(230, 186, 255, 0.75) 69.5%, transparent 71%)',
    animationName: {
        '0%': { transform: 'skewY(-2deg) translateY(5vh)', opacity: 0.8 },
        '30%': { transform: 'skewY(3deg) translateY(-10vh)', opacity: 0.3 },
        '60%': { transform: 'skewY(-3deg) translateY(10vh)', opacity: 1.0 },
        '80%': { transform: 'skewY(1deg) translateY(-15vh)', opacity: 0.6 },
        '100%': { transform: 'skewY(-2deg) translateY(5vh)', opacity: 0.8 },
    },
    animationDuration: '48s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
    animationDelay: '3s',
  },
  strokeDraw: {
    animationName: {
      from: { strokeDashoffset: '1000' },
      to: { strokeDashoffset: '0' },
    },
    animationDuration: '1s',
    animationFillMode: 'forwards',
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    maxHeight: '100vh',
    maxWidth: '100vw',
    color: tokens.colorNeutralForeground1,
    transition: 'background-image 0.8s ease-in-out',
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  rootDark: {
    backgroundColor: '#2c3e50',
    backgroundImage: 'linear-gradient(to bottom, #34495e, #2c3e50)',
  },
  rootLight: {
    backgroundColor: '#a1c4fd',
    backgroundImage: 'linear-gradient(to bottom, #a1c4fd, #c2e9fb)',
  },
  mainUI: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    maxHeight: '100vh',
    maxWidth: '100vw',
    overflow: 'hidden',
    backdropFilter: 'blur(1px)', // Slight blur to separate UI from background
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('10px', 'clamp(12px, 3vw, 28px)'),
    minHeight: '68px',
    // background color set via mode-specific classes
    flexShrink: 0,
    position: 'relative',
    flexWrap: 'wrap',
    gap: '8px',
    '@media (max-width: 700px)': {
      minHeight: '56px',
      ...shorthands.padding('8px', '12px'),
    },
     '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '0',
      right: '0',
      height: '1px',
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
  },
  headerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(10px)',
  },
  headerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    '@media (max-width: 700px)': {
      '& span': {
        display: 'none', // Hide title text on mobile, keep icon
      },
    },
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  tab: {
  fontSize: '16px',
  lineHeight: '22px',
  ...shorthands.padding('6px', '14px'),
  '@media (max-width: 700px)': {
    fontSize: '14px',
    ...shorthands.padding('6px', '8px'),
    '& span': {
      display: 'none', // Hide tab text on mobile, show only icons
    },
  },
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
    },
    '&[aria-selected="true"]::after': {
      content: '""',
      position: 'absolute',
      bottom: '-1px',
      left: '10%', right: '10%',
      height: '3px',
      background: rainbowGradient,
      ...shorthands.borderRadius(tokens.borderRadiusMedium),
    },
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: `minmax(280px, ${SIDEBAR_WIDTH}) 1fr minmax(280px, ${SIDEBAR_WIDTH})`,
    flexGrow: 1,
    minHeight: 0,
  // Clip horizontally but allow vertical scrolling for pages that exceed viewport height
  overflowX: 'hidden',
  overflowY: 'auto',
    ...shorthands.gap('16px'),
    ...shorthands.padding('16px'),
    maxWidth: '100%',
    '@media (max-width: 1000px)': {
      gridTemplateColumns: '1fr',
      gridAutoRows: 'auto',
    },
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: SIDEBAR_WIDTH,
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    transition: 'width 0.3s ease, opacity 0.3s ease',
    ...shorthands.overflow('hidden'),
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(20px)',
    '@media (max-width: 1000px)': {
      maxWidth: '100%',
      width: '100%',
    },
  },
  sidebarCollapsed: {
    width: '52px',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('12px', '16px'),
    flexShrink: 0,
  },
  sidebarContent: {
    flexGrow: 1,
    overflowY: 'auto',
    opacity: 1,
    transition: 'opacity 0.2s ease',
    ...shorthands.padding('0', '16px', '16px', '16px'),
  },
  sidebarContentCollapsed: {
    opacity: 0,
    pointerEvents: 'none',
  },
  pageRow: {
    display: 'grid',
    gridTemplateColumns: `minmax(280px, ${SIDEBAR_WIDTH}) calc(100% - (2 * ${SIDEBAR_WIDTH}) - 32px) minmax(280px, ${SIDEBAR_WIDTH})`,
    ...shorthands.gap('16px'),
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    '@media (max-width: 1200px)': {
      gridTemplateColumns: `minmax(280px, ${SIDEBAR_WIDTH}) 1fr`,
    },
    '@media (max-width: 700px)': {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('0'),
    },
  },
  pageContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
    ...shorthands.padding('8px'),
    backgroundColor: 'transparent',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
  // Ensure center content never pushes out sidebars
  minWidth: 0,
  maxWidth: '100%',
  width: '100%',
  overflow: 'hidden',
  },
  projectsStickyFilters: {
    display: 'none',
    '@media (max-width: 700px)': {
      display: 'block',
      position: 'sticky',
      top: 0,
      zIndex: 2,
    },
  },
  listItemContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('16px'),
    ...shorthands.padding('12px'),
    cursor: 'grab',
    transition: 'all 0.2s ease',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
      transform: 'scale(1.02)',
      boxShadow: tokens.shadow8,
    },
    marginBottom: '8px',
  },
  workflowItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    ...shorthands.gap('8px'),
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    marginBottom: '8px',
  },
  workflowItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  canvas: {
    position: 'relative',
    flexGrow: 1,
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground3,
    backgroundImage: `
      radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    ...shorthands.overflow('hidden'),
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backdropFilter: 'blur(20px)',
    '@media (max-width: 700px)': {
      backdropFilter: 'blur(10px)',
    },
  },
  canvasNode: {
    position: 'absolute',
    cursor: 'grab',
    userSelect: 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    width: '200px',
    backgroundColor: tokens.colorNeutralBackground3,
    boxShadow: tokens.shadow4,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backdropFilter: 'blur(20px)',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.03)',
      boxShadow: tokens.shadow16,
    },
    '&:active': {
      cursor: 'grabbing',
      transform: 'scale(0.98)',
    },
  },
  canvasNodeSelected: {
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    boxShadow: tokens.shadow16,
  },
  emptyCanvas: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    ...shorthands.gap('16px'),
    color: tokens.colorNeutralForeground2,
  },
  connectorSvg: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none',
    overflow: 'visible',
  },
  connectorLine: {
    stroke: "url(#line-gradient)",
    strokeWidth: '2.5px',
    strokeDasharray: 1000,
    animationDuration: '1s',
    animationFillMode: 'forwards',
    animationTimingFunction: 'ease-out',
  },
  connectorArrow: {
    fill: 'url(#line-gradient)',
  },
  placeholderView: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: tokens.colorNeutralForeground2,
  },
  // --- Frosted Buttons ---
  frostedButtonWide: {
    width: '100%',
    justifyContent: 'center',
    // Glass background: cool, translucent, with subtle tint
    backgroundColor: 'var(--glass-bg)',
    backgroundImage: 'linear-gradient(135deg, var(--glass-tint), transparent 60%), radial-gradient(120% 100% at 0% 0%, rgba(255,255,255,0.22), transparent 45%)',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.28)'),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backdropFilter: 'blur(16px) saturate(120%)',
    WebkitBackdropFilter: 'blur(16px) saturate(120%)',
    boxShadow: '0 8px 24px rgba(0, 30, 60, 0.18)',
    color: tokens.colorNeutralForeground1,
    fontWeight: 600,
    transition: 'transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
    '&:hover': {
      backgroundColor: 'var(--glass-hover-bg)',
      boxShadow: '0 10px 28px rgba(0, 30, 60, 0.22)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      backgroundColor: 'var(--glass-press-bg)',
      transform: 'translateY(0)',
      boxShadow: '0 4px 12px rgba(0, 30, 60, 0.24)',
    },
    '&:focus-visible': {
      outline: 'none',
      // Subtle glassy glow instead of outline
      boxShadow: '0 0 0 1px rgba(255,255,255,0.22), 0 8px 24px rgba(0, 30, 60, 0.22)',
    },
  },
  // --- Frosted Card/Surface (e.g., Dialog surface) ---
  frostedCard: {
    // Glass look consistent with design system variables
    backgroundColor: 'var(--glass-bg)',
    backgroundImage: 'linear-gradient(135deg, var(--glass-tint), transparent 60%), radial-gradient(120% 100% at 0% 0%, rgba(255,255,255,0.18), transparent 45%)',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.26)'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backdropFilter: 'blur(18px) saturate(120%)',
    WebkitBackdropFilter: 'blur(18px) saturate(120%)',
    boxShadow: '0 16px 40px rgba(0, 30, 60, 0.30)',
    color: tokens.colorNeutralForeground1,
  },
  // --- Frosted Input ---
  frostedInput: {
    width: '100%',
    backgroundColor: 'var(--glass-bg)',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.28)'),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backdropFilter: 'blur(14px) saturate(120%)',
    WebkitBackdropFilter: 'blur(14px) saturate(120%)',
    boxShadow: '0 6px 20px rgba(0, 30, 60, 0.16)',
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
    '&:hover': {
      backgroundColor: 'var(--glass-hover-bg)',
    },
    '&:focus-within': {
      backgroundColor: 'var(--glass-hover-bg)',
      boxShadow: '0 10px 28px rgba(0, 30, 60, 0.22)',
      ...shorthands.borderColor('rgba(255,255,255,0.4)'),
    },
    '& input': {
      backgroundColor: 'transparent',
      color: tokens.colorNeutralForeground1,
    },
    '& input::placeholder': {
      color: tokens.colorNeutralForeground3,
      opacity: 0.9,
    },
  },
  // Gradient confirm button with 30% opacity over glass
  confirmButton: {
    backgroundImage: 'linear-gradient(90deg, rgba(var(--confirm-grad-1) / var(--confirm-grad-opacity)), rgba(var(--confirm-grad-2) / var(--confirm-grad-opacity)), rgba(var(--confirm-grad-3) / var(--confirm-grad-opacity)))',
    color: tokens.colorNeutralForeground1,
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.28)'),
    backdropFilter: 'blur(10px) saturate(120%)',
    WebkitBackdropFilter: 'blur(10px) saturate(120%)',
    boxShadow: '0 8px 22px rgba(0, 30, 60, 0.20)',
    fontWeight: 600,
    '&:hover': {
      filter: 'brightness(1.05)',
    },
    '&:active': {
      filter: 'brightness(0.98)',
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.22), 0 8px 24px rgba(0, 30, 60, 0.22)',
    },
  },
});
