import { create } from 'zustand';
import { webLightTheme, webDarkTheme, Theme, createLightTheme, createDarkTheme, BrandVariants } from '@fluentui/react-components';

const purpleBrand: BrandVariants = {
  10: "#1a0f2e",
  20: "#2d1b4e", 
  30: "#432874",
  40: "#5a359a",
  50: "#7044c0",
  60: "#8454e6",
  70: "#9c6bff",
  80: "#b684ff",
  90: "#d1a3ff",
  100: "#e8c5ff",
  110: "#f3deff",
  120: "#fbf0ff",
  130: "#fdf7ff",
  140: "#fefbff",
  150: "#fffeff",
  160: "#ffffff"
};

const customLightTheme = createLightTheme(purpleBrand);
const customDarkTheme = createDarkTheme(purpleBrand);

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
  theme: customLightTheme,
  themeName: 'light',
  toggleTheme: () =>
    set((state) => {
      const newThemeName = state.themeName === 'light' ? 'dark' : 'light';
      return {
        theme: newThemeName === 'light' ? customLightTheme : customDarkTheme,
        themeName: newThemeName,
      };
    }),
}));