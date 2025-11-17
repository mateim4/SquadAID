import { create } from 'zustand';

export enum View {
  Builder = 'builder',
  Playground = 'playground',
  Settings = 'settings',
  Projects = 'projects',
}

interface NavigationState {
  view: View;
  setView: (view: View) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  view: View.Builder,
  setView: (view) => set({ view }),
}));