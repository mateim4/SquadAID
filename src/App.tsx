import React from 'react';
import {
  FluentProvider,
  Button,
  Tab,
  TabList,
  makeStyles,
  shorthands,
  tokens,
  Title2,
} from '@fluentui/react-components';
import {
  WeatherSunny24Filled,
  WeatherMoon24Filled,
  Settings24Regular,
  BotSparkle24Regular,
} from '@fluentui/react-icons';
import { useThemeStore } from './store/theme';
import { useNavigationStore, View } from './store/navigation';
import BuilderPage from './pages/BuilderPage';
import PlaygroundPage from './pages/PlaygroundPage';
import SettingsPage from './pages/SettingsPage';
import WeatherBackground from './components/WeatherBackground';
import './App.css';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: tokens.colorNeutralBackground1,
    fontFamily: tokens.fontFamilyBase,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `radial-gradient(circle at 30% 20%, ${tokens.colorBrandBackground}15 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${tokens.colorBrandBackground2}10 0%, transparent 50%), radial-gradient(circle at 60% 60%, ${tokens.colorBrandBackground3}08 0%, transparent 40%)`,
      pointerEvents: 'none',
      animation: 'gradientShift 30s ease-in-out infinite',
    },
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalXL),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    backdropFilter: 'blur(60px) saturate(200%)',
    WebkitBackdropFilter: 'blur(60px) saturate(200%)',
    position: 'relative',
    zIndex: 100,
    boxShadow: `0 0 0 0.5px ${tokens.colorNeutralStroke1}, 0 2px 8px ${tokens.colorNeutralShadowAmbient}, 0 8px 32px ${tokens.colorNeutralShadowKey}, inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.05)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: `linear-gradient(90deg, transparent 0%, ${tokens.colorBrandBackground}06 25%, ${tokens.colorBrandBackground}08 50%, ${tokens.colorBrandBackground}06 75%, transparent 100%)`,
      pointerEvents: 'none',
      opacity: 0.4,
    },
  },
  branding: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  brandIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '28px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    filter: `drop-shadow(0 2px 8px ${tokens.colorBrandShadowAmbient})`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '0px',
      height: '0px',
      background: `radial-gradient(circle, ${tokens.colorBrandBackground}20, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.5s ease-out',
      zIndex: -1,
    },
    '&:hover': {
      transform: 'scale(1.1) rotate(360deg)',
      filter: `drop-shadow(0 4px 16px ${tokens.colorBrandShadowKey})`,
      '&::before': {
        width: '60px',
        height: '60px',
      },
    },
  },
  brandTitle: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeHero700,
    lineHeight: tokens.lineHeightHero700,
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  themeButton: {
    minWidth: 'auto',
    width: '36px',
    height: '36px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '0px',
      height: '0px',
      background: `radial-gradient(circle, ${tokens.colorBrandBackground}30, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.4s ease-out',
      zIndex: -1,
    },
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: `0 4px 12px ${tokens.colorBrandShadowAmbient}`,
      '&::before': {
        width: '60px',
        height: '60px',
      },
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
  settingsButton: {
    minWidth: 'auto',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '0px',
      height: '0px',
      background: `radial-gradient(circle, ${tokens.colorBrandBackground}25, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.4s ease-out',
      zIndex: -1,
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 16px ${tokens.colorBrandShadowAmbient}`,
      '&::before': {
        width: '80px',
        height: '80px',
      },
    },
    '&:active': {
      transform: 'translateY(0px) scale(0.98)',
    },
  },
});

/**
 * A component to render the currently selected view.
 */
const CurrentView = () => {
  const { currentView } = useNavigationStore();

  switch (currentView) {
    case 'builder':
      return <BuilderPage />;
    case 'playground':
      return <PlaygroundPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <BuilderPage />;
  }
};

/**
 * The root component of the application.
 */
function App() {
  const { theme, themeName, toggleTheme } = useThemeStore();
  const { currentView, navigateTo } = useNavigationStore();
  const styles = useStyles();

  return (
    <FluentProvider theme={theme}>
      <WeatherBackground />
      <div className={styles.container}>
        <div className={styles.titleBar}>
          <div className={styles.branding}>
            <BotSparkle24Regular className={styles.brandIcon} />
            <Title2 className={styles.brandTitle}>SquladAID</Title2>
          </div>

          <div className={styles.navigation}>
            <TabList
              selectedValue={currentView}
              onTabSelect={(_, data) => navigateTo(data.value as View)}
              size="large"
            >
              <Tab value="builder">Builder</Tab>
              <Tab value="playground">Playground</Tab>
            </TabList>
          </div>

          <div className={styles.controls}>
            <Button
              onClick={() => navigateTo('settings')}
              appearance="subtle"
              icon={<Settings24Regular />}
              className={styles.settingsButton}
            >
              Settings
            </Button>
            <Button 
              onClick={toggleTheme} 
              appearance="subtle"
              icon={themeName === 'light' ? <WeatherMoon24Filled /> : <WeatherSunny24Filled />}
              className={styles.themeButton}
              title={themeName === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            />
          </div>
        </div>
        <div className={styles.contentArea}>
          <CurrentView />
        </div>
      </div>
    </FluentProvider>
  );
}

export default App;