import React, { useMemo, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from 'reactflow';
import { makeStyles, tokens, shorthands, Button, Input, Tooltip } from '@fluentui/react-components';
import { useWorkflowStore } from '@/store/workflowStore';

const useStyles = makeStyles({
  chip: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    background: tokens.colorNeutralBackground3,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    ...shorthands.padding('2px', tokens.spacingHorizontalXS),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: tokens.shadow4,
    pointerEvents: 'all',
  },
  dot: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: tokens.colorPaletteBlueBackground2,
    border: `2px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
  },
});

export default function ConditionalEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }: EdgeProps) {
  const styles = useStyles();
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const updateEdgeData = useWorkflowStore(s => s.updateEdgeData);

  const [edgePath, labelX, labelY] = useMemo(() => getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }), [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const edgeStyle = useMemo<React.CSSProperties>(() => ({
    stroke: tokens.colorNeutralStroke1Hover,
    strokeWidth: 4,
    strokeDasharray: '6 6',
  }), []);

  const condition = (data as any)?.condition || '';

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <BaseEdge id={id} path={edgePath} style={{ ...edgeStyle, ...style }} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div style={{ position: 'absolute', left: labelX, top: labelY, pointerEvents: 'all' }}>
          {!editing && (
            <div className={styles.chip}>
              {condition ? (
                <>
                  <Tooltip content={condition} relationship="description">
                    <span style={{ fontSize: 12, color: tokens.colorNeutralForeground2 }}>if</span>
                  </Tooltip>
                  <Button size="small" onClick={() => setEditing(true)}>Edit</Button>
                </>
              ) : (
                hovered && <div className={styles.dot} onClick={() => setEditing(true)} />
              )}
            </div>
          )}
          {editing && (
            <div className={styles.chip}>
              <Input
                appearance="filled-darker"
                placeholder="Condition, e.g., result.contains('OK')"
                defaultValue={condition}
                onBlur={(e) => { updateEdgeData(id, { condition: e.currentTarget.value }); setEditing(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { updateEdgeData(id, { condition: (e.target as HTMLInputElement).value }); setEditing(false); }}}
              />
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </g>
  );
}