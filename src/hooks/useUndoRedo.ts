import { useCallback, useRef, useState } from 'react';
import { Node, Edge } from 'reactflow';

export interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export interface UseUndoRedoOptions {
  /** Maximum number of history states to keep */
  maxHistory?: number;
}

export interface UseUndoRedoResult {
  /** Push current state to history */
  pushHistory: (state: HistoryState) => void;
  /** Undo to previous state, returns the state or null if can't undo */
  undo: () => HistoryState | null;
  /** Redo to next state, returns the state or null if can't redo */
  redo: () => HistoryState | null;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Clear all history */
  clearHistory: () => void;
}

/**
 * Hook for managing undo/redo history for workflow canvas.
 * Maintains a stack of node/edge states for undo/redo operations.
 * 
 * @example
 * const { pushHistory, undo, redo, canUndo, canRedo } = useUndoRedo();
 * 
 * // Save state before making changes
 * pushHistory({ nodes, edges });
 * 
 * // Undo/redo
 * const prevState = undo();
 * if (prevState) {
 *   setNodes(prevState.nodes);
 *   setEdges(prevState.edges);
 * }
 */
export function useUndoRedo(options: UseUndoRedoOptions = {}): UseUndoRedoResult {
  const { maxHistory = 50 } = options;
  
  // Use refs to avoid re-renders on history changes
  const historyRef = useRef<HistoryState[]>([]);
  const currentIndexRef = useRef<number>(-1);
  
  // Track state for canUndo/canRedo
  const [, forceUpdate] = useState({});
  
  const pushHistory = useCallback((state: HistoryState) => {
    // Remove any future states if we're not at the end
    if (currentIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    }
    
    // Add new state
    historyRef.current.push({
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
    });
    
    // Trim history if it exceeds max
    if (historyRef.current.length > maxHistory) {
      historyRef.current = historyRef.current.slice(-maxHistory);
    }
    
    currentIndexRef.current = historyRef.current.length - 1;
    forceUpdate({});
  }, [maxHistory]);
  
  const undo = useCallback((): HistoryState | null => {
    if (currentIndexRef.current <= 0) {
      return null;
    }
    
    currentIndexRef.current -= 1;
    forceUpdate({});
    
    return historyRef.current[currentIndexRef.current];
  }, []);
  
  const redo = useCallback((): HistoryState | null => {
    if (currentIndexRef.current >= historyRef.current.length - 1) {
      return null;
    }
    
    currentIndexRef.current += 1;
    forceUpdate({});
    
    return historyRef.current[currentIndexRef.current];
  }, []);
  
  const clearHistory = useCallback(() => {
    historyRef.current = [];
    currentIndexRef.current = -1;
    forceUpdate({});
  }, []);
  
  return {
    pushHistory,
    undo,
    redo,
    canUndo: currentIndexRef.current > 0,
    canRedo: currentIndexRef.current < historyRef.current.length - 1,
    clearHistory,
  };
}

export default useUndoRedo;
