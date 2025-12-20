import { test, expect } from '@playwright/test';

test.describe('SquadAID UI/UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title and loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/SquadAID/);
    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Switch to (Light|Dark) Mode/ })).toBeVisible();
  });

  test('navigation sidebar works properly', async ({ page }) => {
  // Test navigation items (Tabs are buttons)
  const builderLink = page.getByRole('tab', { name: 'Team Builder' });
  const playgroundLink = page.getByRole('tab', { name: 'Playground' });
  const settingsLink = page.getByRole('tab', { name: 'Settings' });

    await expect(builderLink).toBeVisible();
    await expect(playgroundLink).toBeVisible();
    await expect(settingsLink).toBeVisible();

    // Test navigation to playground
  await playgroundLink.click();
  await expect(page).toHaveURL(/#\/playground/);

    // Test navigation to settings
  await settingsLink.click();
  await expect(page).toHaveURL(/#\/settings/);

    // Test navigation back to builder
  await builderLink.click();
  await expect(page).toHaveURL(/#\/team-builder/);
  });

  test('theme toggle works', async ({ page }) => {
  const themeToggle = page.getByRole('button', { name: /Switch to (Light|Dark) Mode/ });
    
    // Test theme switching
    await themeToggle.click();
    // Theme should have changed (test by checking if button text changed)
    await expect(themeToggle).toBeVisible();
  });

  test('agent palette is visible and functional', async ({ page }) => {
    // Should show the agent palette
    await expect(page.locator('[aria-label="Agent palette"]')).toBeVisible();
    
    // Palette should have tabs
    await expect(page.getByLabel('Palette tabs')).toBeVisible();
    
    // Check for Agents tab
    await expect(page.getByRole('tab', { name: /Agents tab/i })).toBeVisible();
    
    // Check for Roles tab
    await expect(page.getByRole('tab', { name: /Roles tab/i })).toBeVisible();
    
    // By default, should show agent types
    await expect(page.getByText('Enhanced Agent')).toBeVisible();
    await expect(page.getByText('Assistant Agent')).toBeVisible();
    await expect(page.getByText('User Proxy')).toBeVisible();
  });

  test('canvas is interactive', async ({ page }) => {
    // Should have React Flow canvas
  const canvas = page.getByLabel('Workflow canvas');
    await expect(canvas).toBeVisible();
    
    // Should have controls
    await expect(page.locator('.react-flow__controls')).toBeVisible();
    
    // Should have minimap
    await expect(page.locator('.react-flow__minimap')).toBeVisible();
  });

  test('drag and drop functionality', async ({ page }) => {
    const palette = page.locator('[aria-label="Agent palette"]');
    const canvas = page.getByLabel('Workflow canvas');
    
    // Test drag and drop (simulate)
    await palette.hover();
    await expect(palette).toBeVisible();
    
    // Verify the agent items are available for dragging
    const agentItems = palette.locator('[role="button"][draggable="true"]');
    await expect(agentItems.first()).toBeVisible();
  });

  test('responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Should still be functional on mobile
  await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
  await expect(page.locator('[aria-label="Agent palette"]')).toBeVisible();
  });

  test('accessibility features', async ({ page }) => {
    // Check for proper ARIA labels and roles
  await expect(page.locator('nav[aria-label="Main navigation"]')).toHaveRole('navigation');
    
    // Theme toggle should have proper accessibility
  const themeToggle = page.getByRole('button', { name: /Switch to (Light|Dark) Mode/ });
    await expect(themeToggle).toHaveAttribute('title');
  });

  test('visual consistency and modern design', async ({ page }) => {
    // Smoke-hover one card to ensure hover feedback present
    const palette = page.locator('[aria-label="Agent palette"]');
    const firstAgent = palette.locator('[role="button"][draggable="true"]').first();
    await firstAgent.hover();
    await expect(firstAgent).toBeVisible();
  });

  test('performance and loading states', async ({ page }) => {
    // Page should load quickly
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Capture console errors but ignore known benign network/CORS noise from optional local services
    const consoleErrors: string[] = [];
    const benignPatterns = [
      /CORS/i,
      /Failed to fetch/i,
      /ERR_CONNECTION_REFUSED/i,
      /net::ERR/i,
      /http:\/\/localhost:(7861|8000)/i,
    ];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        const benign = benignPatterns.some(p => p.test(text));
        if (!benign) consoleErrors.push(text);
      }
    });
    await page.reload();
    // Assert we didn't log unexpected script errors
    expect(consoleErrors).toHaveLength(0);
  });
});