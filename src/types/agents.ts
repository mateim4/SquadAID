/**
 * Base interface for all agent types
 */
export interface BaseAgent {
  id: string;
  name: string;
  type: string;
}

/**
 * User proxy agent configuration
 */
export interface UserProxyAgent extends BaseAgent {
  type: 'UserProxyAgent';
  role?: string;
  description?: string;
  capabilities?: string[];
}

/**
 * Claude agent configuration for Anthropic's Claude API
 */
export interface ClaudeAgent extends BaseAgent {
  type: 'ClaudeAgent';
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  capabilities: string[];
}

/**
 * Local Ollama agent configuration
 */
export interface LocalOllamaAgent extends BaseAgent {
  type: 'LocalOllamaAgent';
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  capabilities: string[];
  modelName: string;
  ollamaEndpoint: string;
}

/**
 * Local MSTY agent configuration
 */
export interface LocalMSTYAgent extends BaseAgent {
  type: 'LocalMSTYAgent';
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  capabilities: string[];
  mstyEndpoint: string;
  modelName: string;
  contextLength: number;
  streamingEnabled: boolean;
}

/**
 * Jules coding agent configuration
 */
export interface JulesAgent extends BaseAgent {
  type: 'JulesAgent';
  role: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  secureVmEnabled: boolean;
  multiFileCapable: boolean;
}

/**
 * GitHub Copilot agent configuration
 */
export interface CopilotAgent extends BaseAgent {
  type: 'CopilotAgent';
  role: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  githubIntegration: boolean;
  autoAssignment: boolean;
  prAnalysis: boolean;
}

/**
 * Custom agent configuration
 */
export interface CustomAgent extends BaseAgent {
  type: 'CustomAgent';
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  capabilities: string[];
  tools: string[];
  workflow: string;
}

/**
 * A union type representing any possible agent configuration.
 * This provides type safety and discriminated unions for agent types.
 */
export type AgentConfig = 
  | UserProxyAgent
  | ClaudeAgent
  | LocalOllamaAgent
  | LocalMSTYAgent
  | JulesAgent
  | CopilotAgent
  | CustomAgent;

/**
 * Type guard to check if an agent is of a specific type
 */
export function isAgentOfType<T extends AgentConfig>(
  agent: AgentConfig,
  type: T['type']
): agent is T {
  return agent.type === type;
}

/**
 * Helper function to get default data for each agent type
 */
export function getDefaultAgentData(type: AgentConfig['type']): Partial<AgentConfig> {
  switch (type) {
    case 'ClaudeAgent':
      return {
        name: 'Claude Assistant',
        role: 'Assistant',
        description: 'Advanced reasoning and code generation',
        systemPrompt: 'You are a helpful AI assistant with advanced reasoning capabilities...',
        temperature: 0.7,
        capabilities: ['reasoning', 'coding', 'analysis', 'writing']
      };
    case 'LocalOllamaAgent':
      return {
        name: 'Local Ollama Agent',
        role: 'Local AI Assistant',
        description: 'Local AI agent powered by Ollama models',
        systemPrompt: 'You are a local AI assistant running on Ollama...',
        temperature: 0.7,
        capabilities: ['local-ai', 'offline-processing', 'privacy-focused', 'customizable'],
        modelName: 'qwen2.5-coder:32b',
        ollamaEndpoint: 'http://localhost:11434'
      };
    case 'LocalMSTYAgent':
      return {
        name: 'Local MSTY Agent',
        role: 'High-Performance Local AI',
        description: 'High-performance local AI agent powered by MSTY',
        systemPrompt: 'You are a high-performance local AI assistant with access to long context...',
        temperature: 0.7,
        capabilities: ['local-inference', 'high-performance', 'long-context', 'streaming'],
        mstyEndpoint: 'http://localhost:10000',
        modelName: 'llama-3.1-70b',
        contextLength: 32,
        streamingEnabled: true
      };
    case 'JulesAgent':
      return {
        name: 'Jules Coding Agent',
        role: 'Async Coding Assistant',
        description: 'Google-powered async coding agent with comprehensive implementation capabilities',
        systemPrompt: 'You are an async coding agent that can implement comprehensive multi-file solutions...',
        capabilities: ['async-coding', 'multi-file-implementation', 'comprehensive-solutions', 'github-integration'],
        secureVmEnabled: true,
        multiFileCapable: true
      };
    case 'CopilotAgent':
      return {
        name: 'GitHub Copilot Agent',
        role: 'Code Assistant',
        description: 'GitHub-integrated coding assistant with PR management',
        systemPrompt: 'You are a GitHub Copilot integration agent responsible for code completion and PR management...',
        capabilities: ['coding', 'github-integration', 'code-completion', 'pr-creation'],
        githubIntegration: true,
        autoAssignment: false,
        prAnalysis: true
      };
    case 'CustomAgent':
      return {
        name: 'Custom Agent',
        role: 'Specialist Agent',
        description: 'Custom agent with configurable capabilities and tools',
        systemPrompt: 'Define your custom agent\'s behavior and responsibilities...',
        temperature: 0.7,
        capabilities: ['custom-logic', 'flexible-processing'],
        tools: ['create_file', 'read_file', 'execute_bash', 'list_directory'],
        workflow: 'sequential'
      };
    case 'UserProxyAgent':
      return { 
        name: 'New User Proxy',
        role: 'Human Interface',
        description: 'Human user interface agent',
        capabilities: ['user-interaction', 'manual-oversight']
      };
    default:
      return { name: 'Unknown Agent' };
  }
}