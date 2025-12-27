import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeminiAgentNode from '../GeminiAgentNode';

// Mock the workflow store
vi.mock('@/store/workflowStore', () => ({
  useWorkflowStore: () => ({
    updateNodeData: vi.fn(),
  }),
}));

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
    const updateNodeData = useWorkflowStore().updateNodeData as jest.Mock;

    expect(updateNodeData).toHaveBeenCalledWith('test', { model: 'gemini-1.0', flags: '--temperature 0.1' });
  });
});