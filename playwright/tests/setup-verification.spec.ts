import { test, expect } from "@playwright/test";

test.describe("Playwright Setup Verification", () => {
  test("basic Playwright functionality test", async ({ page }) => {
    // Navigate to a simple test page
    await page.goto(
      'data:text/html,<html><body><h1>Test Page</h1><button id="testBtn">Click me</button></body></html>'
    );

    // Verify page content
    await expect(page.locator("h1")).toHaveText("Test Page");

    // Test interaction
    await page.click("#testBtn");

    // Verify button exists and is clickable
    await expect(page.locator("#testBtn")).toBeVisible();
  });

  test("test data attributes selector helper", async ({ page }) => {
    // Create a test page with data-testid attributes
    await page.goto(`data:text/html,
      <html>
        <body>
          <div data-testid="main-content">Main Content</div>
          <button data-testid="submit-button">Submit</button>
          <input data-testid="text-input" type="text" />
        </body>
      </html>
    `);

    // Test our helper function (simulate it since we can't import in this test)
    const getByTestId = (testId: string) => page.locator(`[data-testid="${testId}"]`);

    // Verify elements can be found
    await expect(getByTestId("main-content")).toHaveText("Main Content");
    await expect(getByTestId("submit-button")).toBeVisible();
    await expect(getByTestId("text-input")).toBeVisible();

    // Test interaction
    await getByTestId("text-input").fill("test value");
    await expect(getByTestId("text-input")).toHaveValue("test value");
  });

  test("cross-browser compatibility check", async ({ browserName, page }) => {
    // Test browser-specific behavior
    console.log(`Running test in ${browserName}`);

    await page.goto("data:text/html,<html><body><h1>Browser Test</h1></body></html>");

    // Verify basic functionality works across browsers
    await expect(page.locator("h1")).toBeVisible();

    // Test JavaScript execution (without storage access on data URLs)
    const result = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        browserSupportsModernFeatures:
          typeof Promise !== "undefined" && typeof fetch !== "undefined",
      };
    });

    expect(result.userAgent).toBeTruthy();
    expect(result.browserSupportsModernFeatures).toBe(true);
  });

  test("mobile viewport simulation", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`data:text/html,
      <html>
        <head>
          <style>
            .mobile-only { display: none; }
            @media (max-width: 400px) {
              .mobile-only { display: block; }
              .desktop-only { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="mobile-only">Mobile View</div>
          <div class="desktop-only">Desktop View</div>
        </body>
      </html>
    `);

    // Verify mobile-specific content is shown
    await expect(page.locator(".mobile-only")).toBeVisible();

    // Verify viewport size
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    expect(viewport?.height).toBe(667);
  });
});
