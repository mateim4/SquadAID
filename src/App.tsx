import React, { useEffect, useState } from 'react';
import {
  FluentProvider,
  TabList,
  Tab,
  Title3,
  Tooltip,
    ToggleButton,
} from '@fluentui/react-components';
import {
    LightModeIcon,
    DarkModeIcon,
    PlaygroundIcon,
    ProjectsIcon,
    TeamBuilderIcon,
    AnalyticsIcon,
    SettingsIcon,
} from '@/components/icons';
import { useStyles } from '@/styles/useStyles';
import { squadAIDLightTheme, squadAIDDarkTheme } from '@/styles/themes';
import { AnimatedBackground } from '@/components/background/AnimatedBackground';
import { AgentLibrary } from '@/components/layout/AgentLibrary';
import { WorkflowLibrary } from '@/components/layout/WorkflowLibrary';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';
import PlaygroundPage from '@/views/PlaygroundPage';
import AnalyticsPage from '@/views/AnalyticsPage';
import { HealthIndicator } from '@/components/status/HealthIndicator';
import SettingsPage from '@/pages/SettingsPage';
import ProjectsPage from '@/pages/ProjectsPage';
import { initializeFromBackend } from '@/services/syncService';
import { useRoleStore } from '@/store/roleStore';
import { SkipLink } from '@/components/ui';
import { iconSizes } from '@/styles/designTokens';

const App: React.FC = () => {
    const styles = useStyles();
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [selectedTab, setSelectedTab] = useState('team-builder');
    const [isInitialized, setIsInitialized] = useState(false);
    const loadBuiltInRoles = useRoleStore((state) => state.loadBuiltInRoles);

    // Initialize stores and load data from backend
    useEffect(() => {
        const init = async () => {
            try {
                // Load built-in roles first
                await loadBuiltInRoles();
                // Then initialize from backend
                await initializeFromBackend();
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize app:', error);
                setIsInitialized(true); // Continue anyway
            }
        };
        init();
    }, [loadBuiltInRoles]);

    // Sync tab with hash routing (e.g., #/playground)
    useEffect(() => {
        const applyHash = () => {
            const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
            if (hash === 'playground' && selectedTab !== 'playground') setSelectedTab('playground');
            else if (hash === 'analytics' && selectedTab !== 'analytics') setSelectedTab('analytics');
            else if ((hash === 'projects' || hash === 'project') && selectedTab !== 'projects') setSelectedTab('projects');
            else if ((hash === 'team' || hash === 'team-builder' || hash === 'builder') && selectedTab !== 'team-builder') setSelectedTab('team-builder');
            else if (hash === 'settings' && selectedTab !== 'settings') setSelectedTab('settings');
        };
        applyHash();
        window.addEventListener('hashchange', applyHash);
        return () => window.removeEventListener('hashchange', applyHash);
    }, [selectedTab]);

    const onTabSelect = (_: any, data: any) => {
        const value = data.value as string;
        setSelectedTab(value);
    const nextHash = value === 'playground' ? '#/playground' : value === 'analytics' ? '#/analytics' : value === 'projects' ? '#/projects' : value === 'settings' ? '#/settings' : '#/team-builder';
        if (window.location.hash !== nextHash) window.location.hash = nextHash;
    };
    // Team Builder sidebars are fixed width (non-collapsible) per design system

    const theme = isDarkTheme ? squadAIDDarkTheme : squadAIDLightTheme;

    return (
        <FluentProvider theme={theme} className="accent-gradient">
            <SkipLink targetId="main-content" />
            <div className={`${styles.root} ${isDarkTheme ? styles.rootDark : styles.rootLight}`}>
                <AnimatedBackground isDarkTheme={isDarkTheme}/>
                <div className={styles.mainUI}>
                                        <header className={`${styles.header} ${isDarkTheme ? styles.headerDark : styles.headerLight}`} role="banner">
                                                <div className={styles.headerTitle}>
                                                     <AnalyticsIcon fontSize={iconSizes.xl} aria-hidden="true" />
                                                     <Title3 style={{ fontSize: 22 }}>SquadAID</Title3>
                                                </div>
                                                <nav role="navigation" aria-label="Main navigation">
                                                <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
                                                        <Tab value="projects" className={styles.tab} icon={<ProjectsIcon fontSize={iconSizes.lg} aria-hidden="true" />}>Projects</Tab>
                                                        <Tab value="team-builder" className={styles.tab} icon={<TeamBuilderIcon fontSize={iconSizes.lg} aria-hidden="true" />}>Team Builder</Tab>
                                                        <Tab value="playground" className={styles.tab} icon={<PlaygroundIcon fontSize={iconSizes.lg} aria-hidden="true" />}>Playground</Tab>
                                                        <Tab value="analytics" className={styles.tab} icon={<AnalyticsIcon fontSize={iconSizes.lg} aria-hidden="true" />}>Analytics</Tab>
                                                    <Tab value="settings" className={styles.tab} icon={<SettingsIcon fontSize={iconSizes.lg} aria-hidden="true" />}>Settings</Tab>
                                                </TabList>
                                                </nav>
                                                <div className={styles.headerControls}>
                                                    <HealthIndicator />
                                                    <Tooltip content={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"} relationship="label">
                                                        <ToggleButton 
                                                                checked={!isDarkTheme} 
                                                                onClick={() => setIsDarkTheme(!isDarkTheme)} 
                                                                icon={isDarkTheme ? <DarkModeIcon /> : <LightModeIcon />}
                                                                aria-label={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                                                title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                                                style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }}
                                                         />
                                                    </Tooltip>
                                                </div>
                                        </header>

                    <main id="main-content" className={styles.mainContent} role="main">
                        {selectedTab === 'team-builder' && (
                            <>
                                <AgentLibrary />
                                <WorkflowCanvas />
                                <WorkflowLibrary />
                            </>
                        )}
                                                {selectedTab === 'projects' && (
                                                    <ProjectsPage
                                                        render={({ left, content, right }) => (
                                                            <>
                                                                {/* reuse Team Builder grid with sidebars */}
                                                                <div aria-hidden style={{ display: 'contents' }} />
                                                                {left}
                                                                {content}
                                                                {right}
                                                            </>
                                                        )}
                                                    />
                                                )}
                        {selectedTab === 'playground' && <PlaygroundPage />}
                        {selectedTab === 'analytics' && <AnalyticsPage />}
                        {selectedTab === 'settings' && <SettingsPage />}
                    </main>
                </div>
            </div>
        </FluentProvider>
    );
};

export default App;
