/**
 * @file ConfirmDialog.tsx
 * @description Reusable confirmation dialog for destructive actions.
 * Follows Fluent UI v9 patterns and accessibility best practices.
 */

import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { WarningIcon } from '@/components/icons';

const useStyles = makeStyles({
  surface: {
    maxWidth: '400px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  warningIcon: {
    color: tokens.colorPaletteRedForeground1,
  },
  content: {
    color: tokens.colorNeutralForeground2,
  },
  destructiveButton: {
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    '&:hover': {
      backgroundColor: tokens.colorPaletteRedForeground1,
    },
  },
});

export interface ConfirmDialogProps {
  /** Title of the confirmation dialog */
  title: string;
  /** Message explaining what will happen */
  message: string;
  /** Text for the confirm button (default: "Delete") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when user confirms the action */
  onConfirm: () => void;
  /** Whether the confirm action is in progress */
  isLoading?: boolean;
  /** Variant for styling (default: "danger") */
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  variant = 'danger',
}) => {
  const styles = useStyles();

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface className={styles.surface} aria-describedby="confirm-dialog-content">
        <DialogBody>
          <DialogTitle>
            <div className={styles.titleContainer}>
              {variant === 'danger' && (
                <WarningIcon className={styles.warningIcon} aria-hidden="true" />
              )}
              {title}
            </div>
          </DialogTitle>
          <DialogContent id="confirm-dialog-content" className={styles.content}>
            {message}
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              appearance="primary"
              className={variant === 'danger' ? styles.destructiveButton : undefined}
              onClick={handleConfirm}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ConfirmDialog;
