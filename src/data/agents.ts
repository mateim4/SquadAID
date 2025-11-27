import {
  PersonCircle24Regular,
  Bot24Regular,
  Group24Regular,
  Code24Regular,
  DocumentText24Regular,
  BrainCircuit24Regular,
} from '@fluentui/react-icons';
import { Agent } from '@/types';

export const agents: Agent[] = [
  { id: 'user-proxy', name: "User Proxy Agent", description: "Acts as the user's proxy, executing code and taking input.", Icon: PersonCircle24Regular, backendType: 'architect' },
  { id: 'assistant', name: "Assistant Agent", description: "A general-purpose AI assistant powered by an LLM.", Icon: Bot24Regular, backendType: 'qwen_qa' },
  { id: 'claude', name: "Claude Assistant", description: "Advanced reasoning and code generation (Claude Code local).", Icon: Bot24Regular, backendType: 'claude_bridge' },
  { id: 'ollama', name: "Local Ollama", description: "Privacy-focused local AI processing via Ollama.", Icon: Bot24Regular, backendType: 'ollama_bridge' },
  { id: 'gemini', name: "Gemini CLI Agent", description: "Local Gemini CLI wrapper.", Icon: Bot24Regular, backendType: 'gemini_bridge' },
  { id: 'copilot', name: "Copilot Async Coder", description: "GitHub-label triggered async coding workflows.", Icon: Code24Regular, backendType: 'copilot_bridge', requiresRepo: true },
  { id: 'msty', name: "MSTY Agent", description: "Custom LLM via MSTY backend.", Icon: Bot24Regular, backendType: 'msty_bridge' },
  { id: 'jules-coder', name: "Jules Coder", description: "Async multi-file implementation.", Icon: Code24Regular, backendType: 'jules_bridge', requiresRepo: true },
  { id: 'custom', name: "Custom Agent", description: "Configurable specialist agent.", Icon: PersonCircle24Regular },
  { id: 'group-manager', name: "GroupChat Manager", description: "Manages the conversation flow in a group chat.", Icon: Group24Regular, backendType: 'qwen_qa' },
  { id: 'coder', name: "Senior Engineer", description: "Writes, reviews, and debugs code.", Icon: Code24Regular, backendType: 'qwen_qa' },
  { id: 'product-manager', name: "Product Manager", description: "Defines requirements and provides project context.", Icon: DocumentText24Regular, backendType: 'qwen_qa' },
  { id: 'planner', name: "Planner", description: "Creates step-by-step plans to solve tasks.", Icon: BrainCircuit24Regular, backendType: 'qwen_qa' },
  // Keep only descriptive entries; remove one-word duplicates
  // Jules & Copilot are represented by specific variants below where relevant
];
