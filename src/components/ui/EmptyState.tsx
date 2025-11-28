import React from 'react';
import { Body1, Caption1, Button, tokens } from '@fluentui/react-components';
import { ListIcon } from '@/components/icons';

export interface EmptyStateProps {
  /** Icon to display above the title */
  icon?: React.ReactNode;
  /** Main title text */
  title: string;
  /** Secondary description text */
  description?: string;
  /** Call-to-action button text */
  actionLabel?: string;
  /** Callback when action button is clicked */
  onAction?: () => void;
  /** Additional styling */
  style?: React.CSSProperties;
}

/**
 * EmptyState component for displaying helpful empty states with call-to-action.
 * Use this when a list, canvas, or section has no content yet.
 */
export function EmptyState({
  icon = <ListIcon />,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 24px',
        gap: 12,
        ...style,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          color: tokens.colorNeutralForeground3,
          fontSize: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <Body1 style={{ color: tokens.colorNeutralForeground1, fontWeight: 600 }}>
        {title}
      </Body1>
      {description && (
        <Caption1 style={{ color: tokens.colorNeutralForeground2, maxWidth: 280 }}>
          {description}
        </Caption1>
      )}
      {actionLabel && onAction && (
        <Button
          appearance="primary"
          onClick={onAction}
          style={{ marginTop: 8 }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
