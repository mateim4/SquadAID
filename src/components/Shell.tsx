import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Button,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import {
  WeatherSunny24Regular,
  WeatherMoon24Regular,
  Edit24Regular,
  Play24Regular,
  Settings24Regular,
} from '@fluentui/react-icons';
import { useThemeStore } from '../store/theme';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: tokens.colorNeutralBackground1,
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '64px',
    backgroundColor: tokens.colorNeutralBackground2,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    ...shorthands.borderRight(
      '1px',
      'solid',
      tokens.colorNeutralStroke1,
    ),
    ...shorthands.padding(tokens.spacingVerticalM, 0),
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.12)',
    position: 'relative',
    zIndex: 100,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    color: tokens.colorNeutralForeground2,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.margin(tokens.spacingVerticalXS, 0),
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    '&:hover': {
      color: tokens.colorNeutralForeground1,
      backgroundColor: tokens.colorNeutralBackground1Hover,
      transform: 'scale(1.05)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    },
    '&.active': {
      color: tokens.colorBrandForeground1,
      backgroundColor: tokens.colorBrandBackground2,
      transform: 'scale(1.1)',
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}, 0 8px 24px rgba(0, 0, 0, 0.15)`,
      '&::after': {
        content: '""',
        position: 'absolute',
        left: '-12px',
        width: '3px',
        height: '20px',
        backgroundColor: tokens.colorBrandBackground,
        ...shorthands.borderRadius('0 2px 2px 0'),
        boxShadow: `0 0 8px ${tokens.colorBrandBackground}`,
      },
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
  spacer: {
    flexGrow: 1,
  },
  themeToggle: {
    width: '40px',
    height: '40px',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.margin(tokens.spacingVerticalS, 0),
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'scale(1.05) rotate(15deg)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
  content: {
    flexGrow: 1,
    backgroundColor: tokens.colorNeutralBackground1,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  contentInner: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    ...shorthands.padding(0),
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.colorNeutralStroke2} transparent`,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: tokens.colorNeutralStroke2,
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: tokens.colorNeutralStroke1,
      },
    },
  },
});

/**
 * The main application shell, including the sidebar navigation and content area.
 */
function Shell() {
  const styles = useStyles();
  const { themeName, toggleTheme } = useThemeStore();

  const navItems = [
    { path: '/builder', icon: <Edit24Regular />, label: 'Builder' },
    { path: '/playground', icon: <Play24Regular />, label: 'Playground' },
    { path: '/settings', icon: <Settings24Regular />, label: 'Settings' },
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.path}
            className={styles.navLink}
            title={item.label}
          >
            {item.icon}
          </NavLink>
        ))}
        <div className={styles.spacer} />
        <Button
          appearance="transparent"
          icon={
            themeName === 'light' ? (
              <WeatherMoon24Regular />
            ) : (
              <WeatherSunny24Regular />
            )
          }
          onClick={toggleTheme}
          className={styles.themeToggle}
          title={themeName === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        />
      </nav>
      <main className={styles.content}>
        <div className={styles.contentInner}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Shell;