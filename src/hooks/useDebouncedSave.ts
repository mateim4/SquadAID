import { useEffect, useRef } from 'react';
import useFlowStore from '../store/flow';

/**
 * A custom hook that automatically saves the workflow to the backend
 * with a debounce when changes are detected in the flow state.
 */
export const useDebouncedSave = () => {
  const { nodes, edges, viewport } = useFlowStore();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear the previous timeout if there are new changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to save the data
    timeoutRef.current = window.setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        const graphState = { nodes, edges, viewport };
        
        console.log('Debounced save triggered. Saving workflow...', graphState);
        
        // Use the saveFlow method from the store
        useFlowStore.getState().saveFlow();
      }
    }, 1000); // 1-second debounce delay

    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, viewport]); // This effect runs whenever nodes, edges, or viewport changes
};