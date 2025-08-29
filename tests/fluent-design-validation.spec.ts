import { test, expect } from '@playwright/test';

test.describe('Fluent 2 Design System Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should capture current design state and analyze Fluent 2 DS compliance', async ({ page }) => {
    // Take a screenshot of the current state for comparison
    await page.screenshot({ path: 'design-analysis/current-state.png', fullPage: true });
    
    // Analyze header/title bar design
    const titleBar = page.locator('.titleBar, [class*="titleBar"]');
    await expect(titleBar).toBeVisible();
    
    // Check for proper acrylic/glass effects
    const titleBarStyles = await titleBar.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        backdropFilter: styles.backdropFilter,
        background: styles.background,
        boxShadow: styles.boxShadow,
        opacity: styles.opacity
      };
    });
    
    console.log('Title Bar Styles:', titleBarStyles);
    
    // Analyze palette design
    const palette = page.locator('.palette, [class*="palette"]');
    await expect(palette).toBeVisible();
    
    const paletteStyles = await palette.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        backdropFilter: styles.backdropFilter,
        background: styles.background,
        boxShadow: styles.boxShadow,
        opacity: styles.opacity
      };
    });
    
    console.log('Palette Styles:', paletteStyles);
    
    // Test agent cards for proper Fluent 2 styling
    const agentCards = page.locator('[class*="agentCard"]');
    const cardCount = await agentCards.count();
    console.log(`Found ${cardCount} agent cards`);
    
    if (cardCount > 0) {
      const firstCard = agentCards.first();
      const cardStyles = await firstCard.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          backdropFilter: styles.backdropFilter,
          background: styles.background,
          boxShadow: styles.boxShadow,
          borderRadius: styles.borderRadius,
          opacity: styles.opacity
        };
      });
      
      console.log('Agent Card Styles:', cardStyles);
      
      // Test hover states
      await firstCard.hover();
      await page.screenshot({ path: 'design-analysis/card-hover-state.png' });
    }
    
    // Test theme switching
    const themeButton = page.locator('button[title*="Switch to"], button[title*="Dark"], button[title*="Light"]');
    if (await themeButton.count() > 0) {
      await themeButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'design-analysis/dark-theme-state.png', fullPage: true });
      
      // Switch back
      await themeButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should test drag and drop interactions with design analysis', async ({ page }) => {
    // Wait for the palette to be loaded
    const palette = page.locator('.palette, [class*="palette"]');
    await expect(palette).toBeVisible();
    
    // Find an agent card to drag
    const agentCards = page.locator('[class*="agentCard"]');
    const firstCard = agentCards.first();
    await expect(firstCard).toBeVisible();
    
    // Get the canvas area
    const canvas = page.locator('[class*="builder-page-container"], .react-flow');
    await expect(canvas).toBeVisible();
    
    // Perform drag and drop
    await firstCard.dragTo(canvas);
    
    // Wait for any animations
    await page.waitForTimeout(1000);
    
    // Take screenshot of result
    await page.screenshot({ path: 'design-analysis/after-drag-drop.png', fullPage: true });
    
    // Check if nodes were created and analyze their styling
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();
    console.log(`Found ${nodeCount} nodes after drag and drop`);
    
    if (nodeCount > 0) {
      const firstNode = nodes.first();
      const nodeStyles = await firstNode.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          backdropFilter: styles.backdropFilter,
          background: styles.background,
          boxShadow: styles.boxShadow,
          borderRadius: styles.borderRadius,
          opacity: styles.opacity,
          transform: styles.transform
        };
      });
      
      console.log('Node Styles:', nodeStyles);
    }
  });

  test('should analyze color usage against Fluent 2 DS palette', async ({ page }) => {
    // Get all elements with significant styling
    const elements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const styleData = [];
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const color = styles.color;
        const boxShadow = styles.boxShadow;
        
        if (bgColor !== 'rgba(0, 0, 0, 0)' || color !== 'rgb(0, 0, 0)' || boxShadow !== 'none') {
          styleData.push({
            tag: el.tagName,
            className: el.className,
            backgroundColor: bgColor,
            color: color,
            boxShadow: boxShadow
          });
        }
      });
      
      return styleData;
    });
    
    console.log('Color Usage Analysis:', elements.slice(0, 20)); // Log first 20 for brevity
    
    // Create a visual color palette analysis
    await page.screenshot({ path: 'design-analysis/color-analysis.png', fullPage: true });
  });
});

test.describe('Fluent 2 DS Implementation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should validate proper acrylic materials', async ({ page }) => {
    // Check for proper backdrop-filter usage
    const acrylicElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const acrylicElements = [];
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.backdropFilter && styles.backdropFilter !== 'none') {
          acrylicElements.push({
            element: el.tagName + '.' + el.className,
            backdropFilter: styles.backdropFilter,
            backgroundColor: styles.backgroundColor,
            opacity: styles.opacity
          });
        }
      });
      
      return acrylicElements;
    });
    
    console.log('Acrylic Elements Found:', acrylicElements);
    
    // Expect some elements to have backdrop-filter for proper acrylic effect
    expect(acrylicElements.length).toBeGreaterThan(0);
  });

  test('should validate proper depth and layering', async ({ page }) => {
    // Check z-index layering
    const layering = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const layeredElements = [];
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const zIndex = styles.zIndex;
        const position = styles.position;
        
        if (zIndex !== 'auto' && position !== 'static') {
          layeredElements.push({
            element: el.tagName + '.' + el.className,
            zIndex: zIndex,
            position: position,
            boxShadow: styles.boxShadow
          });
        }
      });
      
      return layeredElements.sort((a, b) => parseInt(b.zIndex) - parseInt(a.zIndex));
    });
    
    console.log('Layering Analysis:', layering);
    
    // Take screenshot for visual depth analysis
    await page.screenshot({ path: 'design-analysis/depth-layering.png', fullPage: true });
  });
});