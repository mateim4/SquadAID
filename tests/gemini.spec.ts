import { test, expect } from '@playwright/test';

test.describe('Gemini node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure we're on the Team Builder page where canvas & agent library exist
    const builderTab = page.getByRole('tab', { name: 'Team Builder' });
    if (await builderTab.isVisible()) {
      await builderTab.click();
      // Wait for the agent library to be visible
      await page.getByLabel('Agent library').waitFor({ state: 'visible' });
    }
  });

  test('add Gemini node via Agent Library and configure', async ({ page }) => {
    // Trigger agent select event to add Gemini node
    await page.evaluate(() => {
      const evt = new CustomEvent('squad-agent-select', { detail: { agentId: 'gemini' } });
      window.dispatchEvent(evt as any);
    });

    // Verify Gemini node appears
    const nodeHeader = page.getByText('Gemini CLI Agent');
    await expect(nodeHeader).toBeVisible({ timeout: 5000 });

    // Open config modal
    const configBtn = page.getByRole('button', { name: /Configure Gemini/i }).first();
    await expect(configBtn).toBeVisible();
    await configBtn.click();

    const modelInput = page.getByLabel('Gemini model');
    const flagsInput = page.getByLabel('Gemini flags');

    await expect(modelInput).toBeVisible();
    await expect(flagsInput).toBeVisible();

    // Set values and save
    await modelInput.fill('gemini-1.0');
    await flagsInput.fill('--temperature 0.1');
    await page.getByRole('button', { name: 'Save' }).click();

    // Modal should close
    await expect(page.getByText('Gemini Configuration')).toHaveCount(0);

    // Prompt input exists and can be used
    const promptArea = page.getByPlaceholder('Enter prompt for Gemini...');
    await expect(promptArea).toBeVisible();
    await promptArea.fill('Hello Gemini');

    // We won't run the CLI here to avoid requiring a local gemini binary; just verify the Run button becomes enabled
    const runBtn = page.getByRole('button', { name: 'Run' });
    await expect(runBtn).toBeEnabled();
  });
});