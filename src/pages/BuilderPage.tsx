import React, { memo, useMemo, useEffect, useRef, DragEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import { useDebouncedCallback } from 'use-debounce';
import { invoke } from '@tauri-apps/api/tauri';
import { v4 as uuidv4 } from 'uuid';

import useFlowStore, { FlowState } from '../store/flow';
import AssistantAgentNode from '../components/nodes/AssistantAgentNode';
import UserProxyAgentNode from '../components/nodes/UserProxyAgentNode';
import ClaudeAgentNode from '../components/nodes/ClaudeAgentNode';
import QwenAgentNode from '../components/nodes/QwenAgentNode';
import JulesAgentNode from '../components/nodes/JulesAgentNode';
import CopilotAgentNode from '../components/nodes/CopilotAgentNode';
import CustomAgentNode from '../components/nodes/CustomAgentNode';
import Palette from '../components/Palette'; // Import the new Palette component

import 'reactflow/dist/style.css';
import './BuilderPage.css';

const selector = (state: FlowState) => state;

const BuilderPageContent = memo(() => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setFlow,
    addNode, // Get addNode from the store
    saveFlow,
  } = useFlowStore(selector);

  // A ref to the React Flow wrapper is needed to get canvas bounds
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // The useReactFlow hook provides the instance, including the `project` method
  const { project } = useReactFlow();
  const debouncedSave = useDebouncedCallback(saveFlow, 1000);
  const nodeTypes = useMemo(
    () => ({
      assistantAgent: AssistantAgentNode,
      userProxyAgent: UserProxyAgentNode,
      claudeAgent: ClaudeAgentNode,
      qwenAgent: QwenAgentNode,
      julesAgent: JulesAgentNode,
      copilotAgent: CopilotAgentNode,
      customAgent: CustomAgentNode,
    }),
    []
  );

  useEffect(() => {
    // This logic remains the same
    // ...
  }, [setFlow]);

  /**
   * Prevents the default browser behavior for drag-over, which is necessary
   * to allow a drop event to occur.
   */
  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  /**
   * Handles the drop event when a node from the palette is dropped on the canvas.
   *
   * @description
   * 1. It retrieves the `nodeType` stored in the `dataTransfer` object.
   * 2. It calculates the drop position relative to the React Flow canvas using
   *    the `project` method, which converts screen coordinates to flow coordinates.
   * 3. It generates a unique ID for the new node using `uuidv4`.
   * 4. It constructs the new node object with default data.
   * 5. It calls the `addNode` action from the Zustand store to add the new node to the state.
   */
  const onDrop = (event: DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) {
      return;
    }

    const position = project({
      x: event.clientX,
      y: event.clientY,
    });

    // Define default data for each agent type
    const getDefaultData = (type: string) => {
      switch (type) {
        case 'claudeAgent':
          return {
            name: 'Claude Assistant',
            role: 'Assistant',
            description: 'Advanced reasoning and code generation',
            systemPrompt: 'You are a helpful AI assistant with advanced reasoning capabilities...',
            temperature: 0.7,
            capabilities: ['reasoning', 'coding', 'analysis', 'writing']
          };
        case 'qwenAgent':
          return {
            name: 'Qwen QA Agent',
            role: 'Code Specialist',
            description: 'Specialized in code analysis, review, and quality assurance',
            systemPrompt: 'You are a comprehensive QA agent focused on code quality, security, and best practices...',
            temperature: 0.5,
            capabilities: ['coding', 'debugging', 'code-review', 'security-analysis'],
            qualityThreshold: 7
          };
        case 'julesAgent':
          return {
            name: 'Jules Research Agent',
            role: 'Research Assistant',
            description: 'Google-powered research and comprehensive analysis',
            systemPrompt: 'You are a research agent with access to web search and comprehensive analysis capabilities...',
            capabilities: ['research', 'web-search', 'analysis', 'multi-file-implementation'],
            secureVmEnabled: true,
            multiFileCapable: true
          };
        case 'copilotAgent':
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
        case 'customAgent':
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
        case 'assistantAgent':
          return { name: 'New Agent', systemMessage: 'You are a helpful assistant.' };
        case 'userProxyAgent':
          return { name: 'New User Proxy' };
        default:
          return { name: 'Unknown Agent' };
      }
    };

    const newNode = {
      id: uuidv4(),
      type,
      position,
      data: getDefaultData(type),
    };

    addNode(newNode);
  };

  return (
    <div
      className="builder-page-container"
      ref={reactFlowWrapper}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMove={debouncedSave}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
});

// The main layout now includes the Palette alongside the canvas.
// The outer div uses display: flex to position them side-by-side.
const BuilderPage = () => (
  <div style={{ display: 'flex', height: '100%' }}>
    <ReactFlowProvider>
      <Palette />
      <BuilderPageContent />
    </ReactFlowProvider>
  </div>
);

export default BuilderPage;