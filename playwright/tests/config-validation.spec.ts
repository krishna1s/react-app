import { test, expect } from '@playwright/test';

test.describe('Basic Configuration Test', () => {
  test('should validate Playwright configuration', async ({ page }) => {
    // This is a simple test to verify the Playwright setup is working
    
    // Test that we can navigate to a basic page
    await page.goto('https://example.com');
    
    // Verify the page loads
    await expect(page).toHaveTitle(/Example Domain/);
    
    // Verify we can find basic elements
    await expect(page.locator('h1')).toContainText('Example Domain');
  });

  test('should have correct configuration values', async ({ page }) => {
    // Verify viewport size
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    
    // Verify we have a user agent
    const userAgent = await page.evaluate(() => navigator.userAgent);
    expect(userAgent).toBeTruthy();
    
    // Verify JavaScript is enabled
    const jsEnabled = await page.evaluate(() => {
      return typeof window !== 'undefined';
    });
    expect(jsEnabled).toBe(true);
  });
});