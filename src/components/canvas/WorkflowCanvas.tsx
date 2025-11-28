import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { MiniMap, Controls, Background, Node, updateEdge, Connection as RFConnection, Edge as RFEdge, Panel } from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Body1,
    Caption1,
    CardHeader,
    tokens,
    Title3,
    Text,
    Button,
    Toaster,
    useToastController,
    Toast,
    ToastTitle,
    Tooltip,
    Badge,
} from '@fluentui/react-components';
import { 
    NodeIcon,
    CloseIcon,
    ZoomInIcon,
    ZoomOutIcon,
    FitViewIcon,
    MinimapIcon,
    UndoIcon,
    RedoIcon,
} from '@/components/icons';
import { useStyles } from '@/styles/useStyles';
import { agents } from '@/data/agents';
import { useWorkflowStore } from '@/store/workflowStore';
import AssistantAgentNode from '@/components/nodes/AssistantAgentNode';
import UserProxyAgentNode from '@/components/nodes/UserProxyAgentNode';
import GeminiAgentNode from '@/components/nodes/GeminiAgentNode';
import ConditionalEdge from '@/components/edges/ConditionalEdge';
import { useProjectStore } from '@/store/projectStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ConfirmDialog } from '@/components/ui';
import { touchTargets } from '@/styles/designTokens';
import { useUndoRedo } from '@/hooks/useUndoRedo';

const nodeStyle = {
    width: '320px',
    backgroundColor: tokens.colorNeutralBackground3,
    boxShadow: tokens.shadow4,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backdropFilter: 'blur(20px)',
};

const CustomNode = ({ id, data, selected }: { id: string, data: { label: string, icon: React.FC<any> }, selected?: boolean }) => {
    const removeNode = useWorkflowStore(s => s.removeNode);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    const handleDelete = useCallback(() => {
        removeNode(id);
        setShowDeleteConfirm(false);
    }, [id, removeNode]);

    return (
        <div style={{ ...nodeStyle, position: 'relative', overflow: 'hidden' }}>
            {selected && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                    backgroundColor: tokens.colorBrandBackground,
                }} />
            )}
            <CardHeader
                className="drag-handle"
                image={<data.icon fontSize={24} aria-hidden="true" />}
                header={<Body1><b>{data.label}</b></Body1>}
                action={
                    <Tooltip content="Remove node" relationship="label">
                        <Button 
                            size="small" 
                            appearance="subtle" 
                            icon={<CloseIcon />}
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                setShowDeleteConfirm(true); 
                            }}
                            aria-label={`Remove ${data.label} node`}
                        />
                    </Tooltip>
                }
            />
            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Delete Node?"
                message={`Are you sure you want to delete "${data.label}"? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={handleDelete}
            />
        </div>
    )
}

const nodeTypes = {
    custom: CustomNode,
    assistantAgent: AssistantAgentNode,
    userProxyAgent: UserProxyAgentNode,
    geminiAgent: GeminiAgentNode,
} as const;

// Hoist edge types to avoid re-creating object each render
const edgeTypes = { conditional: ConditionalEdge } as const;

const getNodeTypeForAgent = (agentId: string): keyof typeof nodeTypes => {
    if (agentId === 'user-proxy') return 'userProxyAgent';
    if (agentId === 'gemini') return 'geminiAgent';
    // Treat these agent IDs as assistant-type nodes so they share the same editable UI/fields
    const assistantLike = new Set([
        'assistant',
        'claude',
        'ollama',
    'copilot',
    'msty',
        'jules-coder',
        'custom',
        'group-manager',
        'product-manager',
        'planner',
        'coder',
    ]);
    if (assistantLike.has(agentId)) return 'assistantAgent';
    return 'custom';
};

export const WorkflowCanvas: React.FC = () => {
    const styles = useStyles();
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges, setSelectedNodeId, selectedNodeId, setViewport, viewport } = useWorkflowStore();
    const agentMap = useMemo(() => new Map(agents.map(a => [a.id, a])), []);
    const projectMode = useProjectStore(s => s.mode);
    const { dispatchToast } = useToastController();
    // Treat narrow viewports as mobile and reduce chrome density
    const isMobile = useMediaQuery('(max-width: 700px)');
    const [currentZoom, setCurrentZoom] = useState(viewport.zoom || 1);
    const [showMiniMap, setShowMiniMap] = useState(!isMobile);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    
    // Undo/redo support
    const { pushHistory, undo, redo, canUndo, canRedo } = useUndoRedo();
    
    // Push initial state to history
    useEffect(() => {
        if (nodes.length > 0 || edges.length > 0) {
            pushHistory({ nodes, edges });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    const handleUndo = useCallback(() => {
        const prevState = undo();
        if (prevState) {
            setNodes(prevState.nodes);
            setEdges(prevState.edges);
        }
    }, [undo, setNodes, setEdges]);
    
    const handleRedo = useCallback(() => {
        const nextState = redo();
        if (nextState) {
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
        }
    }, [redo, setNodes, setEdges]);
    
    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    // Listen for keyboard agent selection from AgentLibrary
    useEffect(() => {
        const handleAgentSelect = (e: Event) => {
            const customEvent = e as CustomEvent<{ agentId: string }>;
            const agentId = customEvent.detail.agentId;
            const agent = agentMap.get(agentId);
            if (agent) {
                // Add agent to center of canvas
                const type = getNodeTypeForAgent(agentId);
                const baseData: any = { label: agent.name, icon: agent.Icon, agentId, expanded: false };
                const data =
                    type === 'assistantAgent'
                        ? { ...baseData, name: agent.name, systemMessage: '' }
                        : type === 'userProxyAgent'
                            ? { ...baseData, name: agent.name, systemMessage: '' }
                            : baseData;

                const newNode: Node = {
                    id: `node-${Date.now()}`,
                    type,
                    position: { x: 200 + nodes.length * 50, y: 150 + nodes.length * 30 },
                    data,
                    draggable: true,
                    selectable: true,
                };
                pushHistory({ nodes, edges });
                setNodes([...nodes, newNode]);
            }
        };
        
        window.addEventListener('squad-agent-select', handleAgentSelect);
        return () => window.removeEventListener('squad-agent-select', handleAgentSelect);
    }, [agentMap, nodes, edges, setNodes, pushHistory]);

    const handleZoomIn = useCallback(() => {
        if (reactFlowInstance) {
            reactFlowInstance.zoomIn();
        }
    }, [reactFlowInstance]);

    const handleZoomOut = useCallback(() => {
        if (reactFlowInstance) {
            reactFlowInstance.zoomOut();
        }
    }, [reactFlowInstance]);

    const handleFitView = useCallback(() => {
        if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2 });
        }
    }, [reactFlowInstance]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const agentId = e.dataTransfer.getData("application/squad-agent");
        const agent = agentMap.get(agentId);
        if (agent) {
            const requires = (agent as any).requiresRepo === true;
            if (projectMode === 'local' && requires) {
                dispatchToast(
                    <Toast>
                        <ToastTitle>This agent requires GitHub (Hybrid or GitHub project)</ToastTitle>
                    </Toast>,
                    { intent: 'warning', timeout: 3000 }
                );
                return;
            }
            const reactFlowBounds = e.currentTarget.getBoundingClientRect();
            const position = {
                x: e.clientX - reactFlowBounds.left,
                y: e.clientY - reactFlowBounds.top,
            };

            const type = getNodeTypeForAgent(agentId);
            const baseData: any = { label: agent.name, icon: agent.Icon, agentId, expanded: false };
            const data =
                type === 'assistantAgent'
                    ? { ...baseData, name: agent.name, systemMessage: '' }
                    : type === 'userProxyAgent'
                        ? { ...baseData, name: agent.name, systemMessage: '' }
                        : baseData;

            const newNode: Node = {
                id: `node-${Date.now()}`,
                type,
                position,
                data,
                draggable: true,
                selectable: true,
            };
            // Save state for undo before adding node
            pushHistory({ nodes, edges });
            setNodes([...nodes, newNode]);
        }
    };

    return (
        <div 
            className={styles.canvas} 
            aria-label="Workflow canvas"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
                        onClick={(e) => {
                            // Deselect when clicking on empty canvas (React Flow handles inside clicks)
                            if ((e.target as HTMLElement).closest('.react-flow')) {
                                // noop here, selection handled below
                            }
                        }}
        >
            <Toaster />
            {/* Empty overlay */}
            {nodes.length === 0 && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: 12,
                    zIndex: 10,
                }}>
                    <NodeIcon style={{ fontSize: 64, color: tokens.colorNeutralForeground3 }}/>
                    <Title3 style={{ color: tokens.colorNeutralForeground1 }}>Canvas is Empty</Title3>
                    <Text style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', maxWidth: 280 }}>
                        Drag an agent from the library on the left to get started building your workflow.
                    </Text>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3, marginTop: 8 }}>
                        Tip: Connect agents by dragging from one handle to another
                    </Caption1>
                </div>
            )}
                        <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                edgesUpdatable
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                nodesDraggable
                elementsSelectable
                nodesConnectable
                fitView
                defaultViewport={viewport}
                onInit={setReactFlowInstance}
                onMoveEnd={(_ev, vp) => {
                    setViewport(vp);
                    setCurrentZoom(vp.zoom);
                }}
                deleteKeyCode={['Delete', 'Backspace']}
                onEdgeUpdate={(oldEdge: RFEdge, newConn: RFConnection) => {
                    const current = useWorkflowStore.getState().edges as RFEdge[];
                    setEdges(updateEdge(oldEdge, newConn, current));
                }}
                                onEdgeUpdateEnd={(evt, edge) => {
                                    const isPane = (evt?.target as Element)?.classList?.contains('react-flow__pane');
                                    if (isPane) {
                                        const current = useWorkflowStore.getState().edges;
                                        setEdges(current.filter(e => e.id !== edge.id));
                                    }
                                }}
                onNodeClick={(_e, node) => {
                    if (node?.id !== selectedNodeId) setSelectedNodeId(node.id);
                }}
                onPaneClick={() => {
                    if (selectedNodeId) setSelectedNodeId(undefined);
                }}
                                                onSelectionChange={({ nodes: n }) => {
                                                    const next = n && n.length ? n[0].id : undefined;
                                                    if (next !== selectedNodeId) setSelectedNodeId(next);
                                                }}
            >
                {/* Mobile-friendly controls panel */}
                <Panel position="bottom-left" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Undo/Redo controls */}
                    <div style={{ 
                        display: 'flex', 
                        gap: 4, 
                        backgroundColor: tokens.colorNeutralBackground3,
                        padding: '4px 8px',
                        borderRadius: tokens.borderRadiusMedium,
                        border: `1px solid ${tokens.colorNeutralStroke2}`,
                        boxShadow: tokens.shadow4,
                    }}>
                        <Tooltip content="Undo (Ctrl+Z)" relationship="label">
                            <Button
                                size="small"
                                appearance="subtle"
                                icon={<UndoIcon />}
                                onClick={handleUndo}
                                disabled={!canUndo}
                                aria-label="Undo last action"
                                style={{ minWidth: isMobile ? touchTargets.minimum : undefined }}
                            />
                        </Tooltip>
                        <Tooltip content="Redo (Ctrl+Y)" relationship="label">
                            <Button
                                size="small"
                                appearance="subtle"
                                icon={<RedoIcon />}
                                onClick={handleRedo}
                                disabled={!canRedo}
                                aria-label="Redo last action"
                                style={{ minWidth: isMobile ? touchTargets.minimum : undefined }}
                            />
                        </Tooltip>
                    </div>
                    {/* Zoom controls */}
                    <div style={{ 
                        display: 'flex', 
                        gap: 4, 
                        backgroundColor: tokens.colorNeutralBackground3,
                        padding: '4px 8px',
                        borderRadius: tokens.borderRadiusMedium,
                        border: `1px solid ${tokens.colorNeutralStroke2}`,
                        boxShadow: tokens.shadow4,
                    }}>
                        <Tooltip content="Zoom in" relationship="label">
                            <Button
                                size="small"
                                appearance="subtle"
                                icon={<ZoomInIcon />}
                                onClick={handleZoomIn}
                                aria-label="Zoom in"
                                style={{ minWidth: isMobile ? touchTargets.minimum : undefined }}
                            />
                        </Tooltip>
                        <Badge appearance="outline" style={{ alignSelf: 'center', minWidth: 48, textAlign: 'center' }}>
                            {Math.round(currentZoom * 100)}%
                        </Badge>
                        <Tooltip content="Zoom out" relationship="label">
                            <Button
                                size="small"
                                appearance="subtle"
                                icon={<ZoomOutIcon />}
                                onClick={handleZoomOut}
                                aria-label="Zoom out"
                                style={{ minWidth: isMobile ? touchTargets.minimum : undefined }}
                            />
                        </Tooltip>
                        <Tooltip content="Fit to view" relationship="label">
                            <Button
                                size="small"
                                appearance="subtle"
                                icon={<FitViewIcon />}
                                onClick={handleFitView}
                                aria-label="Fit canvas to view"
                                style={{ minWidth: isMobile ? touchTargets.minimum : undefined }}
                            />
                        </Tooltip>
                        {isMobile && (
                            <Tooltip content={showMiniMap ? "Hide minimap" : "Show minimap"} relationship="label">
                                <Button
                                    size="small"
                                    appearance={showMiniMap ? "primary" : "subtle"}
                                    icon={<MinimapIcon />}
                                    onClick={() => setShowMiniMap(!showMiniMap)}
                                    aria-label={showMiniMap ? "Hide minimap" : "Show minimap"}
                                    style={{ minWidth: touchTargets.minimum }}
                                />
                            </Tooltip>
                        )}
                    </div>
                </Panel>
                
                {/* Desktop controls - hide on mobile since we have custom panel */}
                {!isMobile && <Controls showInteractive={false} />}
                
                {/* MiniMap - toggleable on mobile */}
                {showMiniMap && (
                <MiniMap nodeColor={n => {
                    const agent = agentMap.get(n.data.agentId);
                    if (!agent) return tokens.colorNeutralStroke3;
                    // A simple hash function to get a color from the agent name
                    const hash = agent.name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
                    const color = `hsl(${hash % 360}, 50%, 60%)`;
                    return color;
                }} style={{
                    backgroundColor: tokens.colorNeutralBackground4,
                    borderRadius: tokens.borderRadiusMedium,
                }} />
                )}
                <Background gap={40} size={2} color={tokens.colorNeutralStroke3} />
            </ReactFlow>
        </div>
    );
};
