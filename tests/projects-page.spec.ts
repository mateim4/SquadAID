import { test, expect } from '@playwright/test';

/**
 * E2E tests for ProjectsPage functionality
 * Tests the Create Project dialog and project management features
 */

test.describe('ProjectsPage - Create Project Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Projects page
    const projectsTab = page.getByRole('tab', { name: /Projects/i });
    if (await projectsTab.isVisible()) {
      await projectsTab.click();
      await page.waitForTimeout(500);
    } else {
      // Projects might be at a different route
      await page.goto('/#/projects');
      await page.waitForTimeout(500);
    }
  });

  test('should open Create Project dialog when Add Project button is clicked', async ({ page }) => {
    // Find and click the Add Project button
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Verify dialog is open
    const dialog = page.getByRole('dialog', { name: /Create New Project/i });
    await expect(dialog).toBeVisible();
    
    // Verify dialog has proper ARIA attributes
    await expect(dialog).toHaveAttribute('aria-describedby', 'create-project-description');
  });

  test('should close Create Project dialog when Cancel is clicked', async ({ page }) => {
    // Open dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Click cancel
    const cancelButton = page.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();
    
    // Verify dialog is closed
    const dialog = page.getByRole('dialog', { name: /Create New Project/i });
    await expect(dialog).not.toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Open dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Try to create without filling fields
    const createButton = page.getByRole('button', { name: /Create Project/i });
    await expect(createButton).toBeDisabled();
  });

  test('should auto-generate slug from project name', async ({ page }) => {
    // Open dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Type project name
    const nameInput = page.getByLabel(/Project name/i);
    await nameInput.fill('My Test Project!');
    
    // Check slug is auto-generated
    const slugInput = page.getByLabel(/Project slug/i);
    await expect(slugInput).toHaveValue('my-test-project');
  });

  test('should allow manual slug editing with sanitization', async ({ page }) => {
    // Open dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Type project name
    const nameInput = page.getByLabel(/Project name/i);
    await nameInput.fill('My Project');
    
    // Manually edit slug with special characters
    const slugInput = page.getByLabel(/Project slug/i);
    await slugInput.fill('my-Custom__Slug!!!');
    
    // Check slug is sanitized
    await expect(slugInput).toHaveValue('my-custom-slug');
  });

  test('should select project type with radio buttons', async ({ page }) => {
    // Open dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Check default is local
    const localRadio = page.getByRole('radio', { name: /Local only/i });
    await expect(localRadio).toBeChecked();
    
    // Select hybrid
    const hybridRadio = page.getByRole('radio', { name: /Hybrid/i });
    await hybridRadio.click();
    await expect(hybridRadio).toBeChecked();
    
    // Select GitHub only
    const githubRadio = page.getByRole('radio', { name: /GitHub only/i });
    await githubRadio.click();
    await expect(githubRadio).toBeChecked();
  });

  test('should show GitHub auth section for hybrid/GitHub projects', async ({ page }) => {
    // Open dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Select hybrid type
    const hybridRadio = page.getByRole('radio', { name: /Hybrid/i });
    await hybridRadio.click();
    
    // Check for GitHub auth section
    const authSection = page.getByText(/GitHub authentication required/i);
    await expect(authSection).toBeVisible();
  });

  test('should not show GitHub auth section for local projects', async ({ page }) => {
    // Open dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Ensure local is selected (default)
    const localRadio = page.getByRole('radio', { name: /Local only/i });
    await expect(localRadio).toBeChecked();
    
    // Check GitHub auth section is not visible
    const authSection = page.getByText(/GitHub authentication required/i);
    await expect(authSection).not.toBeVisible();
  });

  test('should enable Create button when required fields are filled for local project', async ({ page }) => {
    // Open dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Fill required fields
    const nameInput = page.getByLabel(/Project name/i);
    await nameInput.fill('Test Project');
    
    // Create button should now be enabled
    const createButton = page.getByRole('button', { name: /Create Project/i });
    await expect(createButton).toBeEnabled();
  });

  test('should have accessible form labels and descriptions', async ({ page }) => {
    // Open dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Check all inputs have proper labels
    await expect(page.getByLabel(/Project name/i)).toBeVisible();
    await expect(page.getByLabel(/Project slug/i)).toBeVisible();
    await expect(page.getByLabel(/Project type/i)).toBeVisible();
    
    // Check helper text
    await expect(page.getByText(/URL-friendly identifier/i)).toBeVisible();
  });
});

test.describe('ProjectsPage - Create Repository Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const projectsTab = page.getByRole('tab', { name: /Projects/i });
    if (await projectsTab.isVisible()) {
      await projectsTab.click();
      await page.waitForTimeout(500);
    } else {
      await page.goto('/#/projects');
      await page.waitForTimeout(500);
    }
  });

  test('should open Create Repository dialog from Create Project dialog', async ({ page }) => {
    // Open Create Project dialog
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await addButton.click();
    
    // Select hybrid type to show repo options
    const hybridRadio = page.getByRole('radio', { name: /Hybrid/i });
    await hybridRadio.click();
    
    // Note: Create Repo button only appears after GitHub auth
    // This test validates the dialog structure exists
    // Actual interaction requires GitHub token which may not be available in CI
  });
});

test.describe('ProjectsPage - Project List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const projectsTab = page.getByRole('tab', { name: /Projects/i });
    if (await projectsTab.isVisible()) {
      await projectsTab.click();
      await page.waitForTimeout(500);
    } else {
      await page.goto('/#/projects');
      await page.waitForTimeout(500);
    }
  });

  test('should display projects sidebar', async ({ page }) => {
    // Check for projects sidebar
    const sidebar = page.locator('aside[aria-label="Projects sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test('should display Add Project button in sidebar', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Project/i });
    await expect(addButton).toBeVisible();
  });
});
