import React from 'react';
import {
  FluentProvider,
  Button,
  Tab,
  TabList,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import {
  WeatherSunny24Regular,
  WeatherMoon24Regular,
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
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
  },
  controls: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
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
          <TabList
            selectedValue={currentView}
            onTabSelect={(_, data) => navigateTo(data.value as View)}
          >
            <Tab value="builder">Builder</Tab>
            <Tab value="playground">Playground</Tab>
          </TabList>

          <div className={styles.controls}>
            <Button
              onClick={() => navigateTo('settings')}
              appearance="subtle"
            >
              Settings
            </Button>
            <Button 
              onClick={toggleTheme} 
              appearance="subtle"
              icon={themeName === 'light' ? <WeatherMoon24Regular /> : <WeatherSunny24Regular />}
            >
              {themeName === 'light' ? 'Dark' : 'Light'}
            </Button>
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