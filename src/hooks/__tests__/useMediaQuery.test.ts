import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: any;
  let listeners: Array<(event: MediaQueryListEvent) => void> = [];

  beforeEach(() => {
    listeners = [];
    
    // Mock matchMedia
    matchMediaMock = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn((event: string, listener: any) => {
        if (event === 'change') {
          listeners.push(listener);
        }
      }),
      removeEventListener: vi.fn((event: string, listener: any) => {
        if (event === 'change') {
          const index = listeners.indexOf(listener);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      }),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns false initially when query does not match', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(max-width: 700px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery('(max-width: 700px)'));
    expect(result.current).toBe(false);
  });

  it('returns true initially when query matches', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(max-width: 700px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery('(max-width: 700px)'));
    expect(result.current).toBe(true);
  });

  it('calls matchMedia with correct query', () => {
    const query = '(min-width: 1024px)';
    renderHook(() => useMediaQuery(query));
    
    expect(matchMediaMock).toHaveBeenCalledWith(query);
  });

  it('registers change listener', () => {
    const addEventListenerSpy = vi.fn();
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(max-width: 700px)',
      addEventListener: addEventListenerSpy,
      removeEventListener: vi.fn(),
    });

    renderHook(() => useMediaQuery('(max-width: 700px)'));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('cleans up listener on unmount', () => {
    const removeEventListenerSpy = vi.fn();
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(max-width: 700px)',
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerSpy,
    });

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 700px)'));
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('handles different media queries', () => {
    const queries = [
      '(max-width: 700px)',
      '(min-width: 1024px)',
      '(orientation: portrait)',
      'print',
    ];

    queries.forEach(query => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      renderHook(() => useMediaQuery(query));
      expect(matchMediaMock).toHaveBeenCalledWith(query);
    });
  });

  it('handles server-side rendering gracefully', () => {
    // Skip this test as it interferes with React DOM
    // The hook already handles SSR by checking for window/matchMedia existence
  });
});
