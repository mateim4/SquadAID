import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { apiService, AgentResponse } from '../services/api';

export interface WorkflowExecutionState {
  isExecuting: boolean;
  progress: number;
  currentNode: string | null;
  results: AgentResponse[];
  error: string | null;
}

export const useWorkflowExecution = () => {
  const [state, setState] = useState<WorkflowExecutionState>({
    isExecuting: false,
    progress: 0,
    currentNode: null,
    results: [],
    error: null,
  });

  const executeWorkflow = useCallback(async (nodes: Node[], edges: Edge[]) => {
    setState({
      isExecuting: true,
      progress: 0,
      currentNode: null,
      results: [],
      error: null,
    });

    try {
      // Initialize session if needed
      const initialized = await apiService.initializeSession();
      if (!initialized) {
        throw new Error('Failed to connect to backend');
      }

      // Prepare workflow data
      const workflowRequest = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          data: node.data,
          position: node.position,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      };

      // Execute workflow
      const response = await apiService.executeWorkflow(workflowRequest);
      
      setState(prev => ({
        ...prev,
        isExecuting: false,
        progress: 100,
        results: [...prev.results, response],
        error: response.error || null,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Workflow execution failed';
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const testNode = useCallback(async (node: Node) => {
    setState(prev => ({
      ...prev,
      isExecuting: true,
      currentNode: node.id,
    }));

    try {
      const agentType = node.data.agentType || node.type;
      const input = node.data.input || 'Test input';
      
      const response = await apiService.testAgent(agentType, input);
      
      setState(prev => ({
        ...prev,
        isExecuting: false,
        currentNode: null,
        results: [...prev.results, response],
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Node test failed';
      setState(prev => ({
        ...prev,
        isExecuting: false,
        currentNode: null,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isExecuting: false,
      progress: 0,
      currentNode: null,
      results: [],
      error: null,
    });
  }, []);

  return {
    ...state,
    executeWorkflow,
    testNode,
    reset,
  };
};