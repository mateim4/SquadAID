/**
 * @file ErrorBoundary.tsx
 * @description Error boundary component for graceful error handling.
 * Catches JavaScript errors anywhere in child component tree and displays fallback UI.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Button,
  Title2,
  Text,
  tokens,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import { ErrorIcon, RefreshIcon } from '@/components/icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('40px'),
    ...shorthands.gap('16px'),
    minHeight: '200px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorPaletteRedForeground1,
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
  message: {
    color: tokens.colorNeutralForeground2,
    maxWidth: '400px',
  },
  details: {
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    maxWidth: '100%',
    overflowX: 'auto',
    textAlign: 'left',
  },
  actions: {
    display: 'flex',
    ...shorthands.gap('8px'),
  },
});

interface Props {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback UI (overrides default) */
  fallback?: ReactNode;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors in child components.
 * Displays a friendly error message with recovery options.
 */
class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const isDev = process.env.NODE_ENV === 'development';
      const showDetails = this.props.showDetails ?? isDev;

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          showDetails={showDetails}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

// Functional component for the fallback UI (allows hooks)
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  onRetry: () => void;
  onReload: () => void;
}

function ErrorFallback({
  error,
  errorInfo,
  showDetails,
  onRetry,
  onReload,
}: ErrorFallbackProps) {
  // Use a workaround since makeStyles returns a hook but we're inside a class render
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      gap: '16px',
      minHeight: '200px',
      textAlign: 'center' as const,
    },
    icon: {
      fontSize: '48px',
      color: tokens.colorPaletteRedForeground1,
    },
    message: {
      color: tokens.colorNeutralForeground2,
      maxWidth: '400px',
    },
    details: {
      backgroundColor: tokens.colorNeutralBackground3,
      padding: '12px',
      borderRadius: tokens.borderRadiusMedium,
      fontFamily: 'monospace',
      fontSize: tokens.fontSizeBase200,
      color: tokens.colorNeutralForeground3,
      maxWidth: '100%',
      overflowX: 'auto' as const,
      textAlign: 'left' as const,
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-word' as const,
    },
    actions: {
      display: 'flex',
      gap: '8px',
    },
  };

  return (
    <div style={styles.container} role="alert">
      <ErrorIcon style={styles.icon} aria-hidden="true" />
      <Title2>Something went wrong</Title2>
      <Text style={styles.message}>
        An unexpected error occurred. You can try again or reload the page.
      </Text>
      
      {showDetails && error && (
        <div style={styles.details}>
          <strong>{error.name}:</strong> {error.message}
          {errorInfo?.componentStack && (
            <>
              <br /><br />
              <strong>Component Stack:</strong>
              {errorInfo.componentStack}
            </>
          )}
        </div>
      )}
      
      <div style={styles.actions}>
        <Button
          appearance="primary"
          icon={<RefreshIcon />}
          onClick={onRetry}
        >
          Try Again
        </Button>
        <Button
          appearance="secondary"
          onClick={onReload}
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
}

export const ErrorBoundary = ErrorBoundaryClass;
export default ErrorBoundary;
