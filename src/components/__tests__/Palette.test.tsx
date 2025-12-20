import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import Palette from '@/components/Palette';
import { useRoleStore } from '@/store/roleStore';

// Mock the role store
vi.mock('@/store/roleStore', () => ({
  useRoleStore: vi.fn(),
  useRolesArray: vi.fn(() => []),
}));

// Wrapper component for Fluent UI
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <FluentProvider theme={webLightTheme}>{children}</FluentProvider>
);

describe('Palette Component', () => {
  beforeEach(() => {
    // Setup default mock implementation
    (useRoleStore as any).mockImplementation((selector: any) => {
      const state = {
        loadBuiltInRoles: vi.fn(),
        isLoading: false,
      };
      return selector ? selector(state) : state;
    });
  });

  it('renders the palette with proper ARIA label', () => {
    render(<Palette />, { wrapper: Wrapper });
    const palette = screen.getByLabelText('Agent palette');
    expect(palette).toBeInTheDocument();
  });

  it('renders tabs for Agents and Roles', () => {
    render(<Palette />, { wrapper: Wrapper });
    
    const agentsTab = screen.getByRole('tab', { name: /Agents tab/i });
    const rolesTab = screen.getByRole('tab', { name: /Roles tab/i });
    
    expect(agentsTab).toBeInTheDocument();
    expect(rolesTab).toBeInTheDocument();
  });

  it('shows agent nodes by default', () => {
    render(<Palette />, { wrapper: Wrapper });
    
    // Check for agent types
    expect(screen.getByText('Enhanced Agent')).toBeInTheDocument();
    expect(screen.getByText('Assistant Agent')).toBeInTheDocument();
    expect(screen.getByText('User Proxy')).toBeInTheDocument();
  });

  it('shows drag instruction text for agents', () => {
    render(<Palette />, { wrapper: Wrapper });
    expect(screen.getByText('Drag to Canvas')).toBeInTheDocument();
  });

  it('marks agent items as draggable', () => {
    render(<Palette />, { wrapper: Wrapper });
    
    // Find draggable elements
    const draggableItems = screen.getAllByRole('button');
    const draggableAgents = draggableItems.filter(item => 
      item.getAttribute('draggable') === 'true'
    );
    
    expect(draggableAgents.length).toBeGreaterThan(0);
  });

  it('shows proper ARIA labels on agent items', () => {
    render(<Palette />, { wrapper: Wrapper });
    
    const enhancedAgent = screen.getByLabelText(/Enhanced Agent.*Full-featured agent/i);
    expect(enhancedAgent).toBeInTheDocument();
  });

  it('shows loading state when roles are loading', () => {
    (useRoleStore as any).mockImplementation((selector: any) => {
      const state = {
        loadBuiltInRoles: vi.fn(),
        isLoading: true,
      };
      return selector ? selector(state) : state;
    });

    const { rerender } = render(<Palette />, { wrapper: Wrapper });
    
    // Verify roles tab is available
    const rolesTab = screen.getByRole('tab', { name: /Roles tab/i });
    expect(rolesTab).toBeInTheDocument();
    
    // Click roles tab to switch
    rolesTab.click();
    
    // Rerender to update state
    rerender(<Palette />);
    
    // Should show loading message
    expect(screen.getByText('Loading roles...')).toBeInTheDocument();
  });

  it('has proper accessibility attributes for tabs', () => {
    render(<Palette />, { wrapper: Wrapper });
    
    const tabList = screen.getByLabelText('Palette tabs');
    expect(tabList).toBeInTheDocument();
  });

  it('provides keyboard navigation support for draggable items', () => {
    render(<Palette />, { wrapper: Wrapper });
    
    const draggableItems = screen.getAllByRole('button');
    draggableItems.forEach(item => {
      if (item.getAttribute('draggable') === 'true') {
        expect(item).toHaveAttribute('tabIndex', '0');
      }
    });
  });
});
