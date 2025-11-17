import React from 'react';
import { Node } from 'reactflow';

interface MinimapNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
  onClick?: (event: React.MouseEvent, nodeId: string) => void;
  node: Node;
}

const getNodeInfo = (nodeType: string) => {
  switch (nodeType) {
    case 'claudeAgent':
      return { symbol: '🤖', text: 'Claude', color: '#ff8c00', bgColor: '#fff5e6' };
    case 'userProxyAgent':
      return { symbol: '👤', text: 'User', color: '#6366f1', bgColor: '#f0f0ff' };
    case 'localOllamaAgent':
      return { symbol: '🖥️', text: 'Ollama', color: '#10b981', bgColor: '#f0fff4' };
    case 'localMSTYAgent':
      return { symbol: '🚀', text: 'MSTY', color: '#8b5cf6', bgColor: '#faf5ff' };
    case 'julesAgent':
      return { symbol: '⚡', text: 'Jules', color: '#3b82f6', bgColor: '#eff6ff' };
    case 'copilotAgent':
      return { symbol: '🔀', text: 'Copilot', color: '#f59e0b', bgColor: '#fffbeb' };
    case 'customAgent':
      return { symbol: '🔧', text: 'Custom', color: '#ef4444', bgColor: '#fef2f2' };
    default:
      return { symbol: '⭕', text: 'Node', color: '#6b7280', bgColor: '#f9fafb' };
  }
};

const MinimapNode: React.FC<MinimapNodeProps> = ({ x, y, width, height, selected, onClick, node }) => {
  const nodeInfo = getNodeInfo(node.type || 'default');
  const scale = Math.min(width / 100, height / 60); // Scale factor based on minimap size
  const fontSize = Math.max(6, 8 * scale);
  const symbolSize = Math.max(8, 12 * scale);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick ? (event) => onClick(event, node.id) : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Background rectangle */}
      <rect
        width={width}
        height={height}
        fill={nodeInfo.bgColor}
        stroke={selected ? '#4f46e5' : nodeInfo.color}
        strokeWidth={selected ? 2 : 1}
        rx={Math.max(2, 4 * scale)}
        ry={Math.max(2, 4 * scale)}
        opacity={0.9}
      />
      
      {/* Header bar */}
      <rect
        width={width}
        height={Math.max(8, 12 * scale)}
        fill={nodeInfo.color}
        rx={Math.max(2, 4 * scale)}
        ry={Math.max(2, 4 * scale)}
        opacity={0.8}
      />
      
      {/* Symbol */}
      <text
        x={width / 2}
        y={height / 2 + 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={symbolSize}
        fill={nodeInfo.color}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="600"
        opacity={0.9}
      >
        {nodeInfo.symbol}
      </text>
      
      {/* Label text */}
      {width > 30 && height > 25 && (
        <text
          x={width / 2}
          y={height - fontSize / 2 - 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fill={nodeInfo.color}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="500"
          opacity={0.8}
        >
          {nodeInfo.text}
        </text>
      )}
      
      {/* Selection indicator */}
      {selected && (
        <rect
          width={width}
          height={height}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={2}
          rx={Math.max(2, 4 * scale)}
          ry={Math.max(2, 4 * scale)}
          opacity={0.6}
          strokeDasharray="4,2"
        />
      )}
    </g>
  );
};

export default MinimapNode;