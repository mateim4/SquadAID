import { create } from 'zustand';

export type View = 'builder' | 'playground' | 'settings';

interface NavigationState {
  currentView: View;
  navigateTo: (view: View) => void;
}

/**
 * A Zustand store for managing the application's current view (routing).
 * This replaces react-router-dom for simpler desktop app navigation.
 */
export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: 'builder', // Default view
  navigateTo: (view) => set({ currentView: view }),
}));