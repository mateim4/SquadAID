import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '@/store/projectStore';
import { act, renderHook } from '@testing-library/react';

describe('ProjectStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useProjectStore());
    act(() => {
      result.current.clear();
    });
  });

  it('initializes with undefined values', () => {
    const { result } = renderHook(() => useProjectStore());
    
    expect(result.current.slug).toBeUndefined();
    expect(result.current.mode).toBeUndefined();
    expect(result.current.repo).toBeUndefined();
  });

  it('sets project info correctly', () => {
    const { result } = renderHook(() => useProjectStore());
    
    act(() => {
      result.current.setProjectInfo({
        slug: 'test-project',
        mode: 'local',
        repo: 'owner/repo',
      });
    });
    
    expect(result.current.slug).toBe('test-project');
    expect(result.current.mode).toBe('local');
    expect(result.current.repo).toBe('owner/repo');
  });

  it('updates project info partially', () => {
    const { result } = renderHook(() => useProjectStore());
    
    // Set initial info
    act(() => {
      result.current.setProjectInfo({
        slug: 'test-project',
        mode: 'local',
      });
    });
    
    // Update only mode - setProjectInfo spreads new values, preserving old ones
    act(() => {
      result.current.setProjectInfo({
        ...result.current,
        mode: 'hybrid',
      });
    });
    
    expect(result.current.mode).toBe('hybrid');
    expect(result.current.slug).toBe('test-project');
  });

  it('clears all project info', () => {
    const { result } = renderHook(() => useProjectStore());
    
    // Set some info
    act(() => {
      result.current.setProjectInfo({
        slug: 'test-project',
        mode: 'github',
        repo: 'owner/repo',
      });
    });
    
    // Clear it
    act(() => {
      result.current.clear();
    });
    
    expect(result.current.slug).toBeUndefined();
    expect(result.current.mode).toBeUndefined();
    expect(result.current.repo).toBeUndefined();
  });

  it('handles different project modes', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const modes: Array<'local' | 'github' | 'hybrid'> = ['local', 'github', 'hybrid'];
    
    modes.forEach(mode => {
      act(() => {
        result.current.setProjectInfo({ mode });
      });
      expect(result.current.mode).toBe(mode);
    });
  });

  it('handles repo in owner/name format', () => {
    const { result } = renderHook(() => useProjectStore());
    
    act(() => {
      result.current.setProjectInfo({
        repo: 'mateim4/SquadAID',
      });
    });
    
    expect(result.current.repo).toBe('mateim4/SquadAID');
  });
});
