import { invoke } from '@tauri-apps/api/tauri';
import type { Edge, Node, Viewport } from 'reactflow';

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
}

export async function saveWorkflowToDb(id: number, graph: GraphState): Promise<{ ok: boolean; error?: string }> {
  try {
    const payload = { ...graph, viewport: graph.viewport || { x: 0, y: 0, zoom: 1 } };
    await invoke('save_workflow', { id, graphStateJson: JSON.stringify(payload) });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e) };
  }
}

export async function loadWorkflowFromDb(id: number): Promise<{ ok: boolean; graph?: GraphState; error?: string }> {
  try {
    const result = await invoke<any>('load_workflow', { id });
    // Result may be a JSON string or an object depending on backend; normalize
    const graph: GraphState = typeof result === 'string' ? JSON.parse(result) : result;
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      return { ok: false, error: 'Invalid graph payload' };
    }
    return { ok: true, graph };
  } catch (e: any) {
    return { ok: false, error: String(e) };
  }
}
