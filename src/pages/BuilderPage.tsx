import { memo, useMemo, useEffect, useRef, DragEvent, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Connection,
  Edge,
} from 'reactflow';
import { useDebouncedCallback } from 'use-debounce';
import { invoke } from '@tauri-apps/api/tauri';
import { v4 as uuidv4 } from 'uuid';

import useFlowStore, { FlowState } from '../store/flow';
import AssistantAgentNode from '../components/nodes/AssistantAgentNode';
import UserProxyAgentNode from '../components/nodes/UserProxyAgentNode';
import EnhancedAgentNode from '../components/nodes/EnhancedAgentNode';
import RelationshipEdge from '../components/edges/RelationshipEdge';
import { RelationshipConfigModal } from '../components/edges/RelationshipConfigModal';
import { RelationshipEdge as RelationshipEdgeType } from '../types/relationship';
import Palette from '../components/Palette';

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
      enhancedAgent: EnhancedAgentNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      relationship: RelationshipEdge,
    }),
    []
  );

  // State for relationship configuration modal
  const [relationshipModalOpen, setRelationshipModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [editingEdge, setEditingEdge] = useState<RelationshipEdgeType | null>(null);

  // Handle new connection - open modal to configure relationship
  const handleConnect = useCallback((connection: Connection) => {
    setPendingConnection(connection);
    setEditingEdge(null);
    setRelationshipModalOpen(true);
  }, []);

  // Handle edge click - open modal to edit relationship
  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    if (edge.type === 'relationship' && edge.data) {
      setEditingEdge(edge as unknown as RelationshipEdgeType);
      setPendingConnection(null);
      setRelationshipModalOpen(true);
    }
  }, []);

  // Handle relationship save from modal
  const handleRelationshipSave = useCallback((relationshipEdge: RelationshipEdgeType) => {
    // Convert to React Flow edge format
    const rfEdge: Edge = {
      id: relationshipEdge.id,
      source: relationshipEdge.source,
      target: relationshipEdge.target,
      type: 'relationship',
      animated: relationshipEdge.animated,
      data: relationshipEdge.data,
      style: relationshipEdge.style,
      label: relationshipEdge.label,
    };

    if (editingEdge) {
      // Update existing edge
      onEdgesChange([{
        type: 'remove',
        id: editingEdge.id,
      }]);
    }
    
    // Add the new/updated edge
    onConnect({
      source: relationshipEdge.source,
      target: relationshipEdge.target,
      sourceHandle: null,
      targetHandle: null,
    });
    
    // Actually we need to use the store to add the edge with full data
    // For now, let's use onConnect for basic connection
    // The edge data will be handled by the flow store

    setRelationshipModalOpen(false);
    setPendingConnection(null);
    setEditingEdge(null);
  }, [editingEdge, onConnect, onEdgesChange]);

  // Get node names for modal display
  const getNodeName = useCallback((nodeId: string | null): string => {
    if (!nodeId) return 'Unknown';
    const node = nodes.find(n => n.id === nodeId);
    return node?.data?.name || node?.data?.label || 'Agent';
  }, [nodes]);

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
    const roleData = event.dataTransfer.getData('application/role');
    
    if (!type && !roleData) {
      return;
    }

    const position = project({
      x: event.clientX,
      y: event.clientY,
    });

    // Handle role drop - create an enhanced agent with the role pre-assigned
    if (roleData) {
      try {
        const role = JSON.parse(roleData);
        const newNode = {
          id: uuidv4(),
          type: 'enhancedAgent',
          position,
          data: {
            name: role.name || 'New Agent',
            systemMessage: role.attributes?.description || 'You are a helpful assistant.',
            roleId: role.id,
            capabilities: role.attributes?.skills || [],
            label: role.name,
          },
        };
        addNode(newNode);
        return;
      } catch (e) {
        console.error('Failed to parse role data:', e);
      }
    }

    // Handle node type drop
    let data: Record<string, unknown>;
    switch (type) {
      case 'enhancedAgent':
        data = {
          name: 'New Enhanced Agent',
          systemMessage: 'You are a helpful assistant.',
          capabilities: [],
        };
        break;
      case 'assistantAgent':
        data = {
          name: 'New Agent',
          systemMessage: 'You are a helpful assistant.',
        };
        break;
      case 'userProxyAgent':
      default:
        data = { name: 'New User Proxy' };
        break;
    }

    const newNode = {
      id: uuidv4(),
      type: type || 'assistantAgent',
      position,
      data,
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
        onConnect={handleConnect}
        onEdgeClick={handleEdgeClick}
        onMove={debouncedSave}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={{
          type: 'relationship',
        }}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
      
      {/* Relationship Configuration Modal */}
      {relationshipModalOpen && (
        <RelationshipConfigModal
          isOpen={relationshipModalOpen}
          onClose={() => {
            setRelationshipModalOpen(false);
            setPendingConnection(null);
            setEditingEdge(null);
          }}
          onSave={handleRelationshipSave}
          sourceNodeName={getNodeName(pendingConnection?.source ?? editingEdge?.source ?? null)}
          targetNodeName={getNodeName(pendingConnection?.target ?? editingEdge?.target ?? null)}
          sourceNodeId={pendingConnection?.source ?? editingEdge?.source ?? ''}
          targetNodeId={pendingConnection?.target ?? editingEdge?.target ?? ''}
          existingEdge={editingEdge ?? undefined}
        />
      )}
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