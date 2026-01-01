import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock reactflow small bits used by the node so tests don't need full provider
vi.mock('reactflow', () => ({
  Handle: (props: any) => <div data-testid={`handle-${props.type}`} />,
  Position: { Top: 'top', Bottom: 'bottom' },
}));

// Mock Tooltip to simpler elements to avoid fluent internals in jsdom
vi.mock('@fluentui/react-components', async () => {
  const actual = await vi.importActual('@fluentui/react-components');
  return {
    ...actual,
    Tooltip: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock IconButton from its dedicated package
vi.mock('@fluentui/react-button', async () => {
  return {
    IconButton: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
  };
});

// Mock the workflow store
vi.mock('@/store/workflowStore', () => {
  const updateNodeData = vi.fn();
  const store = { updateNodeData };
  return {
    useWorkflowStore: (selector?: any) => (typeof selector === 'function' ? selector(store) : store),
  };
});

import GeminiAgentNode from '../GeminiAgentNode';

describe('GeminiAgentNode', () => {
  test('opens config modal and saves model/flags', async () => {
    const mockData = { prompt: '', output: '', model: 'gemini-1.5-pro', flags: '' } as any;

    render(<GeminiAgentNode id="test" data={mockData} />);

    const configBtn = screen.getByRole('button', { name: /Configure Gemini/i });
    expect(configBtn).toBeVisible();

    fireEvent.click(configBtn);

    const modelInput = await screen.findByLabelText('Gemini model');
    const flagsInput = await screen.findByLabelText('Gemini flags');

    fireEvent.change(modelInput, { target: { value: 'gemini-1.0' } });
    fireEvent.change(flagsInput, { target: { value: '--temperature 0.1' } });

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    // After save, the modal should close and the updateNodeData fn should have been called
    const { useWorkflowStore } = await import('@/store/workflowStore');
    const updateNodeData = useWorkflowStore().updateNodeData as any;

    expect(updateNodeData).toHaveBeenCalledWith('test', { model: 'gemini-1.0', flags: '--temperature 0.1' });
  });
});