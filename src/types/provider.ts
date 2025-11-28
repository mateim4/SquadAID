/**
 * @file provider.ts
 * @description Provider configuration types for AI agent connections.
 * Defines supported AI providers, connection modes, and configuration interfaces.
 */

/**
 * Supported AI provider types.
 * Each provider represents a different AI service or local execution method.
 */
export enum ProviderType {
  /** Local Ollama instance for running open-source models */
  OLLAMA = 'ollama',
  /** OpenAI API (GPT-4, GPT-3.5, etc.) */
  OPENAI = 'openai',
  /** Google Gemini API */
  GEMINI = 'gemini',
  /** Anthropic Claude API */
  CLAUDE = 'claude',
  /** OpenRouter API for accessing multiple providers */
  OPENROUTER = 'openrouter',
  /** Google Jules async coding agent */
  JULES = 'jules',
  /** GitHub Copilot async agent */
  COPILOT_ASYNC = 'copilot_async',
  /** Local CLI-based execution */
  LOCAL_CLI = 'local_cli',
  /** Custom provider (user-defined endpoint) */
  CUSTOM = 'custom',
}

/**
 * Agent execution mode.
 * Determines where and how the agent processes requests.
 */
export enum AgentMode {
  /** Runs entirely on local machine (Ollama, local CLI) */
  LOCAL = 'local',
  /** Runs via remote API (OpenAI, Claude, etc.) */
  REMOTE = 'remote',
  /** Combination of local and remote capabilities */
  HYBRID = 'hybrid',
}

/**
 * Connection configuration for an AI provider.
 * Contains all settings needed to establish and maintain a connection.
 */
export interface ConnectionConfig {
  /** The AI provider to use */
  provider: ProviderType;
  /** API key for authenticated providers */
  apiKey?: string;
  /** Custom endpoint URL (for self-hosted or custom providers) */
  endpoint?: string;
  /** Model identifier (e.g., "gpt-4", "llama2", "claude-3-opus") */
  modelName?: string;
  /** Temperature setting for response randomness (0.0 - 2.0) */
  temperature?: number;
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Local path for CLI-based agents */
  localPath?: string;
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Additional provider-specific options */
  options?: Record<string, unknown>;
}

/**
 * Default connection configurations per provider type.
 * Used as fallback when specific settings are not provided.
 */
export const DEFAULT_CONNECTION_CONFIGS: Partial<Record<ProviderType, Partial<ConnectionConfig>>> = {
  [ProviderType.OLLAMA]: {
    endpoint: 'http://localhost:11434',
    modelName: 'llama2',
    temperature: 0.7,
    maxTokens: 4096,
  },
  [ProviderType.OPENAI]: {
    endpoint: 'https://api.openai.com/v1',
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4096,
  },
  [ProviderType.GEMINI]: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    modelName: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 8192,
  },
  [ProviderType.CLAUDE]: {
    endpoint: 'https://api.anthropic.com/v1',
    modelName: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4096,
  },
  [ProviderType.OPENROUTER]: {
    endpoint: 'https://openrouter.ai/api/v1',
    temperature: 0.7,
    maxTokens: 4096,
  },
};

/**
 * Checks if a provider requires an API key.
 * @param provider - The provider type to check
 * @returns True if the provider requires authentication
 */
export function requiresApiKey(provider: ProviderType): boolean {
  const noKeyRequired = new Set([
    ProviderType.OLLAMA,
    ProviderType.LOCAL_CLI,
  ]);
  return !noKeyRequired.has(provider);
}

/**
 * Gets the display name for a provider type.
 * @param provider - The provider type
 * @returns Human-readable provider name
 */
export function getProviderDisplayName(provider: ProviderType): string {
  const names: Record<ProviderType, string> = {
    [ProviderType.OLLAMA]: 'Ollama (Local)',
    [ProviderType.OPENAI]: 'OpenAI',
    [ProviderType.GEMINI]: 'Google Gemini',
    [ProviderType.CLAUDE]: 'Anthropic Claude',
    [ProviderType.OPENROUTER]: 'OpenRouter',
    [ProviderType.JULES]: 'Google Jules',
    [ProviderType.COPILOT_ASYNC]: 'GitHub Copilot',
    [ProviderType.LOCAL_CLI]: 'Local CLI',
    [ProviderType.CUSTOM]: 'Custom Provider',
  };
  return names[provider] || provider;
}
