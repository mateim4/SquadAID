/// <reference types="vite/client" />

// Augment the Window type for optional Tauri check used in web mode.
declare global {
  interface Window {
    __TAURI_IPC__?: unknown;
  }
}

export {};
