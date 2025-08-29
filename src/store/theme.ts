import { create } from 'zustand';
import { webLightTheme, webDarkTheme, Theme } from '@fluentui/react-components';

/**
 * Represents the state of the theme store.
 */
interface ThemeState {
  /** The current theme object (either light or dark). */
  theme: Theme;
  /** A string identifier for the current theme ('light' or 'dark'). */
  themeName: 'light' | 'dark';
  /** Toggles the theme between light and dark modes. */
  toggleTheme: () => void;
}

/**
 * A Zustand store for managing the application's theme.
 *
 * This store holds the current theme state and provides an action to toggle
 * between light and dark themes.
 *
 * @example
 * const { theme, toggleTheme } = useThemeStore();
 */
export const useThemeStore = create<ThemeState>((set) => ({
  theme: webLightTheme,
  themeName: 'light',
  toggleTheme: () =>
    set((state) => {
      const newThemeName = state.themeName === 'light' ? 'dark' : 'light';
      return {
        theme: newThemeName === 'light' ? webLightTheme : webDarkTheme,
        themeName: newThemeName,
      };
    }),
}));