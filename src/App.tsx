import { HashRouter, Route, Routes } from 'react-router-dom';
import { FluentProvider } from '@fluentui/react-components';
import { useThemeStore } from './store/theme';
import Shell from './components/Shell';
import BuilderPage from './pages/BuilderPage';
import PlaygroundPage from './pages/PlaygroundPage';
import SettingsPage from './pages/SettingsPage';

/**
 * The root component of the application.
 * It sets up the theme provider, router, and defines the application's routes.
 */
function App() {
  const { theme } = useThemeStore();

  return (
    <FluentProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<BuilderPage />} />
            <Route path="builder" element={<BuilderPage />} />
            <Route path="playground" element={<PlaygroundPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </FluentProvider>
  );
}

export default App;