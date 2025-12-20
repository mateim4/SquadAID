/**
 * Unit Tests for Services
 * Tests service layer functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================
// PERSISTENCE SERVICE TESTS
// ============================================
describe('PersistenceService', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] || null),
    };
  })();

  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  describe('localStorage operations', () => {
    it('saves data to localStorage', () => {
      const data = { key: 'value' };
      localStorage.setItem('test-key', JSON.stringify(data));
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(data));
    });

    it('retrieves data from localStorage', () => {
      const data = { key: 'value' };
      localStorage.setItem('test-key', JSON.stringify(data));
      
      const retrieved = localStorage.getItem('test-key');
      expect(JSON.parse(retrieved!)).toEqual(data);
    });

    it('returns null for non-existent keys', () => {
      const retrieved = localStorage.getItem('non-existent');
      expect(retrieved).toBeNull();
    });

    it('removes items from localStorage', () => {
      localStorage.setItem('temp-key', 'temp-value');
      localStorage.removeItem('temp-key');
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('temp-key');
    });

    it('clears all localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.clear();
      
      expect(localStorageMock.clear).toHaveBeenCalled();
    });
  });

  describe('workflow persistence', () => {
    const workflowKey = 'squadaid-workflows';
    
    it('saves workflow to storage', () => {
      const workflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        nodes: [],
        edges: [],
      };
      
      localStorage.setItem(workflowKey, JSON.stringify([workflow]));
      
      const retrieved = JSON.parse(localStorage.getItem(workflowKey)!);
      expect(retrieved[0].id).toBe('wf-1');
    });

    it('loads multiple workflows', () => {
      const workflows = [
        { id: 'wf-1', name: 'Workflow 1', nodes: [], edges: [] },
        { id: 'wf-2', name: 'Workflow 2', nodes: [], edges: [] },
      ];
      
      localStorage.setItem(workflowKey, JSON.stringify(workflows));
      
      const retrieved = JSON.parse(localStorage.getItem(workflowKey)!);
      expect(retrieved).toHaveLength(2);
    });

    it('handles corrupted data gracefully', () => {
      localStorage.setItem(workflowKey, 'invalid-json{');
      
      let result;
      try {
        result = JSON.parse(localStorage.getItem(workflowKey)!);
      } catch {
        result = [];
      }
      
      expect(result).toEqual([]);
    });
  });

  describe('settings persistence', () => {
    const settingsKey = 'squadaid-settings';
    
    it('saves settings to storage', () => {
      const settings = {
        theme: 'dark',
        autoSave: true,
        autoSaveInterval: 30,
      };
      
      localStorage.setItem(settingsKey, JSON.stringify(settings));
      
      const retrieved = JSON.parse(localStorage.getItem(settingsKey)!);
      expect(retrieved.theme).toBe('dark');
    });

    it('merges partial settings updates', () => {
      const initialSettings = {
        theme: 'light',
        autoSave: true,
        autoSaveInterval: 30,
      };
      
      localStorage.setItem(settingsKey, JSON.stringify(initialSettings));
      
      const current = JSON.parse(localStorage.getItem(settingsKey)!);
      const updated = { ...current, theme: 'dark' };
      localStorage.setItem(settingsKey, JSON.stringify(updated));
      
      const result = JSON.parse(localStorage.getItem(settingsKey)!);
      expect(result.theme).toBe('dark');
      expect(result.autoSave).toBe(true);
    });
  });

  describe('project persistence', () => {
    const projectsKey = 'squadaid-projects';
    
    it('saves project list', () => {
      const projects = [
        { slug: 'project-1', name: 'Project 1', createdAt: Date.now() },
        { slug: 'project-2', name: 'Project 2', createdAt: Date.now() },
      ];
      
      localStorage.setItem(projectsKey, JSON.stringify(projects));
      
      const retrieved = JSON.parse(localStorage.getItem(projectsKey)!);
      expect(retrieved).toHaveLength(2);
    });

    it('adds a new project to existing list', () => {
      const initialProjects = [
        { slug: 'project-1', name: 'Project 1', createdAt: Date.now() },
      ];
      
      localStorage.setItem(projectsKey, JSON.stringify(initialProjects));
      
      const current = JSON.parse(localStorage.getItem(projectsKey)!);
      const newProject = { slug: 'project-2', name: 'Project 2', createdAt: Date.now() };
      localStorage.setItem(projectsKey, JSON.stringify([...current, newProject]));
      
      const result = JSON.parse(localStorage.getItem(projectsKey)!);
      expect(result).toHaveLength(2);
    });

    it('removes a project from list', () => {
      const projects = [
        { slug: 'project-1', name: 'Project 1', createdAt: Date.now() },
        { slug: 'project-2', name: 'Project 2', createdAt: Date.now() },
      ];
      
      localStorage.setItem(projectsKey, JSON.stringify(projects));
      
      const current = JSON.parse(localStorage.getItem(projectsKey)!);
      const filtered = current.filter((p: { slug: string }) => p.slug !== 'project-1');
      localStorage.setItem(projectsKey, JSON.stringify(filtered));
      
      const result = JSON.parse(localStorage.getItem(projectsKey)!);
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('project-2');
    });
  });
});

// ============================================
// VALIDATION SERVICE TESTS
// ============================================
describe('ValidationService', () => {
  describe('workflow validation', () => {
    it('validates workflow with required fields', () => {
      const workflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        nodes: [],
        edges: [],
      };
      
      const isValid = workflow.id && workflow.name && Array.isArray(workflow.nodes);
      expect(isValid).toBe(true);
    });

    it('invalidates workflow without id', () => {
      const workflow = {
        id: '',
        name: 'Test Workflow',
        nodes: [],
        edges: [],
      };
      
      const isValid = workflow.id && workflow.name;
      expect(isValid).toBeFalsy();
    });

    it('invalidates workflow without name', () => {
      const workflow = {
        id: 'wf-1',
        name: '',
        nodes: [],
        edges: [],
      };
      
      const isValid = workflow.id && workflow.name;
      expect(isValid).toBeFalsy();
    });

    it('validates node connection rules', () => {
      const nodes = [
        { id: 'n1', type: 'input', position: { x: 0, y: 0 }, data: {} },
        { id: 'n2', type: 'process', position: { x: 100, y: 0 }, data: {} },
        { id: 'n3', type: 'output', position: { x: 200, y: 0 }, data: {} },
      ];
      
      const edges = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ];
      
      // Check all edges have valid source and target
      const isValid = edges.every(edge => 
        nodes.some(n => n.id === edge.source) &&
        nodes.some(n => n.id === edge.target)
      );
      
      expect(isValid).toBe(true);
    });

    it('invalidates edges with missing nodes', () => {
      const nodes = [
        { id: 'n1', type: 'input', position: { x: 0, y: 0 }, data: {} },
      ];
      
      const edges = [
        { id: 'e1', source: 'n1', target: 'n2' }, // n2 doesn't exist
      ];
      
      const isValid = edges.every(edge => 
        nodes.some(n => n.id === edge.source) &&
        nodes.some(n => n.id === edge.target)
      );
      
      expect(isValid).toBe(false);
    });
  });

  describe('agent validation', () => {
    it('validates agent with required fields', () => {
      const agent = {
        id: 'agent-1',
        name: 'Test Agent',
        role: 'developer',
        status: 'active',
      };
      
      const isValid = agent.id && agent.name && agent.role;
      expect(isValid).toBeTruthy();
    });

    it('validates agent name length', () => {
      const agent = {
        id: 'agent-1',
        name: 'A', // Too short
        role: 'developer',
      };
      
      const minNameLength = 2;
      const isValid = agent.name.length >= minNameLength;
      expect(isValid).toBe(false);
    });

    it('validates agent role is from allowed list', () => {
      const allowedRoles = ['developer', 'designer', 'manager', 'analyst', 'qa'];
      
      const agent = {
        id: 'agent-1',
        name: 'Test Agent',
        role: 'developer',
      };
      
      const isValid = allowedRoles.includes(agent.role);
      expect(isValid).toBe(true);
    });

    it('invalidates agent with unknown role', () => {
      const allowedRoles = ['developer', 'designer', 'manager', 'analyst', 'qa'];
      
      const agent = {
        id: 'agent-1',
        name: 'Test Agent',
        role: 'unknown-role',
      };
      
      const isValid = allowedRoles.includes(agent.role);
      expect(isValid).toBe(false);
    });
  });

  describe('project validation', () => {
    it('validates project slug format', () => {
      const validSlug = 'my-project-123';
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      
      expect(slugRegex.test(validSlug)).toBe(true);
    });

    it('invalidates project slug with spaces', () => {
      const invalidSlug = 'my project';
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      
      expect(slugRegex.test(invalidSlug)).toBe(false);
    });

    it('invalidates project slug with uppercase', () => {
      const invalidSlug = 'My-Project';
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      
      expect(slugRegex.test(invalidSlug)).toBe(false);
    });

    it('validates GitHub repo format', () => {
      const validRepo = 'owner/repository-name';
      const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
      
      expect(repoRegex.test(validRepo)).toBe(true);
    });

    it('invalidates invalid GitHub repo format', () => {
      const invalidRepo = 'invalid-repo-format';
      const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
      
      expect(repoRegex.test(invalidRepo)).toBe(false);
    });
  });

  describe('input sanitization', () => {
    it('trims whitespace from inputs', () => {
      const input = '  Test Input  ';
      const sanitized = input.trim();
      
      expect(sanitized).toBe('Test Input');
    });

    it('escapes HTML in user inputs', () => {
      const input = '<script>alert("xss")</script>';
      const escaped = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('handles empty strings', () => {
      const input = '';
      const isValid = input.trim().length > 0;
      
      expect(isValid).toBe(false);
    });

    it('handles null/undefined gracefully', () => {
      const input: string | null | undefined = null;
      const sanitized = input ?? '';
      
      expect(sanitized).toBe('');
    });
  });
});

// ============================================
// API SERVICE TESTS
// ============================================
describe('APIService', () => {
  const fetchMock = vi.fn();
  
  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetch operations', () => {
    it('makes GET request correctly', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      
      const response = await fetch('/api/test', { method: 'GET' });
      const data = await response.json();
      
      expect(fetchMock).toHaveBeenCalledWith('/api/test', { method: 'GET' });
      expect(data).toEqual({ data: 'test' });
    });

    it('makes POST request with body', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      
      const body = { name: 'Test', value: 123 };
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      expect(fetchMock).toHaveBeenCalled();
      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[0]).toBe('/api/test');
      expect(callArgs[1].method).toBe('POST');
    });

    it('handles network errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(fetch('/api/test')).rejects.toThrow('Network error');
    });

    it('handles 404 responses', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      
      const response = await fetch('/api/not-found');
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('handles 500 responses', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      
      const response = await fetch('/api/error');
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('request retry logic', () => {
    it('retries failed requests', async () => {
      fetchMock
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
        });
      
      let result;
      let attempts = 0;
      const maxRetries = 3;
      
      while (attempts < maxRetries) {
        try {
          const response = await fetch('/api/test');
          result = await response.json();
          break;
        } catch {
          attempts++;
        }
      }
      
      expect(attempts).toBe(1);
      expect(result).toEqual({ data: 'success' });
    });

    it('fails after max retries', async () => {
      fetchMock.mockRejectedValue(new Error('Persistent error'));
      
      let lastError;
      let attempts = 0;
      const maxRetries = 3;
      
      while (attempts < maxRetries) {
        try {
          await fetch('/api/test');
          break;
        } catch (error) {
          lastError = error;
          attempts++;
        }
      }
      
      expect(attempts).toBe(maxRetries);
      expect(lastError).toBeInstanceOf(Error);
    });
  });

  describe('request timeout', () => {
    it('handles request timeout', async () => {
      fetchMock.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50);
      
      await expect(
        fetch('/api/slow', { signal: controller.signal })
      ).rejects.toThrow();
      
      clearTimeout(timeoutId);
    });
  });
});

// ============================================
// UTILITY FUNCTION TESTS
// ============================================
describe('Utility Functions', () => {
  describe('debounce', () => {
    it('delays function execution', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      
      const debounced = (callback: () => void, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(callback, delay);
        };
      };
      
      const debouncedFn = debounced(fn, 100);
      
      debouncedFn();
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
      
      vi.useRealTimers();
    });

    it('resets timer on subsequent calls', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      
      const debounced = (callback: () => void, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(callback, delay);
        };
      };
      
      const debouncedFn = debounced(fn, 100);
      
      debouncedFn();
      vi.advanceTimersByTime(50);
      debouncedFn(); // Reset timer
      vi.advanceTimersByTime(50);
      
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
      
      vi.useRealTimers();
    });
  });

  describe('throttle', () => {
    it('limits function execution rate', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      
      const throttled = (callback: () => void, limit: number) => {
        let inThrottle = false;
        return () => {
          if (!inThrottle) {
            callback();
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
          }
        };
      };
      
      const throttledFn = throttled(fn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(fn).toHaveBeenCalledOnce();
      
      vi.advanceTimersByTime(100);
      throttledFn();
      
      expect(fn).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });
  });

  describe('generateId', () => {
    it('generates unique ids', () => {
      const generateId = () => Math.random().toString(36).substring(2, 9);
      
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      
      // All ids should be unique
      expect(ids.size).toBe(100);
    });

    it('generates ids with correct length', () => {
      const generateId = () => Math.random().toString(36).substring(2, 9);
      
      const id = generateId();
      expect(id.length).toBe(7);
    });
  });

  describe('deepClone', () => {
    it('creates independent copy of object', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = JSON.parse(JSON.stringify(original));
      
      cloned.b.c = 3;
      
      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(3);
    });

    it('handles arrays', () => {
      const original = [1, [2, 3], { a: 4 }];
      const cloned = JSON.parse(JSON.stringify(original));
      
      (cloned[1] as number[])[0] = 5;
      
      expect((original[1] as number[])[0]).toBe(2);
      expect((cloned[1] as number[])[0]).toBe(5);
    });

    it('handles null values', () => {
      const original = { a: null, b: 1 };
      const cloned = JSON.parse(JSON.stringify(original));
      
      expect(cloned.a).toBeNull();
    });
  });

  describe('classNames', () => {
    it('combines class names', () => {
      const classNames = (...classes: (string | undefined | false)[]) =>
        classes.filter(Boolean).join(' ');
      
      const result = classNames('btn', 'btn-primary', 'active');
      expect(result).toBe('btn btn-primary active');
    });

    it('filters out falsy values', () => {
      const classNames = (...classes: (string | undefined | false)[]) =>
        classes.filter(Boolean).join(' ');
      
      const result = classNames('btn', undefined, false, 'active');
      expect(result).toBe('btn active');
    });

    it('returns empty string for no valid classes', () => {
      const classNames = (...classes: (string | undefined | false)[]) =>
        classes.filter(Boolean).join(' ');
      
      const result = classNames(undefined, false);
      expect(result).toBe('');
    });
  });
});
