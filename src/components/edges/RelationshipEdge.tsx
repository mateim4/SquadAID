import React, { memo, useMemo, useCallback } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import {
  makeStyles,
  shorthands,
  tokens,
  Badge,
  Tooltip,
} from '@fluentui/react-components';
import {
  RelationshipMetadata,
  RelationshipType,
  RELATIONSHIP_STYLES,
} from '@/types/relationship';

const useStyles = makeStyles({
  edgeLabel: {
    position: 'absolute',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.padding('2px', '6px'),
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    pointerEvents: 'all',
    cursor: 'pointer',
    boxShadow: tokens.shadow4,
    transitionProperty: 'transform, box-shadow',
    transitionDuration: tokens.durationNormal,
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: tokens.shadow8,
    },
  },
  metricsBadge: {
    marginLeft: tokens.spacingHorizontalXS,
  },
});

interface RelationshipEdgeData extends RelationshipMetadata {
  /** Optional callback when edge label is clicked */
  onLabelClick?: () => void;
}

/**
 * Custom edge component for visualizing agent relationships
 * 
 * Features:
 * - Color-coded based on relationship type
 * - Animated for active relationships (delegation, supervision)
 * - Dashed lines for escalation and consultation
 * - Interactive label showing relationship type
 * - Metrics display on hover
 */
const RelationshipEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  selected,
}: EdgeProps<RelationshipEdgeData>) => {
  const styles = useStyles();
  
  // Get relationship styling
  const relationshipStyle = useMemo(() => {
    const type = data?.type ?? RelationshipType.DELEGATION;
    return RELATIONSHIP_STYLES[type];
  }, [data?.type]);
  
  // Calculate edge path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  // Compute edge style
  const computedStyle = useMemo(() => ({
    stroke: relationshipStyle.stroke,
    strokeWidth: selected ? relationshipStyle.strokeWidth + 1 : relationshipStyle.strokeWidth,
    strokeDasharray: relationshipStyle.strokeDasharray,
    ...style,
  }), [relationshipStyle, selected, style]);
  
  // Handle label click
  const handleLabelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    data?.onLabelClick?.();
  }, [data]);
  
  // Format metrics for tooltip
  const metricsTooltip = useMemo(() => {
    if (!data?.metrics) return null;
    
    const parts: string[] = [];
    if (data.metrics.totalInteractions !== undefined) {
      parts.push(`Interactions: ${data.metrics.totalInteractions}`);
    }
    if (data.metrics.successRate !== undefined) {
      parts.push(`Success: ${Math.round(data.metrics.successRate * 100)}%`);
    }
    if (data.metrics.avgResponseTime !== undefined) {
      parts.push(`Avg Time: ${Math.round(data.metrics.avgResponseTime / 1000)}s`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : null;
  }, [data?.metrics]);
  
  // Determine if bidirectional indicator should show
  const showBidirectional = data?.bidirectional === true;
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={computedStyle}
        markerEnd={markerEnd}
      />
      
      {/* Edge Label */}
      <EdgeLabelRenderer>
        <Tooltip
          content={
            <div>
              <div><strong>{relationshipStyle.label}</strong></div>
              {data?.description && <div>{data.description}</div>}
              {metricsTooltip && <div style={{ marginTop: 4 }}>{metricsTooltip}</div>}
              {showBidirectional && <div style={{ marginTop: 4 }}>↔ Bidirectional</div>}
              {!data?.autoApproval && <div style={{ marginTop: 4 }}>⏳ Requires approval</div>}
            </div>
          }
          relationship="description"
        >
          <div
            className={styles.edgeLabel}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              borderLeft: `3px solid ${relationshipStyle.stroke}`,
            }}
            onClick={handleLabelClick}
          >
            {relationshipStyle.label}
            {showBidirectional && ' ↔'}
            {data?.metrics?.totalInteractions !== undefined && (
              <Badge
                size="tiny"
                appearance="filled"
                className={styles.metricsBadge}
              >
                {data.metrics.totalInteractions}
              </Badge>
            )}
          </div>
        </Tooltip>
      </EdgeLabelRenderer>
    </>
  );
});

RelationshipEdge.displayName = 'RelationshipEdge';

export default RelationshipEdge;
