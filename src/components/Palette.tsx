import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Title3,
  Caption1,
  Card,
  CardHeader,
} from '@fluentui/react-components';
import {
  Bot24Regular,
  PersonCircle24Regular,
  CodeBlock24Regular,
  Cloud24Regular,
  Laptop24Regular,
  Rocket24Regular,
  Branch24Regular,
  Wrench24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  palette: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalL),
    width: '320px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke2),
    backdropFilter: 'blur(80px) saturate(200%)',
    WebkitBackdropFilter: 'blur(80px) saturate(200%)',
    position: 'relative',
    zIndex: 10,
    boxShadow: `0 0 0 0.5px ${tokens.colorNeutralStroke1}, 0 12px 48px ${tokens.colorNeutralShadowKey}, 0 4px 16px ${tokens.colorNeutralShadowAmbient}, inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.05)`,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.colorNeutralStroke2} transparent`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: `linear-gradient(135deg, ${tokens.colorBrandBackground}08 0%, transparent 30%, ${tokens.colorBrandBackground}04 70%, transparent 100%)`,
      pointerEvents: 'none',
      opacity: 0.6,
    },
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: tokens.colorBrandBackground2,
      ...shorthands.borderRadius(tokens.borderRadiusSmall),
      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
      '&:hover': {
        backgroundColor: tokens.colorBrandBackground,
        boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 8px ${tokens.colorBrandShadowAmbient}`,
      },
    },
  },
  header: {
    ...shorthands.margin('0', '0', tokens.spacingVerticalL, '0'),
  },
  title: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase500,
    textShadow: `0 2px 4px ${tokens.colorNeutralShadowAmbient}`,
    position: 'relative',
    transition: 'all 0.3s ease-in-out',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-4px',
      left: '0',
      width: '0%',
      height: '2px',
      background: `linear-gradient(90deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
      transition: 'width 0.3s ease-in-out',
    },
    '&:hover': {
      transform: 'translateY(-1px)',
      textShadow: `0 4px 8px ${tokens.colorBrandShadowAmbient}`,
      '&::after': {
        width: '100%',
      },
    },
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    ...shorthands.margin(tokens.spacingVerticalXS, '0', '0', '0'),
  },
  agentGrid: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  agentCard: {
    cursor: 'grab',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px) saturate(120%)',
    WebkitBackdropFilter: 'blur(10px) saturate(120%)',
    boxShadow: `0 0 0 0.5px ${tokens.colorNeutralStroke1}, 0 1px 2px ${tokens.colorNeutralShadowAmbient}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${tokens.colorBrandBackground}30, transparent)`,
      transition: 'left 0.6s ease-in-out',
    },
    '&:hover': {
      backgroundColor: `${tokens.colorNeutralBackground1}40`,
      ...shorthands.border('2px', 'solid', tokens.colorBrandStroke2),
      boxShadow: `0 0 0 1px ${tokens.colorBrandStroke1}, 0 4px 12px ${tokens.colorBrandShadowAmbient}, 0 8px 24px ${tokens.colorBrandShadowKey}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
      backdropFilter: 'blur(20px) saturate(150%)',
      WebkitBackdropFilter: 'blur(20px) saturate(150%)',
      '&::before': {
        left: '100%',
      },
    },
    '&:active': {
      transform: 'scale(0.96)',
      cursor: 'grabbing',
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  agentHeader: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
  },
  agentIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    zIndex: 2,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '0px',
      height: '0px',
      background: `radial-gradient(circle, ${tokens.colorBrandBackground}40, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.4s ease-out',
      zIndex: -1,
    },
    '&:hover': {
      transform: 'scale(1.1) rotate(5deg)',
      filter: `drop-shadow(0 4px 12px ${tokens.colorBrandShadowAmbient})`,
      '&::before': {
        width: '40px',
        height: '40px',
      },
    },
  },
  agentTitle: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    ...shorthands.margin('0'),
  },
  agentDescription: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    ...shorthands.margin(tokens.spacingVerticalXS, '0', '0', '0'),
  },
});

interface AgentItem {
  type: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
}

const agentItems: AgentItem[] = [
  {
    type: 'userProxyAgent',
    title: 'User Proxy',
    description: 'Human interface agent for manual oversight',
    icon: <PersonCircle24Regular />,
    color: tokens.colorBrandBackground,
  },
  {
    type: 'claudeAgent',
    title: 'Claude Assistant',
    description: 'Advanced reasoning and code generation',
    icon: <Bot24Regular />,
    color: tokens.colorPaletteOrangeBackground,
  },
  {
    type: 'localOllamaAgent',
    title: 'Local Ollama',
    description: 'Privacy-focused local AI processing',
    icon: <Laptop24Regular />,
    color: tokens.colorPaletteGreenBackground,
  },
  {
    type: 'localMSTYAgent',
    title: 'Local MSTY',
    description: 'High-performance local inference',
    icon: <Rocket24Regular />,
    color: tokens.colorPalettePurpleBackground,
  },
  {
    type: 'julesAgent',
    title: 'Jules Coder',
    description: 'Async multi-file implementation',
    icon: <CodeBlock24Regular />,
    color: tokens.colorPaletteBlueBackground,
  },
  {
    type: 'copilotAgent',
    title: 'GitHub Copilot',
    description: 'Code completion and PR management',
    icon: <Branch24Regular />,
    color: tokens.colorPaletteYellowBackground,
  },
  {
    type: 'customAgent',
    title: 'Custom Agent',
    description: 'Configurable specialist agent',
    icon: <Wrench24Regular />,
    color: tokens.colorPaletteRedBackground,
  },
];

/**
 * Component representing a draggable agent item in the palette
 */
const AgentItem: React.FC<{ agent: AgentItem }> = ({ agent }) => {
  const styles = useStyles();
  
  const onDragStart = (event: React.DragEvent) => {
    console.log('Drag start for agent:', agent.type);
    event.dataTransfer.setData('application/reactflow', agent.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card
      className={styles.agentCard}
      draggable
      onDragStart={onDragStart}
      appearance="filled-alternative"
    >
      <CardHeader
        image={<span className={styles.agentIcon}>{agent.icon}</span>}
        header={<div className={styles.agentTitle}>{agent.title}</div>}
        description={<Caption1 className={styles.agentDescription}>{agent.description}</Caption1>}
        className={styles.agentHeader}
      />
    </Card>
  );
};

/**
 * The main palette component containing all draggable agent types
 */
const Palette: React.FC = () => {
  const styles = useStyles();

  return (
    <aside className={styles.palette}>
      <div className={styles.header}>
        <Title3 className={styles.title}>Agent Library</Title3>
        <Caption1 className={styles.subtitle}>
          Drag agents onto the canvas to build your workflow
        </Caption1>
      </div>
      
      <div className={styles.agentGrid}>
        {agentItems.map((agent) => (
          <AgentItem key={agent.type} agent={agent} />
        ))}
      </div>
    </aside>
  );
};

export default Palette;