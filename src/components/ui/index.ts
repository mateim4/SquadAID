/**
 * @file index.ts
 * @description Barrel export for UI components.
 */

export { default as PrimaryButton } from './PrimaryButton';
export { default as ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';
export { default as FormField } from './FormField';
export type { FormFieldProps } from './FormField';
export { default as SkipLink } from './SkipLink';
export type { SkipLinkProps } from './SkipLink';
export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
export { default as Breadcrumbs } from './Breadcrumbs';
export type { BreadcrumbsProps, BreadcrumbItem } from './Breadcrumbs';
export { default as ErrorBoundary } from './ErrorBoundary';
export { 
  default as SkeletonLoader, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonAvatarText 
} from './Skeleton';
export type { SkeletonLoaderProps } from './Skeleton';
