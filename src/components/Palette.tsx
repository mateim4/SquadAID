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
    backdropFilter: 'blur(20px)',
    position: 'relative',
    zIndex: 10,
    boxShadow: tokens.shadow8,
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
      ...shorthands.borderRadius(tokens.borderRadiusSmall),
      '&:hover': {
        backgroundColor: tokens.colorNeutralStroke1,
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
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
      boxShadow: tokens.shadow4,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'scale(0.98)',
      cursor: 'grabbing',
    },
  },
  agentHeader: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
  },
  agentIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
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