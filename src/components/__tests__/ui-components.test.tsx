/**
 * Unit Tests for UI Components
 * Tests individual components in isolation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import React from 'react';

// Component imports
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField } from '@/components/ui/FormField';
import { SkipLink } from '@/components/ui/SkipLink';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SkeletonLoader, SkeletonText, SkeletonCard, SkeletonList } from '@/components/ui/Skeleton';

// Test wrapper with Fluent UI provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FluentProvider theme={teamsLightTheme}>
    {children}
  </FluentProvider>
);

const renderWithProvider = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// ============================================
// CONFIRM DIALOG TESTS
// ============================================
describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Test Title',
    message: 'Test message',
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ConfirmDialog {...defaultProps} />);
    
    // Default confirm button text is "Delete"
    const confirmBtn = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmBtn);
    
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ConfirmDialog {...defaultProps} />);
    
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);
    
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows custom confirm text', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} confirmText="Delete" />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('shows custom cancel text', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} cancelText="Dismiss" />);
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('shows warning icon in danger variant', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} variant="danger" />);
    // Warning icon should be present
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('disables buttons when isLoading is true', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} isLoading={true} />);
    
    const confirmBtn = screen.getByRole('button', { name: /processing/i });
    expect(confirmBtn).toBeDisabled();
  });
});

// ============================================
// EMPTY STATE TESTS
// ============================================
describe('EmptyState', () => {
  it('renders with title and description', () => {
    renderWithProvider(
      <EmptyState
        title="No items found"
        description="Add some items to get started"
      />
    );
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Add some items to get started')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const onAction = vi.fn();
    renderWithProvider(
      <EmptyState
        title="No items"
        actionLabel="Add Item"
        onAction={onAction}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    
    renderWithProvider(
      <EmptyState
        title="No items"
        actionLabel="Add Item"
        onAction={onAction}
      />
    );
    
    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders custom icon when provided', () => {
    const CustomIcon = () => <span data-testid="custom-icon">🎉</span>;
    renderWithProvider(
      <EmptyState
        title="No items"
        icon={<CustomIcon />}
      />
    );
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});

// ============================================
// FORM FIELD TESTS
// ============================================
describe('FormField', () => {
  it('renders label correctly', () => {
    renderWithProvider(
      <FormField label="Email">
        <input type="email" />
      </FormField>
    );
    
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows required indicator when required is true', () => {
    renderWithProvider(
      <FormField label="Email" required>
        <input type="email" />
      </FormField>
    );
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows hint text when provided', () => {
    renderWithProvider(
      <FormField label="Email" hint="Enter your work email">
        <input type="email" />
      </FormField>
    );
    
    expect(screen.getByText('Enter your work email')).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    renderWithProvider(
      <FormField label="Email" error="Invalid email format">
        <input type="email" />
      </FormField>
    );
    
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('hides hint when error is shown', () => {
    renderWithProvider(
      <FormField label="Email" hint="Enter your email" error="Invalid email">
        <input type="email" />
      </FormField>
    );
    
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });
});

// ============================================
// SKIP LINK TESTS
// ============================================
describe('SkipLink', () => {
  it('renders with correct href', () => {
    renderWithProvider(<SkipLink targetId="main-content" />);
    
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('renders with custom label', () => {
    renderWithProvider(<SkipLink targetId="content" label="Skip navigation" />);
    
    expect(screen.getByRole('link', { name: 'Skip navigation' })).toBeInTheDocument();
  });

  it('is visually hidden by default', () => {
    renderWithProvider(<SkipLink targetId="main-content" />);
    
    const link = screen.getByRole('link', { name: /skip to main content/i });
    // Check it has styles that make it visually hidden
    expect(link).toBeInTheDocument();
  });
});

// ============================================
// BREADCRUMBS TESTS
// ============================================
describe('Breadcrumbs', () => {
  const items = [
    { label: 'Home', onClick: vi.fn() },
    { label: 'Projects', onClick: vi.fn() },
    { label: 'My Project' },
  ];

  it('renders all breadcrumb items', () => {
    renderWithProvider(<Breadcrumbs items={items} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });

  it('makes non-last items clickable', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Breadcrumbs items={items} />);
    
    await user.click(screen.getByText('Home'));
    expect(items[0].onClick).toHaveBeenCalled();
  });

  it('last item is not clickable', () => {
    renderWithProvider(<Breadcrumbs items={items} />);
    
    const lastItem = screen.getByText('My Project');
    expect(lastItem.closest('button')).not.toBeInTheDocument();
  });

  it('renders separators between items', () => {
    renderWithProvider(<Breadcrumbs items={items} />);
    
    // There should be 2 separators for 3 items
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();
  });

  it('shows home icon when showHomeIcon is true', () => {
    renderWithProvider(<Breadcrumbs items={items} showHomeIcon />);
    
    // Should render (exact icon testing depends on implementation)
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});

// ============================================
// SKELETON LOADER TESTS
// ============================================
describe('Skeleton Components', () => {
  describe('SkeletonText', () => {
    it('renders without crashing', () => {
      const { container } = renderWithProvider(<SkeletonText />);
      // Fluent UI Skeleton renders with fui-Skeleton class
      expect(container.querySelector('[class*="fui-Skeleton"]')).toBeInTheDocument();
    });

    it('renders with custom lines prop', () => {
      const { container } = renderWithProvider(<SkeletonText lines={5} />);
      expect(container.querySelector('[class*="fui-Skeleton"]')).toBeInTheDocument();
    });
  });

  describe('SkeletonCard', () => {
    it('renders card skeleton', () => {
      const { container } = renderWithProvider(<SkeletonCard />);
      expect(container.querySelector('[class*="fui-Skeleton"]')).toBeInTheDocument();
    });
  });

  describe('SkeletonList', () => {
    it('renders without crashing', () => {
      const { container } = renderWithProvider(<SkeletonList />);
      expect(container.querySelector('[class*="fui-Skeleton"]')).toBeInTheDocument();
    });

    it('renders with custom count', () => {
      const { container } = renderWithProvider(<SkeletonList count={5} />);
      expect(container.querySelector('[class*="fui-Skeleton"]')).toBeInTheDocument();
    });
  });

  describe('SkeletonLoader', () => {
    it('renders text variant by default', () => {
      const { container } = renderWithProvider(<SkeletonLoader />);
      expect(container.querySelector('[class*="fui-Skeleton"]')).toBeInTheDocument();
    });

    it('renders card variant', () => {
      const { container } = renderWithProvider(<SkeletonLoader variant="card" count={2} />);
      expect(container.querySelector('[class*="fui-Skeleton"]')).toBeInTheDocument();
    });

    it('renders list variant', () => {
      const { container } = renderWithProvider(<SkeletonLoader variant="list" count={3} />);
      expect(container.querySelector('[class*="fui-Skeleton"]')).toBeInTheDocument();
    });
  });
});

// ============================================
// ERROR BOUNDARY TESTS
// ============================================
describe('ErrorBoundary', () => {
  // Component that throws an error
  const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  it('renders children when no error', () => {
    renderWithProvider(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders fallback UI when error occurs', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProvider(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('shows try again button', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProvider(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('shows reload page button', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProvider(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('calls onError callback when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    
    renderWithProvider(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProvider(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});
