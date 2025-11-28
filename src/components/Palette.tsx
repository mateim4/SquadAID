import { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Tab,
  TabList,
  Badge,
  Tooltip,
  Divider,
} from '@fluentui/react-components';
import {
  Bot24Regular,
  Person24Regular,
  Person24Filled,
  People24Regular,
  Building24Regular,
  Code24Regular,
  CheckmarkCircle24Regular,
  Search24Filled,
  DesignIdeas24Regular,
  Briefcase24Regular,
  Info16Regular,
  Sparkle24Regular,
} from '@fluentui/react-icons';
import { useRoleStore, useRolesArray } from '@/store/roleStore';
import { Role } from '@/types/role';

const useStyles = makeStyles({
  palette: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke2),
    width: '280px',
    backgroundColor: tokens.colorNeutralBackground2,
    height: '100%',
    ...shorthands.overflow('hidden'),
  },
  header: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
  },
  tabList: {
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalM),
    overflowY: 'auto',
    flexGrow: 1,
  },
  sectionTitle: {
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalXS),
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  paletteItem: {
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    transitionProperty: 'all',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: tokens.shadow4,
      transform: 'translateX(2px)',
    },
    ':active': {
      cursor: 'grabbing',
    },
  },
  paletteItemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    flexShrink: 0,
  },
  paletteItemContent: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
  paletteItemName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    whiteSpace: 'nowrap',
    ...shorthands.overflow('hidden'),
    textOverflow: 'ellipsis',
  },
  paletteItemDescription: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    ...shorthands.overflow('hidden'),
    textOverflow: 'ellipsis',
  },
  roleItem: {
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    transitionProperty: 'all',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: tokens.shadow4,
    },
  },
  roleIcon: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    flexShrink: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingVerticalL),
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

/**
 * Icon mapping for roles.
 */
const roleIcons: Record<string, React.FC<{ style?: React.CSSProperties }>> = {
  Building: Building24Regular,
  Code: Code24Regular,
  CheckmarkCircle: CheckmarkCircle24Regular,
  People: People24Regular,
  Search: Search24Filled,
  DesignIdeas: DesignIdeas24Regular,
  Briefcase: Briefcase24Regular,
};

/**
 * Agent node type definitions for the palette.
 */
const agentNodes = [
  {
    type: 'enhancedAgent',
    name: 'Enhanced Agent',
    description: 'Full-featured agent with roles, status & capabilities',
    icon: Sparkle24Regular,
    color: tokens.colorPalettePurpleBackground2,
  },
  {
    type: 'assistantAgent',
    name: 'Assistant Agent',
    description: 'AI-powered agent with configurable provider',
    icon: Bot24Regular,
    color: tokens.colorBrandBackground,
  },
  {
    type: 'userProxyAgent',
    name: 'User Proxy',
    description: 'Human-in-the-loop terminal node',
    icon: Person24Regular,
    color: tokens.colorPaletteGreenBackground3,
  },
];

/**
 * Props for the Palette component.
 */
interface PaletteProps {
  /** Callback when a role is dragged for assignment */
  onRoleDragStart?: (role: Role, event: React.DragEvent) => void;
}

/**
 * The Palette component displays draggable node types and roles
 * that can be added to the workflow canvas.
 */
const Palette: React.FC<PaletteProps> = ({ onRoleDragStart }) => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<string>('agents');
  const roles = useRolesArray();
  const { loadBuiltInRoles, isLoading } = useRoleStore();

  // Load roles on mount
  useEffect(() => {
    loadBuiltInRoles();
  }, [loadBuiltInRoles]);

  /**
   * Handle drag start for agent nodes.
   */
  const onAgentDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Handle drag start for roles.
   */
  const onRoleDrag = (event: React.DragEvent, role: Role) => {
    // Use 'application/role' to match BuilderPage drop handler
    event.dataTransfer.setData('application/role', JSON.stringify(role));
    event.dataTransfer.effectAllowed = 'copy';
    onRoleDragStart?.(role, event);
  };

  /**
   * Get icon component for a role.
   */
  const getRoleIcon = (iconName?: string) => {
    return iconName ? roleIcons[iconName] : Info16Regular;
  };

  return (
    <aside className={styles.palette}>
      {/* Header with Tabs */}
      <div className={styles.header}>
        <TabList
          className={styles.tabList}
          selectedValue={selectedTab}
          onTabSelect={(_, data) => setSelectedTab(data.value as string)}
          size="small"
        >
          <Tab value="agents" icon={<Bot24Regular />}>
            Agents
          </Tab>
          <Tab value="roles" icon={<People24Regular />}>
            Roles
            <Badge 
              size="small" 
              appearance="filled" 
              color="informative"
              style={{ marginLeft: tokens.spacingHorizontalXS }}
            >
              {roles.length}
            </Badge>
          </Tab>
        </TabList>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {selectedTab === 'agents' && (
          <>
            <Text className={styles.sectionTitle}>Drag to Canvas</Text>
            {agentNodes.map((node) => {
              const IconComponent = node.icon;
              return (
                <Tooltip
                  key={node.type}
                  content={node.description}
                  relationship="description"
                  positioning="after"
                >
                  <div
                    className={styles.paletteItem}
                    onDragStart={(event) => onAgentDragStart(event, node.type)}
                    draggable
                  >
                    <div
                      className={styles.paletteItemIcon}
                      style={{ backgroundColor: `${node.color}20` }}
                    >
                      <IconComponent style={{ color: node.color }} />
                    </div>
                    <div className={styles.paletteItemContent}>
                      <Text className={styles.paletteItemName}>{node.name}</Text>
                      <Text className={styles.paletteItemDescription}>
                        {node.description}
                      </Text>
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </>
        )}

        {selectedTab === 'roles' && (
          <>
            <Text className={styles.sectionTitle}>
              Drag to assign role to agent
            </Text>
            
            {isLoading ? (
              <div className={styles.emptyState}>
                <Text>Loading roles...</Text>
              </div>
            ) : roles.length === 0 ? (
              <div className={styles.emptyState}>
                <People24Regular style={{ fontSize: '32px', marginBottom: tokens.spacingVerticalS }} />
                <Text>No roles available</Text>
              </div>
            ) : (
              roles.map((role) => {
                const IconComponent = getRoleIcon(role.icon);
                return (
                  <Tooltip
                    key={role.id}
                    content={
                      <div>
                        <Text weight="semibold">{role.name}</Text>
                        <br />
                        <Text size={200}>{role.attributes.description}</Text>
                        <br />
                        <Text size={100}>Authority: {role.attributes.authorityLevel}/5</Text>
                      </div>
                    }
                    relationship="description"
                    positioning="after"
                  >
                    <div
                      className={styles.roleItem}
                      onDragStart={(event) => onRoleDrag(event, role)}
                      draggable
                    >
                      <div
                        className={styles.roleIcon}
                        style={{
                          backgroundColor: role.color ? `${role.color}20` : tokens.colorBrandBackground2,
                        }}
                      >
                        <IconComponent
                          style={{
                            color: role.color || tokens.colorBrandForeground1,
                            fontSize: '16px',
                          }}
                        />
                      </div>
                      <div className={styles.paletteItemContent}>
                        <Text className={styles.paletteItemName}>{role.name}</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
                          <Badge
                            size="tiny"
                            appearance="tint"
                            color={role.isBuiltIn ? 'brand' : 'subtle'}
                          >
                            {role.isBuiltIn ? 'Built-in' : 'Custom'}
                          </Badge>
                          <Badge size="tiny" appearance="outline">
                            L{role.attributes.authorityLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                );
              })
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default Palette;