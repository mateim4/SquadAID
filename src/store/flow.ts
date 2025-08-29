import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  Viewport,
} from 'reactflow';
import { invoke } from '@tauri-apps/api/tauri';

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setFlow: (flow: { nodes: Node[]; edges: Edge[]; viewport: Viewport }) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  saveFlow: () => void;
}

const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },

  setFlow: (flow) => {
    set({
      nodes: flow.nodes,
      edges: flow.edges,
      viewport: flow.viewport,
    });
  },

  /**
   * Action to add a new node to the canvas.
   * It takes a complete Node object and adds it to the existing nodes array.
   */
  addNode: (node: Node) => {
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  /**
   * Updates the data of a specific node by ID.
   * Creates a new object to trigger a re-render with proper immutable updates.
   */
  updateNodeData: (nodeId: string, data: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // It's important to create a new object to trigger a re-render
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },

  saveFlow: () => {
    const { nodes, edges, viewport } = get();
    const graphState = { nodes, edges, viewport };
    invoke('save_workflow', {
      id: 1,
      graphStateJson: JSON.stringify(graphState),
    }).catch(console.error);
  },
}));

export default useFlowStore;