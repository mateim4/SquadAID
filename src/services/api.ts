// API Service for connecting to the Gradio backend
// Use Vite env for production check; allow overriding base via VITE_API_BASE
const isProd = import.meta.env.PROD;
const API_BASE = (import.meta.env.VITE_API_BASE as string) || (isProd ? '/api' : 'http://localhost:7861');

export interface WorkflowExecutionRequest {
  nodes: any[];
  edges: any[];
  config?: Record<string, any>;
}

export interface AgentResponse {
  agent: string;
  message: string;
  data?: any;
  error?: string;
}

class APIService {
  private sessionHash: string;

  constructor() {
    this.sessionHash = Math.random().toString(36).substring(2);
  }

  // Initialize session with the backend
  async initializeSession(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/config`);
      if (response.ok) {
  const config = await response.json();
  console.warn('Backend initialized:', config.title || 'TeamAID Multi-Agent System');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize backend session:', error);
      return false;
    }
  }

  // Execute a workflow with the Gradio backend
  async executeWorkflow(request: WorkflowExecutionRequest): Promise<AgentResponse> {
    try {
      const response = await fetch(`${API_BASE}/gradio_api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fn_index: 0, // Main workflow execution function
          data: [JSON.stringify(request)],
          session_hash: this.sessionHash,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        agent: 'system',
        message: 'Workflow executed successfully',
        data: result.data,
      };
    } catch (error) {
      console.error('Workflow execution failed:', error);
      return {
        agent: 'system',
        message: 'Workflow execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Call a specific Gradio function by index
  private async callGradioFunction(fn_index: number, data: any[]): Promise<any> {
    const response = await fetch(`${API_BASE}/gradio_api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fn_index, data, session_hash: this.sessionHash }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gradio API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Test agent functionality
  async testAgent(agentType: string, input: string): Promise<AgentResponse> {
    try {
      const fnIndex = this.getAgentFunctionIndex(agentType);
      const result = await this.callGradioFunction(fnIndex, [input]);
      
      return {
        agent: agentType,
        message: result.data?.[0] || 'Agent executed successfully',
        data: result.data,
      };
    } catch (error) {
      return {
        agent: agentType,
        message: `Agent ${agentType} failed`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Map agent types to Gradio function indices
  private getAgentFunctionIndex(agentType: string): number {
    const agentMap: Record<string, number> = {
      'architect': 1,
      'qwen_qa': 2,
      'copilot_bridge': 3,
      'jules_bridge': 4,
  'claude_bridge': 5,
  'ollama_bridge': 6,
  'msty_bridge': 7,
      'workflow': 0,
    };
    return agentMap[agentType] || 0;
  }

  // Check backend health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/config`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get available agents from backend
  async getAvailableAgents(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/config`);
      if (response.ok) {
        const config = await response.json();
        // Extract agent names from the config if available
        if (config.dependencies) {
          return config.dependencies
            .filter((dep: any) => dep.trigger === 'load')
            .map((dep: any) => dep.id);
        }
      }
      // Fallback to known agents
  return ['architect', 'qwen_qa', 'copilot_bridge', 'jules_bridge', 'claude_bridge', 'ollama_bridge', 'msty_bridge'];
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const apiService = new APIService();

// Export types
export type { APIService };