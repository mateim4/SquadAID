/**
 * Unit Tests for Zustand Stores
 * Tests state management logic in isolation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWorkflowStore } from '@/store/workflowStore';
import { useProjectStore } from '@/store/projectStore';

// ============================================
// WORKFLOW STORE TESTS
// ============================================
describe('useWorkflowStore', () => {
  describe('nodes', () => {
    it('initializes with some nodes from initial data', () => {
      const { nodes } = useWorkflowStore.getState();
      // The store initializes with converted canvas nodes
      expect(Array.isArray(nodes)).toBe(true);
    });

    it('sets nodes array correctly', () => {
      const { setNodes } = useWorkflowStore.getState();
      const testNodes = [
        { id: 'n1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Test' } },
        { id: 'n2', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'Test 2' } },
      ];
      
      setNodes(testNodes as any);
      
      const { nodes } = useWorkflowStore.getState();
      expect(nodes).toHaveLength(2);
      expect(nodes[0].id).toBe('n1');
    });

    it('removes a node correctly', () => {
      const { setNodes, removeNode } = useWorkflowStore.getState();
      
      setNodes([
        { id: 'node-1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Test' } },
        { id: 'node-2', type: 'custom', position: { x: 100, y: 0 }, data: { label: 'Test 2' } },
      ] as any);
      
      removeNode('node-1');
      
      const { nodes } = useWorkflowStore.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('node-2');
    });

    it('updates node data correctly', () => {
      const { setNodes, updateNodeData } = useWorkflowStore.getState();
      
      setNodes([
        { id: 'node-1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Original' } },
      ] as any);
      
      updateNodeData('node-1', { label: 'Updated' });
      
      const { nodes } = useWorkflowStore.getState();
      expect(nodes[0].data.label).toBe('Updated');
    });
  });

  describe('edges', () => {
    it('initializes with some edges from initial connections', () => {
      const { edges } = useWorkflowStore.getState();
      expect(Array.isArray(edges)).toBe(true);
    });

    it('sets edges correctly', () => {
      const { setEdges } = useWorkflowStore.getState();
      
      setEdges([
        { id: 'e1', source: 'n1', target: 'n2' },
      ] as any);
      
      const { edges } = useWorkflowStore.getState();
      expect(edges).toHaveLength(1);
    });
  });

  describe('selection', () => {
    it('sets selected node id', () => {
      const { setSelectedNodeId } = useWorkflowStore.getState();
      
      setSelectedNodeId('node-1');
      
      const { selectedNodeId } = useWorkflowStore.getState();
      expect(selectedNodeId).toBe('node-1');
    });

    it('clears selected node id', () => {
      const { setSelectedNodeId } = useWorkflowStore.getState();
      
      setSelectedNodeId('node-1');
      setSelectedNodeId(undefined);
      
      const { selectedNodeId } = useWorkflowStore.getState();
      expect(selectedNodeId).toBeUndefined();
    });
  });

  describe('viewport', () => {
    it('initializes with default viewport', () => {
      const { viewport } = useWorkflowStore.getState();
      expect(viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('sets viewport correctly', () => {
      const { setViewport } = useWorkflowStore.getState();
      
      setViewport({ x: 100, y: 200, zoom: 1.5 });
      
      const { viewport } = useWorkflowStore.getState();
      expect(viewport).toEqual({ x: 100, y: 200, zoom: 1.5 });
    });
  });

  describe('updateSelectedNodeLabel', () => {
    it('updates the label of the selected node', () => {
      const { setNodes, setSelectedNodeId, updateSelectedNodeLabel } = useWorkflowStore.getState();
      
      setNodes([
        { id: 'node-1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Original' } },
      ] as any);
      
      setSelectedNodeId('node-1');
      updateSelectedNodeLabel('New Label');
      
      const { nodes } = useWorkflowStore.getState();
      expect(nodes[0].data.label).toBe('New Label');
    });
  });

  describe('setFlow', () => {
    it('sets both nodes and edges at once', () => {
      const { setFlow } = useWorkflowStore.getState();
      
      const newNodes = [{ id: 'flow-1', type: 'custom', position: { x: 0, y: 0 }, data: {} }];
      const newEdges = [{ id: 'e-flow', source: 'a', target: 'b' }];
      
      setFlow(newNodes as any, newEdges as any);
      
      const { nodes, edges } = useWorkflowStore.getState();
      expect(nodes[0].id).toBe('flow-1');
      expect(edges[0].id).toBe('e-flow');
    });
  });
});

// ============================================
// PROJECT STORE TESTS
// ============================================
describe('useProjectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({
      slug: undefined,
      mode: undefined,
      repo: undefined,
    });
  });

  it('initializes with undefined values', () => {
    const { slug, mode, repo } = useProjectStore.getState();
    expect(slug).toBeUndefined();
    expect(mode).toBeUndefined();
    expect(repo).toBeUndefined();
  });

  it('sets project info correctly', () => {
    const { setProjectInfo } = useProjectStore.getState();
    
    setProjectInfo({
      slug: 'my-project',
      mode: 'local',
      repo: undefined,
    });
    
    const { slug, mode, repo } = useProjectStore.getState();
    expect(slug).toBe('my-project');
    expect(mode).toBe('local');
    expect(repo).toBeUndefined();
  });

  it('updates project info with github repo', () => {
    const { setProjectInfo } = useProjectStore.getState();
    
    setProjectInfo({
      slug: 'gh-project',
      mode: 'github',
      repo: 'owner/repo',
    });
    
    const { slug, mode, repo } = useProjectStore.getState();
    expect(slug).toBe('gh-project');
    expect(mode).toBe('github');
    expect(repo).toBe('owner/repo');
  });

  it('clears project info', () => {
    const { setProjectInfo } = useProjectStore.getState();
    
    setProjectInfo({
      slug: 'project',
      mode: 'local',
      repo: undefined,
    });
    
    setProjectInfo({
      slug: undefined,
      mode: undefined,
      repo: undefined,
    });
    
    const { slug, mode, repo } = useProjectStore.getState();
    expect(slug).toBeUndefined();
    expect(mode).toBeUndefined();
    expect(repo).toBeUndefined();
  });
});
