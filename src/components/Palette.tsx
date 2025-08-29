import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Title3,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  palette: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalM),
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke1),
    width: '280px',
    backgroundColor: tokens.colorNeutralBackground2,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    position: 'relative',
    zIndex: 50,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.colorNeutralStroke2} transparent`,
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: tokens.colorNeutralStroke2,
      borderRadius: '3px',
      '&:hover': {
        backgroundColor: tokens.colorNeutralStroke1,
      },
    },
  },
  title: {
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    textAlign: 'center',
  },
  paletteItem: {
    cursor: 'grab',
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    textAlign: 'center',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground1,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      transition: 'left 0.5s ease',
    },
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      transform: 'translateY(-2px) scale(1.02)',
      borderColor: tokens.colorNeutralStroke1,
      '&::before': {
        left: '100%',
      },
    },
    '&:active': {
      transform: 'translateY(0) scale(0.98)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      cursor: 'grabbing',
    },
    '&:focus-visible': {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '2px',
    },
  },
  paletteItemDragging: {
    opacity: 0.7,
    transform: 'rotate(5deg) scale(1.05)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    cursor: 'grabbing',
  },
});

/**
 * The Palette component displays a list of available node types that can be
 * dragged onto the canvas.
 *
 * @description
 * This component uses the standard HTML5 Drag-and-Drop API with enhanced UX.
 * - `onDragStart`: When a drag operation begins, this function is called. It uses
 *   `event.dataTransfer.setData` to store the `nodeType` (e.g., 'assistantAgent')
 *   and a custom MIME type 'application/reactflow'. This data is then accessible
 *   in the `onDrop` event handler on the canvas.
 * - `draggable`: This standard HTML attribute is set to `true` to make the
 *   elements draggable.
 * - Enhanced with modern drag feedback and smooth animations.
 */
const Palette = () => {
  const styles = useStyles();
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedItem(nodeType);
    
    // Add some visual feedback
    event.dataTransfer.setDragImage(event.currentTarget as Element, 0, 0);
  };

  const onDragEnd = () => {
    setDraggedItem(null);
  };

  const agentItems = [
    { type: 'claudeAgent', label: '🧠 Claude Agent', description: 'Advanced reasoning' },
    { type: 'localOllamaAgent', label: '🖥️ Local Ollama Agent', description: 'Local AI processing' },
    { type: 'localMSTYAgent', label: '⚡ Local MSTY Agent', description: 'High-performance local' },
    { type: 'julesAgent', label: '🔍 Jules Coding Agent', description: 'Async coding via Google' },
    { type: 'copilotAgent', label: '🚀 GitHub Copilot Agent', description: 'Async coding via GitHub' },
    { type: 'customAgent', label: '🔧 Custom Agent', description: 'Configurable workflows' },
    { type: 'userProxyAgent', label: '👤 User Proxy Agent', description: 'User representation' },
  ];

  return (
    <aside className={styles.palette}>
      <Title3 className={styles.title}>TeamAID Agents</Title3>
      {agentItems.map((item) => (
        <div
          key={item.type}
          className={`${styles.paletteItem} ${
            draggedItem === item.type ? styles.paletteItemDragging : ''
          }`}
          onDragStart={(event) => onDragStart(event, item.type)}
          onDragEnd={onDragEnd}
          draggable
          title={item.description}
          tabIndex={0}
          role="button"
          aria-label={`Drag ${item.label} to canvas`}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              // Could implement keyboard support for adding nodes
              event.preventDefault();
            }
          }}
        >
          {item.label}
        </div>
      ))}
    </aside>
  );
};

export default Palette;