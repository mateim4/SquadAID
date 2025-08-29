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
    backgroundColor: tokens.colorNeutralBackground1,
    fontFamily: tokens.fontFamilyBase,
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalXL),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    backdropFilter: 'blur(20px)',
    position: 'relative',
    zIndex: 100,
    boxShadow: tokens.shadow4,
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