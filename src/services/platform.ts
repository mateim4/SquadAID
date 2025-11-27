/** Simple helpers for environment-specific checks */

export const isTauri = (): boolean => {
  try {
  const w: any = window as any;
  return typeof w.__TAURI_IPC__ === 'function';
  } catch {
    return false;
  }
};
