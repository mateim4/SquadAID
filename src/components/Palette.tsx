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
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke2),
    width: '250px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  paletteItem: {
    cursor: 'grab',
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    textAlign: 'center',
    transitionProperty: 'all',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: tokens.shadow4,
    },
  },
});

/**
 * The Palette component displays a list of available node types that can be
 * dragged onto the canvas.
 *
 * @description
 * This component uses the standard HTML5 Drag-and-Drop API.
 * - `onDragStart`: When a drag operation begins, this function is called. It uses
 *   `event.dataTransfer.setData` to store the `nodeType` (e.g., 'assistantAgent')
 *   and a custom MIME type 'application/reactflow'. This data is then accessible
 *   in the `onDrop` event handler on the canvas.
 * - `draggable`: This standard HTML attribute is set to `true` to make the
 *   elements draggable.
 */
const Palette = () => {
  const styles = useStyles();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className={styles.palette}>
      <Title3>TeamAID Agents</Title3>
      <div
        className={styles.paletteItem}
        onDragStart={(event) => onDragStart(event, 'claudeAgent')}
        draggable
      >
        🧠 Claude Agent
      </div>
      <div
        className={styles.paletteItem}
        onDragStart={(event) => onDragStart(event, 'localOllamaAgent')}
        draggable
      >
        🖥️ Local Ollama Agent
      </div>
      <div
        className={styles.paletteItem}
        onDragStart={(event) => onDragStart(event, 'localMSTYAgent')}
        draggable
      >
        ⚡ Local MSTY Agent
      </div>
      <div
        className={styles.paletteItem}
        onDragStart={(event) => onDragStart(event, 'julesAgent')}
        draggable
      >
        🔍 Jules Coding Agent
      </div>
      <div
        className={styles.paletteItem}
        onDragStart={(event) => onDragStart(event, 'copilotAgent')}
        draggable
      >
        🚀 GitHub Copilot Agent
      </div>
      <div
        className={styles.paletteItem}
        onDragStart={(event) => onDragStart(event, 'customAgent')}
        draggable
      >
        🔧 Custom Agent
      </div>
      <div
        className={styles.paletteItem}
        onDragStart={(event) => onDragStart(event, 'userProxyAgent')}
        draggable
      >
        👤 User Proxy Agent
      </div>
    </aside>
  );
};

export default Palette;