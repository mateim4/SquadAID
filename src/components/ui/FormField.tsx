/**
 * @file FormField.tsx
 * @description Standardized form field component with consistent styling,
 * validation states, and required field indicators.
 */

import React from 'react';
import {
  Label,
  Input,
  Textarea,
  Field,
  FieldProps,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  field: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalXS),
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalXXS),
  },
  required: {
    color: tokens.colorPaletteRedForeground1,
  },
  hint: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  errorMessage: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorPaletteRedForeground1,
  },
});

export interface FormFieldProps extends Omit<FieldProps, 'validationMessage'> {
  /** Label text for the field */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Hint text shown below the field */
  hint?: string;
  /** Error message to display */
  error?: string;
  /** Children (the actual input component) */
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  hint,
  error,
  children,
  ...fieldProps
}) => {
  const styles = useStyles();

  return (
    <Field
      {...fieldProps}
      className={styles.field}
      validationState={error ? 'error' : undefined}
      validationMessage={error}
    >
      <Label className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </Label>
      {children}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </Field>
  );
};

export default FormField;
