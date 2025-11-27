/** Simple helpers for environment-specific checks */

// Detect Tauri by presence of __TAURI_IPC__ injected in window
export const isTauri = (): boolean => {
  try {
    // @ts-ignore - injected by Tauri runtime
    return typeof (window as any).__TAURI_IPC__ === 'function';
  } catch {
    return false;
  }
};
