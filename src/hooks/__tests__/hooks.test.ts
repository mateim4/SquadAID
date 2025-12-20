/**
 * Unit Tests for Custom Hooks
 * Tests hooks in isolation with proper React testing patterns
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';

// ============================================
// useUndoRedo HOOK TESTS
// ============================================
describe('useUndoRedo', () => {
  it('initializes with empty history', () => {
    const { result } = renderHook(() => useUndoRedo());
    
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('pushHistory adds state to history', () => {
    const { result } = renderHook(() => useUndoRedo());
    
    act(() => {
      result.current.pushHistory({ nodes: [{ id: '1' }], edges: [] });
    });
    
    // After first push, still can't undo (need 2 states)
    expect(result.current.canUndo).toBe(false);
    
    act(() => {
      result.current.pushHistory({ nodes: [{ id: '1' }, { id: '2' }], edges: [] });
    });
    
    expect(result.current.canUndo).toBe(true);
  });

  it('undo moves back in history', () => {
    const { result } = renderHook(() => useUndoRedo());
    
    act(() => {
      result.current.pushHistory({ nodes: [{ id: '1' }], edges: [] });
      result.current.pushHistory({ nodes: [{ id: '1' }, { id: '2' }], edges: [] });
    });
    
    expect(result.current.canUndo).toBe(true);
    
    act(() => {
      const undoneState = result.current.undo();
      expect(undoneState?.nodes).toHaveLength(1);
    });
    
    expect(result.current.canRedo).toBe(true);
  });

  it('redo moves forward in history', () => {
    const { result } = renderHook(() => useUndoRedo());
    
    act(() => {
      result.current.pushHistory({ nodes: [{ id: '1' }], edges: [] });
      result.current.pushHistory({ nodes: [{ id: '1' }, { id: '2' }], edges: [] });
    });
    
    act(() => {
      result.current.undo();
    });
    
    expect(result.current.canRedo).toBe(true);
    
    act(() => {
      const redoneState = result.current.redo();
      expect(redoneState?.nodes).toHaveLength(2);
    });
  });

  it('clears redo stack when new state is pushed after undo', () => {
    const { result } = renderHook(() => useUndoRedo());
    
    act(() => {
      result.current.pushHistory({ nodes: [{ id: '1' }], edges: [] });
      result.current.pushHistory({ nodes: [{ id: '2' }], edges: [] });
      result.current.pushHistory({ nodes: [{ id: '3' }], edges: [] });
    });
    
    act(() => {
      result.current.undo();
    });
    
    expect(result.current.canRedo).toBe(true);
    
    act(() => {
      result.current.pushHistory({ nodes: [{ id: '4' }], edges: [] });
    });
    
    expect(result.current.canRedo).toBe(false);
  });

  it('clearHistory resets all history', () => {
    const { result } = renderHook(() => useUndoRedo());
    
    act(() => {
      result.current.pushHistory({ nodes: [{ id: '1' }] as any, edges: [] });
      result.current.pushHistory({ nodes: [{ id: '2' }] as any, edges: [] });
    });
    
    act(() => {
      result.current.clearHistory();
    });
    
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});

// ============================================
// useFocusTrap HOOK TESTS
// ============================================
describe('useFocusTrap', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <button id="btn2">Button 2</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns a containerRef', () => {
    const { result } = renderHook(() => useFocusTrap());
    
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull(); // Not attached yet
  });

  it('provides focusFirst function', () => {
    const { result } = renderHook(() => useFocusTrap());
    
    expect(typeof result.current.focusFirst).toBe('function');
  });

  it('provides getFocusableElements function', () => {
    const { result } = renderHook(() => useFocusTrap());
    
    expect(typeof result.current.getFocusableElements).toBe('function');
  });

  it('is inactive when isActive is false', () => {
    const { result } = renderHook(() => useFocusTrap({ isActive: false }));
    
    // Should still provide refs and functions
    expect(result.current.containerRef).toBeDefined();
  });
});

// ============================================
// useMediaQuery HOOK TESTS
// ============================================
describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width: 700px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when query matches', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 700px)'));
    
    expect(result.current).toBe(true);
  });

  it('returns false when query does not match', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 1200px)'));
    
    expect(result.current).toBe(false);
  });

  it('updates when media query changes', async () => {
    let listener: ((e: MediaQueryListEvent) => void) | null = null;
    
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') listener = cb;
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(max-width: 700px)'));
    
    expect(result.current).toBe(false);
    
    // Simulate media query change
    if (listener) {
      act(() => {
        listener!({ matches: true } as MediaQueryListEvent);
      });
    }
    
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});

// ============================================
// useDebouncedSave HOOK TESTS
// ============================================
describe('useDebouncedSave', () => {
  // Note: useDebouncedSave is a hook that automatically listens to flow store changes
  // and saves with debouncing. It doesn't return anything and doesn't take parameters.
  // These tests verify the hook can be instantiated without errors.
  
  it('can be instantiated without errors', () => {
    // The hook uses internal state and store - just verify it renders
    expect(() => {
      renderHook(() => useDebouncedSave());
    }).not.toThrow();
  });
});
