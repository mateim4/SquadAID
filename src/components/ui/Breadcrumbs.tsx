import React from 'react';
import { Button, tokens, Text } from '@fluentui/react-components';
import { BreadcrumbSeparatorIcon, HomeIcon } from '@/components/icons';

export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** Optional callback when clicked (not called for last item) */
  onClick?: () => void;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Whether to show home icon for first item */
  showHomeIcon?: boolean;
  /** Additional styling */
  style?: React.CSSProperties;
}

/**
 * Breadcrumbs component for navigation in nested views.
 * 
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: 'Projects', onClick: () => navigate('/projects') },
 *     { label: 'My Project', onClick: () => navigate('/projects/my-project') },
 *     { label: 'Task #42' },
 *   ]}
 * />
 */
export function Breadcrumbs({ items, showHomeIcon = true, style }: BreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
        ...style,
      }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          listStyle: 'none',
          margin: 0,
          padding: 0,
          flexWrap: 'wrap',
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {index > 0 && (
                <BreadcrumbSeparatorIcon
                  style={{ color: tokens.colorNeutralForeground3 }}
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <Text
                  style={{
                    color: tokens.colorNeutralForeground1,
                    fontWeight: 600,
                  }}
                  aria-current="page"
                >
                  {isFirst && showHomeIcon && item.icon === undefined && (
                    <HomeIcon
                      style={{ marginRight: 4, verticalAlign: 'middle' }}
                      aria-hidden="true"
                    />
                  )}
                  {item.icon && (
                    <span style={{ marginRight: 4, verticalAlign: 'middle' }}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </Text>
              ) : (
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={item.onClick}
                  style={{
                    minHeight: 'auto',
                    padding: '2px 6px',
                    color: tokens.colorNeutralForeground2,
                  }}
                >
                  {isFirst && showHomeIcon && item.icon === undefined && (
                    <HomeIcon
                      style={{ marginRight: 4 }}
                      aria-hidden="true"
                    />
                  )}
                  {item.icon && (
                    <span style={{ marginRight: 4 }}>{item.icon}</span>
                  )}
                  {item.label}
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
