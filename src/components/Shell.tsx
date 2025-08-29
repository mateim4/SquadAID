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
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '48px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRight(
      '1px',
      'solid',
      tokens.colorNeutralStroke2,
    ),
    ...shorthands.padding(tokens.spacingVerticalS, 0),
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    color: tokens.colorNeutralForeground2,
    '&:hover': {
      color: tokens.colorNeutralForeground1,
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    '&.active': {
      color: tokens.colorBrandForeground1,
      '&::before': {
        content: '""',
        position: 'absolute',
        left: '0',
        width: '3px',
        height: '24px',
        backgroundColor: tokens.colorBrandBackground,
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
      },
    },
  },
  spacer: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    ...shorthands.padding(tokens.spacingHorizontalM),
    overflowY: 'auto',
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
          title={themeName === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        />
      </nav>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default Shell;