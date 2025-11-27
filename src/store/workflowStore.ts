import { create } from 'zustand';
import { Edge, Node, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, Connection, addEdge, Viewport } from 'reactflow';
import { initialNodes, initialConnections } from '@/data/canvas';
import { CanvasNode as CustomCanvasNode } from '@/types';
import { agents } from '@/data/agents';
import { Cube24Regular } from '@fluentui/react-icons';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setFlow: (nodes: Node[], edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;
  // selection & editing
  selectedNodeId?: string;
  setSelectedNodeId: (id?: string) => void;
  updateSelectedNodeLabel: (label: string) => void;
  updateNodeData: (id: string, partial: Record<string, any>) => void;
  updateEdgeData: (id: string, partial: Record<string, any>) => void;
  removeNode: (id: string) => void;
  removeNodes: (ids: string[]) => void;
}

const agentMap = new Map(agents.map(a => [a.id, a]));

const getNodeTypeForAgent = (agentId: string): 'custom' | 'assistantAgent' | 'userProxyAgent' => {
  if (agentId === 'user-proxy') return 'userProxyAgent';
  const assistantLike = new Set([
    'assistant',
  'claude',
  'ollama',
  'copilot',
  'msty',
  'jules-coder',
  'custom',
    'group-manager',
    'product-manager',
    'planner',
    'coder',
  ]);
  if (assistantLike.has(agentId)) return 'assistantAgent';
  return 'custom';
};

const convertCanvasNodesToReactFlowNodes = (canvasNodes: CustomCanvasNode[]): Node[] => {
  return canvasNodes.map((n: CustomCanvasNode) => {
    const agent = agentMap.get(n.agentId);
    const type = getNodeTypeForAgent(n.agentId);
  const baseData: any = { label: agent?.name || 'Unknown', icon: agent?.Icon || Cube24Regular, agentId: n.agentId, expanded: false };
    const data =
      type === 'assistantAgent'
        ? { ...baseData, name: agent?.name || 'Assistant', systemMessage: '' }
        : type === 'userProxyAgent'
          ? { ...baseData, name: agent?.name || 'User', systemMessage: '' }
          : baseData;
  return {
      id: n.id,
      type,
      position: { x: n.position.x * 10, y: n.position.y * 10 },
  draggable: true,
  selectable: true,
      data,
    };
  });
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: convertCanvasNodesToReactFlowNodes(initialNodes),
  edges: initialConnections.map((c, i) => ({
    id: `e${c.from}-${c.to}-${i}`,
    source: c.from,
    target: c.to,
    type: 'conditional',
    animated: true,
  })),
  viewport: { x: 0, y: 0, zoom: 1 },
  onNodesChange: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  onConnect: (connection) => set((state) => ({ edges: addEdge({ ...connection, type: 'conditional', animated: true }, state.edges) })),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setFlow: (nodes, edges) => set({ nodes, edges }),
  setViewport: (viewport) => set({ viewport }),
  selectedNodeId: undefined,
  setSelectedNodeId: (id) => set((state) => (state.selectedNodeId === id ? state : { selectedNodeId: id })),
  updateSelectedNodeLabel: (label) => {
    const { selectedNodeId, nodes } = get();
    if (!selectedNodeId) return;
    const updated = nodes.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, label } } : n);
    set({ nodes: updated });
  },
  updateNodeData: (id, partial) => {
    const { nodes } = get();
    const updated = nodes.map(n => (n.id === id ? { ...n, data: { ...n.data, ...partial } } : n));
    set({ nodes: updated });
  },
  updateEdgeData: (id, partial) => {
    const { edges } = get();
    const updated = edges.map(e => (e.id === id ? { ...e, data: { ...(e as any).data, ...partial } } : e));
    set({ edges: updated });
  },
  removeNode: (id) => {
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter(n => n.id !== id),
      edges: edges.filter(e => e.source !== id && e.target !== id),
    });
  },
  removeNodes: (ids) => {
    const idSet = new Set(ids);
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter(n => !idSet.has(n.id)),
      edges: edges.filter(e => !idSet.has(e.source) && !idSet.has(e.target)),
    });
  },
}));
