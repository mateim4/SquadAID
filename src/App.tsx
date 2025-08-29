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

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #e8f2ff 100%)',
    fontFamily: tokens.fontFamilyBase,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)',
      pointerEvents: 'none',
    },
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalXL),
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    ...shorthands.borderBottom('1px', 'solid', 'rgba(0, 0, 0, 0.05)'),
    backdropFilter: 'blur(40px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
    position: 'relative',
    zIndex: 100,
    boxShadow: '0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 1px 3px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  branding: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  brandIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '28px',
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
  },
  settingsButton: {
    minWidth: 'auto',
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
      <div className={styles.container}>
        <div className={styles.titleBar}>
          <div className={styles.branding}>
            <BotSparkle24Regular className={styles.brandIcon} />
            <Title2 className={styles.brandTitle}>SquadAID</Title2>
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