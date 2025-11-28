import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Label,
  Select,
  Slider,
  Switch,
  Input,
  Textarea,
  makeStyles,
  shorthands,
  tokens,
  Text,
  Divider,
  Badge,
  RadioGroup,
  Radio,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  ArrowRight24Regular,
  ArrowsBidirectional24Regular,
  Info24Regular,
} from '@fluentui/react-icons';
import {
  RelationshipType,
  RelationshipMetadata,
  RelationshipEdge,
  RELATIONSHIP_STYLES,
  createDefaultRelationship,
} from '@/types/relationship';

interface RelationshipConfigModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when relationship is saved */
  onSave: (edge: RelationshipEdge) => void;
  /** Source node name for display */
  sourceNodeName: string;
  /** Target node name for display */
  targetNodeName: string;
  /** Source node ID */
  sourceNodeId: string;
  /** Target node ID */
  targetNodeId: string;
  /** Existing edge data (for editing) */
  existingEdge?: RelationshipEdge;
}

const useStyles = makeStyles({
  dialogSurface: {
    maxWidth: '540px',
    width: '100%',
  },
  dialogBody: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  relationshipPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.gap(tokens.spacingHorizontalM),
    ...shorthands.padding(tokens.spacingVerticalM),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  nodeBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    minWidth: '100px',
  },
  arrowContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingVerticalXS),
  },
  relationshipLine: {
    height: '3px',
    width: '60px',
    ...shorthands.borderRadius('2px'),
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  typeCard: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    cursor: 'pointer',
    transitionProperty: 'border-color, background-color',
    transitionDuration: tokens.durationNormal,
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  typeCardSelected: {
    ...shorthands.border('2px', 'solid', tokens.colorBrandStroke1),
    backgroundColor: tokens.colorNeutralBackground2,
  },
  typeIndicator: {
    width: '8px',
    height: '8px',
    ...shorthands.borderRadius('50%'),
    marginRight: tokens.spacingHorizontalXS,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalM),
  },
  sliderLabel: {
    minWidth: '120px',
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalXS, 0),
  },
  infoText: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    marginTop: tokens.spacingVerticalXS,
  },
});

/**
 * Get human-readable description for relationship type
 */
const getRelationshipDescription = (type: RelationshipType): string => {
  const descriptions: Record<RelationshipType, string> = {
    [RelationshipType.DELEGATION]: 'Source agent can assign tasks to target agent',
    [RelationshipType.COLLABORATION]: 'Agents work together as equals on shared tasks',
    [RelationshipType.REVIEW]: 'Source agent reviews and approves target\'s work',
    [RelationshipType.ESCALATION]: 'Source agent can escalate issues to target agent',
    [RelationshipType.CONSULTATION]: 'Source agent can request advice from target',
    [RelationshipType.DEPENDENCY]: 'Source agent depends on target agent\'s output',
    [RelationshipType.SUPERVISION]: 'Source agent supervises target agent\'s work',
  };
  return descriptions[type];
};

/**
 * RelationshipConfigModal - Modal for configuring agent relationships
 * 
 * Allows users to:
 * - Select relationship type (delegation, collaboration, review, etc.)
 * - Configure authority levels
 * - Set bidirectional flow
 * - Configure auto-approval
 * - Set interaction limits
 */
export function RelationshipConfigModal({
  isOpen,
  onClose,
  onSave,
  sourceNodeName,
  targetNodeName,
  sourceNodeId,
  targetNodeId,
  existingEdge,
}: RelationshipConfigModalProps) {
  const styles = useStyles();
  
  // Initialize state from existing edge or defaults
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(
    existingEdge?.data?.type ?? RelationshipType.DELEGATION
  );
  const [authorityDelta, setAuthorityDelta] = useState<number>(
    existingEdge?.data?.authorityDelta ?? 1
  );
  const [bidirectional, setBidirectional] = useState<boolean>(
    existingEdge?.data?.bidirectional ?? false
  );
  const [autoApproval, setAutoApproval] = useState<boolean>(
    existingEdge?.data?.autoApproval ?? true
  );
  const [maxInteractions, setMaxInteractions] = useState<string>(
    existingEdge?.data?.maxInteractionsPerWorkflow?.toString() ?? ''
  );
  const [description, setDescription] = useState<string>(
    existingEdge?.data?.description ?? ''
  );
  const [priority, setPriority] = useState<number>(
    existingEdge?.data?.priority ?? 0
  );
  
  // Get current style for preview
  const currentStyle = useMemo(() => 
    RELATIONSHIP_STYLES[relationshipType], 
    [relationshipType]
  );
  
  // Handle type selection
  const handleTypeSelect = useCallback((type: RelationshipType) => {
    setRelationshipType(type);
    // Apply default values for the new type
    const defaults = createDefaultRelationship(type);
    setAuthorityDelta(defaults.authorityDelta);
    setBidirectional(defaults.bidirectional);
    setAutoApproval(defaults.autoApproval);
  }, []);
  
  // Handle save
  const handleSave = useCallback(() => {
    const metadata: RelationshipMetadata = {
      type: relationshipType,
      authorityDelta,
      bidirectional,
      autoApproval,
      maxInteractionsPerWorkflow: maxInteractions ? parseInt(maxInteractions, 10) : null,
      priority,
      description: description || undefined,
    };
    
    const edge: RelationshipEdge = {
      id: existingEdge?.id ?? `e-${sourceNodeId}-${targetNodeId}`,
      source: sourceNodeId,
      target: targetNodeId,
      type: 'relationship',
      animated: currentStyle.animated,
      data: metadata,
      style: {
        stroke: currentStyle.stroke,
        strokeWidth: currentStyle.strokeWidth,
        ...(currentStyle.strokeDasharray && { strokeDasharray: currentStyle.strokeDasharray }),
      },
      label: currentStyle.label,
    };
    
    onSave(edge);
    onClose();
  }, [
    relationshipType,
    authorityDelta,
    bidirectional,
    autoApproval,
    maxInteractions,
    priority,
    description,
    existingEdge,
    sourceNodeId,
    targetNodeId,
    currentStyle,
    onSave,
    onClose,
  ]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(_, { open }) => !open && onClose()}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogTitle
          action={
            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={onClose}
            />
          }
        >
          {existingEdge ? 'Edit Relationship' : 'Configure Relationship'}
        </DialogTitle>
        
        <DialogBody className={styles.dialogBody}>
          <DialogContent>
            {/* Relationship Preview */}
            <div className={styles.section}>
              <Label>Relationship Preview</Label>
              <div className={styles.relationshipPreview}>
                <div className={styles.nodeBox}>
                  <Text size={200} weight="semibold">{sourceNodeName}</Text>
                  <Text size={100}>Source</Text>
                </div>
                
                <div className={styles.arrowContainer}>
                  {bidirectional ? (
                    <ArrowsBidirectional24Regular />
                  ) : (
                    <ArrowRight24Regular />
                  )}
                  <div 
                    className={styles.relationshipLine}
                    style={{ backgroundColor: currentStyle.stroke }}
                  />
                  <Badge size="small" appearance="outline">
                    {currentStyle.label}
                  </Badge>
                </div>
                
                <div className={styles.nodeBox}>
                  <Text size={200} weight="semibold">{targetNodeName}</Text>
                  <Text size={100}>Target</Text>
                </div>
              </div>
            </div>
            
            <Divider />
            
            {/* Relationship Type Selection */}
            <div className={styles.section}>
              <Label>Relationship Type</Label>
              <div className={styles.typeGrid}>
                {Object.values(RelationshipType).map((type) => {
                  const style = RELATIONSHIP_STYLES[type];
                  const isSelected = type === relationshipType;
                  
                  return (
                    <div
                      key={type}
                      className={`${styles.typeCard} ${isSelected ? styles.typeCardSelected : ''}`}
                      onClick={() => handleTypeSelect(type)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          className={styles.typeIndicator}
                          style={{ backgroundColor: style.stroke }}
                        />
                        <Text size={200} weight="semibold">{style.label}</Text>
                      </div>
                      <Text size={100} className={styles.infoText}>
                        {getRelationshipDescription(type)}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Divider />
            
            {/* Configuration Options */}
            <div className={styles.section}>
              <Label>Configuration</Label>
              
              {/* Authority Delta */}
              <div className={styles.sliderRow}>
                <Label className={styles.sliderLabel}>Authority Delta</Label>
                <Slider
                  min={-5}
                  max={5}
                  step={1}
                  value={authorityDelta}
                  onChange={(_, data) => setAuthorityDelta(data.value)}
                  style={{ flex: 1 }}
                />
                <Text size={200} style={{ minWidth: '30px', textAlign: 'right' }}>
                  {authorityDelta > 0 ? `+${authorityDelta}` : authorityDelta}
                </Text>
              </div>
              <Text className={styles.infoText}>
                {authorityDelta > 0 
                  ? `${sourceNodeName} has higher authority than ${targetNodeName}`
                  : authorityDelta < 0
                    ? `${targetNodeName} has higher authority than ${sourceNodeName}`
                    : 'Both agents have equal authority'
                }
              </Text>
              
              {/* Bidirectional Toggle */}
              <div className={styles.switchRow}>
                <div>
                  <Text size={200}>Bidirectional</Text>
                  <Text className={styles.infoText}>Allow interactions in both directions</Text>
                </div>
                <Switch
                  checked={bidirectional}
                  onChange={(_, data) => setBidirectional(data.checked)}
                />
              </div>
              
              {/* Auto-Approval Toggle */}
              <div className={styles.switchRow}>
                <div>
                  <Text size={200}>Auto-Approval</Text>
                  <Text className={styles.infoText}>Target automatically accepts requests</Text>
                </div>
                <Switch
                  checked={autoApproval}
                  onChange={(_, data) => setAutoApproval(data.checked)}
                />
              </div>
              
              {/* Max Interactions */}
              <div>
                <Label htmlFor="max-interactions">Max Interactions per Workflow</Label>
                <Input
                  id="max-interactions"
                  type="number"
                  min={0}
                  value={maxInteractions}
                  onChange={(_, data) => setMaxInteractions(data.value)}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              
              {/* Priority */}
              <div className={styles.sliderRow}>
                <Label className={styles.sliderLabel}>Priority</Label>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={priority}
                  onChange={(_, data) => setPriority(data.value)}
                  style={{ flex: 1 }}
                />
                <Text size={200} style={{ minWidth: '30px', textAlign: 'right' }}>
                  {priority}
                </Text>
              </div>
              <Text className={styles.infoText}>
                Higher priority relationships are processed first
              </Text>
            </div>
            
            <Divider />
            
            {/* Description */}
            <div className={styles.section}>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(_, data) => setDescription(data.value)}
                placeholder="Describe the purpose of this relationship..."
                rows={2}
                resize="vertical"
              />
            </div>
          </DialogContent>
        </DialogBody>
        
        <DialogActions>
          <Button appearance="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button appearance="primary" onClick={handleSave}>
            {existingEdge ? 'Update' : 'Create'} Relationship
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}

export default RelationshipConfigModal;
