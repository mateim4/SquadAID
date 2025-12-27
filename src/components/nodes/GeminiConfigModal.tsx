import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Label,
  Input,
  Textarea,
  makeStyles,
  shorthands,
  tokens,
  Text,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  dialogSurface: {
    maxWidth: '480px',
    width: '100%',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
});

interface Props {
  isOpen: boolean;
  model?: string;
  flags?: string;
  onClose: () => void;
  onSave: (cfg: { model: string; flags?: string }) => void;
}

export const GeminiConfigModal: React.FC<Props> = ({ isOpen, model = 'gemini-1.5-pro', flags = '', onClose, onSave }) => {
  const styles = useStyles();
  const [modelVal, setModelVal] = useState(model);
  const [flagsVal, setFlagsVal] = useState(flags);

  const handleSave = useCallback(() => {
    onSave({ model: modelVal, flags: flagsVal });
    onClose();
  }, [modelVal, flagsVal, onClose, onSave]);

  return (
    <Dialog open={isOpen} onOpenChange={(_, { open }) => !open && onClose()}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogTitle
          action={
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
          }
        >
          Gemini Configuration
        </DialogTitle>
        <DialogBody>
          <DialogContent>
            <div className={styles.row}>
              <Label>Model</Label>
              <Input value={modelVal} onChange={(e, d) => setModelVal(d.value)} aria-label="Gemini model" />
              <Label>Flags</Label>
              <Textarea value={flagsVal} onChange={(e, d) => setFlagsVal(d.value)} rows={3} aria-label="Gemini flags" />
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                Example flags: --model gemini-1.5-pro --temperature 0.2
              </Text>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="subtle" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" onClick={handleSave}>Save</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default GeminiConfigModal;