import React, { memo, useMemo, useEffect, useRef, DragEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import { invoke } from '@tauri-apps/api/tauri';
import { v4 as uuidv4 } from 'uuid';
import { getDefaultAgentData, AgentConfig } from '../types/agents';
import { useDebouncedSave } from '../hooks/useDebouncedSave';

import useFlowStore, { FlowState } from '../store/flow';
import UserProxyAgentNode from '../components/nodes/UserProxyAgentNode';
import ClaudeAgentNode from '../components/nodes/ClaudeAgentNode';
import LocalOllamaAgentNode from '../components/nodes/LocalOllamaAgentNode';
import LocalMSTYAgentNode from '../components/nodes/LocalMSTYAgentNode';
import JulesAgentNode from '../components/nodes/JulesAgentNode';
import CopilotAgentNode from '../components/nodes/CopilotAgentNode';
import CustomAgentNode from '../components/nodes/CustomAgentNode';
import Palette from '../components/Palette'; // Import the new Palette component
import WorkflowLibrary from '../components/WorkflowLibrary';
import MinimapNode from '../components/MinimapNode';

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
  } = useFlowStore(selector);

  // A ref to the React Flow wrapper is needed to get canvas bounds
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // The useReactFlow hook provides the instance, including the `screenToFlowPosition` method
  const { screenToFlowPosition } = useReactFlow();
  
  // Activate the debounced save hook
  useDebouncedSave();
  const nodeTypes = useMemo(
    () => ({
      userProxyAgent: UserProxyAgentNode,
      claudeAgent: ClaudeAgentNode,
      localOllamaAgent: LocalOllamaAgentNode,
      localMSTYAgent: LocalMSTYAgentNode,
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

  const onNodeDragStart = (event: any, node: any) => {
    console.log('Node drag started:', node.id);
  };

  const onNodeDrag = (event: any, node: any) => {
    console.log('Node dragging:', node.id);
  };

  const onNodeDragStop = (event: any, node: any) => {
    console.log('Node drag stopped:', node.id);
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
    console.log('Drop event triggered, type:', type);
    
    if (!type) {
      console.log('No type found in dataTransfer');
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    console.log('Drop position:', position);

    // Convert node type to agent config type for type safety
    const getAgentConfigType = (nodeType: string): AgentConfig['type'] => {
      switch (nodeType) {
        case 'claudeAgent': return 'ClaudeAgent';
        case 'localOllamaAgent': return 'LocalOllamaAgent';
        case 'localMSTYAgent': return 'LocalMSTYAgent';
        case 'julesAgent': return 'JulesAgent';
        case 'copilotAgent': return 'CopilotAgent';
        case 'customAgent': return 'CustomAgent';
        case 'userProxyAgent': return 'UserProxyAgent';
        default: return 'UserProxyAgent';
      }
    };

    const agentType = getAgentConfigType(type);
    const newNode = {
      id: uuidv4(),
      type,
      position,
      data: getDefaultAgentData(agentType),
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
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        fitView
      >
        <Controls />
        <MiniMap 
          nodeComponent={MinimapNode}
          position="bottom-right"
          zoomable
          pannable
          maskColor="rgba(99, 102, 241, 0.1)"
          maskStrokeColor="#6366f1"
          maskStrokeWidth={2}
        />
        <Background 
          gap={20} 
          size={0.5} 
          color="rgba(0, 123, 255, 0.1)"
          variant="dots"
        />
      </ReactFlow>
    </div>
  );
});

// The main layout now includes the Palette on the left, canvas in the middle, and WorkflowLibrary on the right
const BuilderPage = () => (
  <div className="builder-page-main">
    <ReactFlowProvider>
      <Palette />
      <BuilderPageContent />
      <WorkflowLibrary />
    </ReactFlowProvider>
  </div>
);

export default BuilderPage;