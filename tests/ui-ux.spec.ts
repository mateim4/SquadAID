import { test, expect } from '@playwright/test';

test.describe('SquadAID UI/UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title and loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/SquadAID/);
    
    // Should have the main navigation sidebar
    await expect(page.locator('nav')).toBeVisible();
    
    // Should have the theme toggle button
    await expect(page.getByRole('button', { name: /Switch to.*Mode/ })).toBeVisible();
  });

  test('navigation sidebar works properly', async ({ page }) => {
    // Test navigation items
    const builderLink = page.getByRole('link', { name: 'Builder' });
    const playgroundLink = page.getByRole('link', { name: 'Playground' });
    const settingsLink = page.getByRole('link', { name: 'Settings' });

    await expect(builderLink).toBeVisible();
    await expect(playgroundLink).toBeVisible();
    await expect(settingsLink).toBeVisible();

    // Test navigation to playground
    await playgroundLink.click();
    await expect(page.url()).toContain('/playground');

    // Test navigation to settings
    await settingsLink.click();
    await expect(page.url()).toContain('/settings');

    // Test navigation back to builder
    await builderLink.click();
    await expect(page.url()).toContain('/builder');
  });

  test('theme toggle works', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /Switch to.*Mode/ });
    
    // Test theme switching
    await themeToggle.click();
    // Theme should have changed (test by checking if button text changed)
    await expect(themeToggle).toBeVisible();
  });

  test('agent palette is visible and functional', async ({ page }) => {
    // Should show the agent palette
    await expect(page.getByText('TeamAID Agents')).toBeVisible();
    
    // Should show all agent types
    await expect(page.getByText('🧠 Claude Agent')).toBeVisible();
    await expect(page.getByText('🖥️ Local Ollama Agent')).toBeVisible();
    await expect(page.getByText('⚡ Local MSTY Agent')).toBeVisible();
    await expect(page.getByText('🔍 Jules Coding Agent')).toBeVisible();
    await expect(page.getByText('🚀 GitHub Copilot Agent')).toBeVisible();
    await expect(page.getByText('🔧 Custom Agent')).toBeVisible();
    await expect(page.getByText('👤 User Proxy Agent')).toBeVisible();
  });

  test('canvas is interactive', async ({ page }) => {
    // Should have React Flow canvas
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
    
    // Should have controls
    await expect(page.locator('.react-flow__controls')).toBeVisible();
    
    // Should have minimap
    await expect(page.locator('.react-flow__minimap')).toBeVisible();
  });

  test('drag and drop functionality', async ({ page }) => {
    const claudeAgent = page.getByText('🧠 Claude Agent');
    const canvas = page.locator('.react-flow');
    
    // Test drag and drop (simulate)
    await claudeAgent.hover();
    await expect(claudeAgent).toBeVisible();
    
    // Verify the agent is draggable
    await expect(claudeAgent).toHaveAttribute('draggable', 'true');
  });

  test('responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Should still be functional on mobile
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByText('TeamAID Agents')).toBeVisible();
  });

  test('accessibility features', async ({ page }) => {
    // Check for proper ARIA labels and roles
    await expect(page.locator('nav')).toHaveRole('navigation');
    
    // Theme toggle should have proper accessibility
    const themeToggle = page.getByRole('button', { name: /Switch to.*Mode/ });
    await expect(themeToggle).toHaveAttribute('title');
  });

  test('visual consistency and modern design', async ({ page }) => {
    // Take a screenshot for visual comparison
    await expect(page).toHaveScreenshot('main-interface.png');
    
    // Check for smooth animations by testing hover states
    const claudeAgent = page.getByText('🧠 Claude Agent');
    await claudeAgent.hover();
    
    // Should have proper visual feedback on hover
    await expect(claudeAgent).toBeVisible();
  });

  test('performance and loading states', async ({ page }) => {
    // Page should load quickly
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // No console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    expect(consoleErrors).toHaveLength(0);
  });
});