/**
 * @file RoleLibrary.tsx
 * @description Role library component for browsing, previewing, and assigning roles to agents.
 * Uses Fluent UI v9 components and follows the established design system.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  Badge,
  Button,
  Input,
  Dropdown,
  Option,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  MessageBar,
  MessageBarBody,
  Divider,
  Tag,
  TagGroup,
} from '@fluentui/react-components';
import {
  Search24Regular,
  Filter24Regular,
  Building24Regular,
  Code24Regular,
  CheckmarkCircle24Regular,
  People24Regular,
  Search24Filled,
  DesignIdeas24Regular,
  Briefcase24Regular,
  Add24Regular,
  Info24Regular,
} from '@fluentui/react-icons';
import { useRoleStore, useRolesArray } from '@/store/roleStore';
import { Role, RoleCategory, RoleSummary, toRoleSummary } from '@/types/role';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...shorthands.gap(tokens.spacingVerticalM),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  filters: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalM),
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
  },
  searchInput: {
    minWidth: '200px',
  },
  categoryFilter: {
    minWidth: '150px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    ...shorthands.gap(tokens.spacingHorizontalM),
    ...shorthands.padding(tokens.spacingVerticalM),
    overflowY: 'auto',
    flexGrow: 1,
  },
  card: {
    cursor: 'pointer',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    marginRight: tokens.spacingHorizontalS,
  },
  cardContent: {
    ...shorthands.padding(tokens.spacingVerticalM),
  },
  description: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    ...shorthands.overflow('hidden'),
  },
  badgeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap(tokens.spacingHorizontalXS),
    marginTop: tokens.spacingVerticalS,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding(tokens.spacingVerticalXXL),
    color: tokens.colorNeutralForeground2,
  },
  // Dialog styles
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalXS),
  },
  detailLabel: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  detailValue: {
    color: tokens.colorNeutralForeground2,
  },
  processList: {
    listStyle: 'decimal',
    marginLeft: tokens.spacingHorizontalL,
    color: tokens.colorNeutralForeground2,
  },
  artifactList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalXS),
  },
  artifactItem: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
  },
  tagGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap(tokens.spacingHorizontalXS),
  },
});

/**
 * Icon mapping for roles.
 */
const roleIcons: Record<string, React.FC<{ className?: string }>> = {
  Building: Building24Regular,
  Code: Code24Regular,
  CheckmarkCircle: CheckmarkCircle24Regular,
  People: People24Regular,
  Search: Search24Filled,
  DesignIdeas: DesignIdeas24Regular,
  Briefcase: Briefcase24Regular,
};

/**
 * Category display names.
 */
const categoryNames: Record<RoleCategory, string> = {
  engineering: 'Engineering',
  management: 'Management',
  design: 'Design',
  research: 'Research',
  operations: 'Operations',
  quality: 'Quality',
  custom: 'Custom',
};

/**
 * Props for RoleLibrary component.
 */
interface RoleLibraryProps {
  /** Callback when a role is selected for assignment */
  onRoleSelect?: (role: Role) => void;
  /** Whether to show the assign button */
  showAssignButton?: boolean;
  /** Compact mode for sidebar */
  compact?: boolean;
}

/**
 * RoleLibrary component for browsing and managing roles.
 */
export const RoleLibrary: React.FC<RoleLibraryProps> = ({
  onRoleSelect,
  showAssignButton = false,
  compact = false,
}) => {
  const styles = useStyles();
  const roles = useRolesArray();
  const { loadBuiltInRoles, isLoading, error, selectRole, selectedRoleId } = useRoleStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RoleCategory | 'all'>('all');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<Role | null>(null);

  // Load built-in roles on mount
  useEffect(() => {
    loadBuiltInRoles();
  }, [loadBuiltInRoles]);

  // Filter roles based on search and category
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      // Category filter
      if (categoryFilter !== 'all' && role.category !== categoryFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = role.name.toLowerCase().includes(query);
        const matchesDescription = role.attributes.description.toLowerCase().includes(query);
        const matchesTags = role.attributes.tags?.some((tag) => 
          tag.toLowerCase().includes(query)
        );
        return matchesName || matchesDescription || matchesTags;
      }
      
      return true;
    });
  }, [roles, searchQuery, categoryFilter]);

  // Handle card click
  const handleCardClick = useCallback((role: Role) => {
    setSelectedRoleForDetail(role);
    setDetailDialogOpen(true);
  }, []);

  // Handle role selection for assignment
  const handleAssignRole = useCallback((role: Role) => {
    onRoleSelect?.(role);
    setDetailDialogOpen(false);
  }, [onRoleSelect]);

  // Get icon component for a role
  const getRoleIcon = (iconName?: string) => {
    const IconComponent = iconName ? roleIcons[iconName] : Info24Regular;
    return IconComponent || Info24Regular;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Spinner size="large" label="Loading roles..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <People24Regular />
          <Text weight="semibold" size={500}>
            Role Library
          </Text>
          <Badge appearance="filled" color="informative">
            {roles.length}
          </Badge>
        </div>
        <Button
          appearance="subtle"
          icon={<Add24Regular />}
          disabled // TODO: Implement custom role creation
        >
          Create Role
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <Input
          className={styles.searchInput}
          contentBefore={<Search24Regular />}
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e, data) => setSearchQuery(data.value)}
        />
        <Dropdown
          className={styles.categoryFilter}
          placeholder="All Categories"
          value={categoryFilter === 'all' ? 'All Categories' : categoryNames[categoryFilter]}
          onOptionSelect={(e, data) => 
            setCategoryFilter(data.optionValue as RoleCategory | 'all')
          }
        >
          <Option value="all">All Categories</Option>
          {(Object.keys(categoryNames) as RoleCategory[]).map((cat) => (
            <Option key={cat} value={cat}>
              {categoryNames[cat]}
            </Option>
          ))}
        </Dropdown>
      </div>

      {/* Role Grid */}
      {filteredRoles.length === 0 ? (
        <div className={styles.emptyState}>
          <Search24Regular style={{ fontSize: '48px', marginBottom: tokens.spacingVerticalM }} />
          <Text size={400}>No roles found</Text>
          <Text size={200}>Try adjusting your search or filters</Text>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredRoles.map((role) => {
            const IconComponent = getRoleIcon(role.icon);
            return (
              <Card
                key={role.id}
                className={styles.card}
                onClick={() => handleCardClick(role)}
              >
                <CardHeader
                  image={
                    <div
                      className={styles.cardIcon}
                      style={{ backgroundColor: role.color ? `${role.color}20` : tokens.colorBrandBackground2 }}
                    >
                      <IconComponent style={{ color: role.color || tokens.colorBrandForeground1 }} />
                    </div>
                  }
                  header={<Text weight="semibold">{role.name}</Text>}
                  action={
                    <Badge
                      appearance="outline"
                      color={role.isBuiltIn ? 'brand' : 'subtle'}
                      size="small"
                    >
                      {role.isBuiltIn ? 'Built-in' : 'Custom'}
                    </Badge>
                  }
                />
                <CardPreview className={styles.cardContent}>
                  <Text className={styles.description}>
                    {role.attributes.description}
                  </Text>
                  <div className={styles.badgeContainer}>
                    <Badge size="small" appearance="tint" color="informative">
                      Authority: {role.attributes.authorityLevel}/5
                    </Badge>
                    {role.category && (
                      <Badge size="small" appearance="tint">
                        {categoryNames[role.category]}
                      </Badge>
                    )}
                  </div>
                </CardPreview>
              </Card>
            );
          })}
        </div>
      )}

      {/* Role Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={(e, data) => setDetailDialogOpen(data.open)}>
        <DialogSurface style={{ maxWidth: '600px' }}>
          {selectedRoleForDetail && (
            <>
              <DialogBody>
                <DialogTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                    {(() => {
                      const IconComponent = getRoleIcon(selectedRoleForDetail.icon);
                      return (
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: tokens.borderRadiusMedium,
                            backgroundColor: selectedRoleForDetail.color 
                              ? `${selectedRoleForDetail.color}20` 
                              : tokens.colorBrandBackground2,
                          }}
                        >
                          <IconComponent 
                            style={{ 
                              color: selectedRoleForDetail.color || tokens.colorBrandForeground1,
                              fontSize: '24px',
                            }} 
                          />
                        </div>
                      );
                    })()}
                    {selectedRoleForDetail.name}
                  </div>
                </DialogTitle>
                <DialogContent className={styles.dialogContent}>
                  {/* Description */}
                  <div className={styles.detailSection}>
                    <Text className={styles.detailLabel}>Description</Text>
                    <Text className={styles.detailValue}>
                      {selectedRoleForDetail.attributes.description}
                    </Text>
                  </div>

                  <Divider />

                  {/* Objectives */}
                  <div className={styles.detailSection}>
                    <Text className={styles.detailLabel}>Objectives</Text>
                    <Text className={styles.detailValue}>
                      {selectedRoleForDetail.attributes.objectives}
                    </Text>
                  </div>

                  {/* Process Steps */}
                  <div className={styles.detailSection}>
                    <Text className={styles.detailLabel}>Process Steps</Text>
                    <ol className={styles.processList}>
                      {selectedRoleForDetail.attributes.processSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <Divider />

                  {/* Metadata */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                    <div className={styles.detailSection}>
                      <Text className={styles.detailLabel}>Authority Level</Text>
                      <Badge appearance="filled" color="brand" size="large">
                        {selectedRoleForDetail.attributes.authorityLevel} / 5
                      </Badge>
                    </div>
                    <div className={styles.detailSection}>
                      <Text className={styles.detailLabel}>Interaction Types</Text>
                      <div className={styles.tagGroup}>
                        {selectedRoleForDetail.attributes.interactionTypes.map((type) => (
                          <Tag key={type} size="small" appearance="outline">
                            {type}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expected Artifacts */}
                  {selectedRoleForDetail.attributes.expectedArtifacts.length > 0 && (
                    <div className={styles.detailSection}>
                      <Text className={styles.detailLabel}>Expected Artifacts</Text>
                      <div className={styles.artifactList}>
                        {selectedRoleForDetail.attributes.expectedArtifacts.map((artifact, index) => (
                          <div key={index} className={styles.artifactItem}>
                            <Badge 
                              appearance="tint" 
                              color={artifact.required ? 'important' : 'subtle'}
                              size="small"
                            >
                              {artifact.format}
                            </Badge>
                            <Text size={200}>{artifact.type}</Text>
                            {artifact.required && (
                              <Badge appearance="outline" color="danger" size="small">
                                Required
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills/Tags */}
                  {selectedRoleForDetail.attributes.skills && 
                   selectedRoleForDetail.attributes.skills.length > 0 && (
                    <div className={styles.detailSection}>
                      <Text className={styles.detailLabel}>Skills</Text>
                      <div className={styles.tagGroup}>
                        {selectedRoleForDetail.attributes.skills.map((skill) => (
                          <Tag key={skill} size="small">
                            {skill}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button appearance="secondary" onClick={() => setDetailDialogOpen(false)}>
                    Close
                  </Button>
                  {showAssignButton && (
                    <Button 
                      appearance="primary" 
                      onClick={() => handleAssignRole(selectedRoleForDetail)}
                    >
                      Assign Role
                    </Button>
                  )}
                </DialogActions>
              </DialogBody>
            </>
          )}
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default RoleLibrary;
