import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from 'reactflow'
import ConditionalEdge from '@/components/edges/ConditionalEdge'

// Mock the workflow store to capture updateEdgeData calls
const updateEdgeDataMock = vi.fn()
vi.mock('@/store/workflowStore', async () => {
  return {
    useWorkflowStore: (selector: any) => selector({ updateEdgeData: updateEdgeDataMock }),
  }
})

vi.mock('reactflow', async () => {
  const actual: any = await vi.importActual('reactflow')
  return {
    ...actual,
  EdgeLabelRenderer: ({ children }: any) => <div>{children}</div>,
  BaseEdge: () => null,
  getBezierPath: () => ['M0,0', 0, 0],
  }
})

function renderEdge() {
  return render(
    <ReactFlowProvider>
      <ConditionalEdge
        id="e1"
        sourceX={0}
        sourceY={0}
        targetX={100}
        targetY={0}
        sourcePosition={"right" as any}
        targetPosition={"left" as any}
        data={{ condition: 'x > 1' }}
      />
    </ReactFlowProvider>
  )
}

describe('ConditionalEdge', () => {
  it('allows editing condition and persists via updateEdgeData', async () => {
    updateEdgeDataMock.mockReset()
    renderEdge()

    // Click Edit to open input
    fireEvent.click(screen.getByText('Edit'))
  const input = screen.getByPlaceholderText("Condition, e.g., result.contains('OK')") as HTMLInputElement
  await userEvent.clear(input)
  await userEvent.type(input, 'status === "OK"')
  input.blur()

  expect(updateEdgeDataMock).toHaveBeenCalledWith('e1', { condition: 'status === "OK"' })
  })
})
