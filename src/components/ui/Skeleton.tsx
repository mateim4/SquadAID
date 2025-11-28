/**
 * @file Skeleton.tsx
 * @description Skeleton loading component for placeholder content while loading.
 * Provides consistent loading states with animation.
 */

import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  mergeClasses,
} from '@fluentui/react-components';
import { Skeleton, SkeletonItem } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
    ...shorthands.padding('16px'),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
});

export interface SkeletonLoaderProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Variant of skeleton layout */
  variant?: 'text' | 'card' | 'list' | 'avatar-text';
  /** Additional class name */
  className?: string;
}

/**
 * SkeletonText renders a simple text placeholder
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const styles = useStyles();
  
  return (
    <Skeleton className={styles.container}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonItem
          key={i}
          style={{ 
            width: i === lines - 1 ? '60%' : '100%',
            height: '16px',
          }}
        />
      ))}
    </Skeleton>
  );
}

/**
 * SkeletonCard renders a card-shaped placeholder
 */
export function SkeletonCard() {
  const styles = useStyles();
  
  return (
    <Skeleton className={styles.card}>
      <div className={styles.header}>
        <SkeletonItem shape="circle" size={40} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonItem style={{ width: '50%', height: '16px' }} />
          <SkeletonItem style={{ width: '30%', height: '12px' }} />
        </div>
      </div>
      <SkeletonItem style={{ width: '100%', height: '14px' }} />
      <SkeletonItem style={{ width: '80%', height: '14px' }} />
    </Skeleton>
  );
}

/**
 * SkeletonList renders multiple list items
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  const styles = useStyles();
  
  return (
    <Skeleton className={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.row}>
          <SkeletonItem shape="circle" size={32} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <SkeletonItem style={{ width: '40%', height: '14px' }} />
            <SkeletonItem style={{ width: '70%', height: '12px' }} />
          </div>
        </div>
      ))}
    </Skeleton>
  );
}

/**
 * SkeletonAvatarText renders an avatar with text placeholder
 */
export function SkeletonAvatarText() {
  const styles = useStyles();
  
  return (
    <Skeleton className={styles.row}>
      <SkeletonItem shape="circle" size={40} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonItem style={{ width: '120px', height: '16px' }} />
        <SkeletonItem style={{ width: '80px', height: '12px' }} />
      </div>
    </Skeleton>
  );
}

/**
 * Generic SkeletonLoader that renders different variants
 */
export function SkeletonLoader({
  count = 1,
  variant = 'text',
  className,
}: SkeletonLoaderProps) {
  const styles = useStyles();
  
  const renderContent = () => {
    switch (variant) {
      case 'card':
        return Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ));
      case 'list':
        return <SkeletonList count={count} />;
      case 'avatar-text':
        return Array.from({ length: count }).map((_, i) => (
          <SkeletonAvatarText key={i} />
        ));
      case 'text':
      default:
        return <SkeletonText lines={count} />;
    }
  };

  return (
    <div className={mergeClasses(styles.container, className)}>
      {renderContent()}
    </div>
  );
}

export default SkeletonLoader;
