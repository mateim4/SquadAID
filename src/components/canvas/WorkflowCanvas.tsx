import React, { useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, Node, updateEdge, Connection as RFConnection, Edge as RFEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Body1,
    CardHeader,
    tokens,
    Title3,
    Text,
    Button,
    Toaster,
    useToastController,
    Toast,
    ToastTitle,
} from '@fluentui/react-components';
import { Cube24Regular } from '@fluentui/react-icons';
import { useStyles } from '@/styles/useStyles';
import { agents } from '@/data/agents';
import { useWorkflowStore } from '@/store/workflowStore';
import AssistantAgentNode from '@/components/nodes/AssistantAgentNode';
import UserProxyAgentNode from '@/components/nodes/UserProxyAgentNode';
import GeminiAgentNode from '@/components/nodes/GeminiAgentNode';
import ConditionalEdge from '@/components/edges/ConditionalEdge';
import { useProjectStore } from '@/store/projectStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const nodeStyle = {
    width: '200px',
    backgroundColor: tokens.colorNeutralBackground3,
    boxShadow: tokens.shadow4,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backdropFilter: 'blur(20px)',
};

const CustomNode = ({ id, data, selected }: { id: string, data: { label: string, icon: React.FC<any> }, selected?: boolean }) => {
    const removeNode = useWorkflowStore(s => s.removeNode)
    return (
        <div style={{ ...nodeStyle, position: 'relative', overflow: 'hidden' }}>
            {selected && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                    backgroundImage: 'linear-gradient(90deg, #f44336, #ff9800, #ffeb3b, #4caf50, #2196f3, #3f51b5, #9c27b0)',
                    backgroundSize: '400% 100%',
                    animation: 'rf-rainbow 3s linear infinite'
                }} />
            )}
                    <CardHeader
                className="drag-handle"
                image={<data.icon fontSize={24} />}
                header={<Body1><b>{data.label}</b></Body1>}
                        action={<Button size="small" appearance="subtle" onClick={(e) => { e.stopPropagation(); removeNode(id); }}>✕</Button>}
            />
            <style>{`@keyframes rf-rainbow {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
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
                    alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: 8,
                }}>
                    <Cube24Regular fontSize={64}/>
                    <Title3>Canvas is Empty</Title3>
                    <Text>Drag an agent from the library to get started.</Text>
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
                onMoveEnd={(_ev, vp) => setViewport(vp)}
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
                {!isMobile && <Controls />}
                {!isMobile && (
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
