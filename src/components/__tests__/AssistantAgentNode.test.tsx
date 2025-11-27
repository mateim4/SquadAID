import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AssistantAgentNode from '@/components/nodes/AssistantAgentNode';
import { NodeProps, Position, ReactFlowProvider } from 'reactflow';

function makeProps(partial?: Partial<NodeProps<any>>): NodeProps<any> {
  return {
    id: 'n1',
    type: 'assistantAgent',
    data: { name: 'Researcher', systemMessage: 'You are helpful', agentId: 'assistant', label: 'Assistant Agent', expanded: false },
    selected: false,
    dragging: false,
    zIndex: 0,
    isConnectable: true,
    isDraggable: true,
    isSelectable: true,
    xPos: 0,
    yPos: 0,
    measured: { height: 0, width: 0 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    ...(partial as any),
  } as any;
}

describe('AssistantAgentNode', () => {
  it('renders name and instruction prompt fields', () => {
    render(
      <ReactFlowProvider>
        <AssistantAgentNode {...(makeProps() as any)} />
      </ReactFlowProvider>
    );
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instruction Prompt/i)).toBeInTheDocument();
  });
});
