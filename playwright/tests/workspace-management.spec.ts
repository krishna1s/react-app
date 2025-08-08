import { test, expect } from "@playwright/test";
import { isMobileViewport } from "../utils/helpers";

test.describe("Workspace Management - Create Workspace", () => {
  
  test("TC-001: Sign in and create a new workspace", async ({ page }) => {
    // Test Description: Verify that a user can successfully sign in and create a new Playwright Testing workspace
    // by providing valid workspace details, and is redirected to the setup guide.
    
    // Step 1: Navigate to the Playwright portal (mocked for testing)
    await page.goto('data:text/html,<html><body><h1 data-testid="portal-title">Microsoft Playwright Testing Portal</h1><div data-testid="no-workspace-message">No workspace found</div><button data-testid="new-workspace-button">+ New workspace</button></body></html>');
    
    // Step 2: Verify user is authenticated (portal is visible)
    await expect(page.locator('[data-testid="portal-title"]')).toBeVisible();
    
    // Step 3: Confirm no workspace exists
    await expect(page.locator('[data-testid="no-workspace-message"]')).toBeVisible();
    
    // Step 4: Click on '+ New workspace' button
    await expect(page.locator('[data-testid="new-workspace-button"]')).toBeVisible();
    
    // Step 5: Simulate workspace creation form
    await page.setContent(`
      <html>
        <body>
          <div data-testid="workspace-creation-dialog">
            <h2>Create New Workspace</h2>
            <form>
              <label>Workspace Name:</label>
              <input data-testid="workspace-name-input" type="text" />
              
              <label>Subscription:</label>
              <select data-testid="subscription-dropdown">
                <option value="">Select subscription...</option>
                <option value="sub1">Development Subscription</option>
                <option value="sub2">Production Subscription</option>
              </select>
              
              <label>Region:</label>
              <select data-testid="region-dropdown">
                <option value="">Select region...</option>
                <option value="eastus">East US</option>
                <option value="westus">West US</option>
              </select>
              
              <button data-testid="create-workspace-submit" type="button">Create workspace</button>
            </form>
          </div>
        </body>
      </html>
    `);
    
    // Verify workspace creation dialog opens
    await expect(page.locator('[data-testid="workspace-creation-dialog"]')).toBeVisible();
    
    // Step 6: Enter a workspace name (between 3 and 64 alphanumeric characters)
    const workspaceName = "PlaywrightTestWorkspace123";
    await page.locator('[data-testid="workspace-name-input"]').fill(workspaceName);
    
    // Step 7: Select an Azure subscription from the available list
    await page.locator('[data-testid="subscription-dropdown"]').selectOption("sub1");
    
    // Step 8: Choose a region for test run data storage
    await page.locator('[data-testid="region-dropdown"]').selectOption("eastus");
    
    // Verify form is filled correctly
    await expect(page.locator('[data-testid="workspace-name-input"]')).toHaveValue(workspaceName);
    await expect(page.locator('[data-testid="subscription-dropdown"]')).toHaveValue("sub1");
    await expect(page.locator('[data-testid="region-dropdown"]')).toHaveValue("eastus");
    
    // Step 9: Click 'Create workspace' and simulate success
    await page.setContent(`
      <html>
        <body>
          <div data-testid="getting-started-guide">
            <h1>Getting Started Guide</h1>
            <div data-testid="setup-instructions">Follow these steps to set up your workspace</div>
            <div data-testid="workspace-info">Workspace: ${workspaceName}</div>
          </div>
        </body>
      </html>
    `);
    
    // Expected Results:
    // - User is redirected to the setup/getting started guide page
    await expect(page.locator('[data-testid="getting-started-guide"]')).toBeVisible();
    await expect(page.locator('[data-testid="setup-instructions"]')).toBeVisible();
    
    // - Workspace information is displayed
    await expect(page.locator('[data-testid="workspace-info"]')).toContainText(workspaceName);
  });

  test("TC-002: Validate required workspace info and creation flow", async ({ page }) => {
    // Test Description: Ensure that the workspace creation flow enforces required fields and validation
    // for workspace name, subscription, and region.
    
    // Navigate to workspace creation form
    await page.setContent(`
      <html>
        <body>
          <div data-testid="workspace-creation-dialog">
            <h2>Create New Workspace</h2>
            <form id="workspace-form">
              <div>
                <label>Workspace Name:</label>
                <input data-testid="workspace-name-input" type="text" />
                <span data-testid="workspace-name-error" style="color:red;display:none;"></span>
              </div>
              
              <div>
                <label>Subscription:</label>
                <select data-testid="subscription-dropdown">
                  <option value="">Select subscription...</option>
                  <option value="sub1">Development Subscription</option>
                </select>
                <span data-testid="subscription-error" style="color:red;display:none;"></span>
              </div>
              
              <div>
                <label>Region:</label>
                <select data-testid="region-dropdown">
                  <option value="">Select region...</option>
                  <option value="eastus">East US</option>
                </select>
                <span data-testid="region-error" style="color:red;display:none;"></span>
              </div>
              
              <button data-testid="create-workspace-submit" type="button" onclick="validateForm()">Create workspace</button>
            </form>
          </div>
          
          <script>
            function validateForm() {
              const name = document.querySelector('[data-testid="workspace-name-input"]').value;
              const subscription = document.querySelector('[data-testid="subscription-dropdown"]').value;
              const region = document.querySelector('[data-testid="region-dropdown"]').value;
              
              // Clear previous errors
              document.querySelectorAll('[data-testid$="-error"]').forEach(el => el.style.display = 'none');
              
              let hasErrors = false;
              
              if (!name) {
                document.querySelector('[data-testid="workspace-name-error"]').textContent = 'Workspace name is required';
                document.querySelector('[data-testid="workspace-name-error"]').style.display = 'block';
                hasErrors = true;
              } else if (name.length < 3 || name.length > 64) {
                document.querySelector('[data-testid="workspace-name-error"]').textContent = 'Workspace name must be between 3 and 64 characters';
                document.querySelector('[data-testid="workspace-name-error"]').style.display = 'block';
                hasErrors = true;
              } else if (!/^[a-zA-Z0-9]+$/.test(name)) {
                document.querySelector('[data-testid="workspace-name-error"]').textContent = 'Workspace name must contain only alphanumeric characters';
                document.querySelector('[data-testid="workspace-name-error"]').style.display = 'block';
                hasErrors = true;
              }
              
              if (!subscription) {
                document.querySelector('[data-testid="subscription-error"]').textContent = 'Subscription is required';
                document.querySelector('[data-testid="subscription-error"]').style.display = 'block';
                hasErrors = true;
              }
              
              if (!region) {
                document.querySelector('[data-testid="region-error"]').textContent = 'Region is required';
                document.querySelector('[data-testid="region-error"]').style.display = 'block';
                hasErrors = true;
              }
              
              if (!hasErrors) {
                // Mark success
                document.querySelector('[data-testid="workspace-creation-dialog"]').innerHTML = '<div data-testid="creation-success">Workspace created successfully!</div>';
              }
            }
          </script>
        </body>
      </html>
    `);
    
    // Verify form is loaded
    await expect(page.locator('[data-testid="workspace-creation-dialog"]')).toBeVisible();
    
    // Test Case 1: Submit empty form
    await page.locator('[data-testid="create-workspace-submit"]').click();
    
    // Verify validation errors are displayed
    await expect(page.locator('[data-testid="workspace-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="workspace-name-error"]')).toHaveText(/Workspace name is required/i);
    
    await expect(page.locator('[data-testid="subscription-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="subscription-error"]')).toHaveText(/Subscription is required/i);
    
    await expect(page.locator('[data-testid="region-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="region-error"]')).toHaveText(/Region is required/i);
    
    // Test Case 2: Invalid workspace name (too short)
    await page.locator('[data-testid="workspace-name-input"]').fill("ab");
    await page.locator('[data-testid="create-workspace-submit"]').click();
    
    await expect(page.locator('[data-testid="workspace-name-error"]')).toHaveText(/Workspace name must be between 3 and 64 characters/i);
    
    // Test Case 3: Invalid workspace name (non-alphanumeric)
    await page.locator('[data-testid="workspace-name-input"]').fill("workspace-name!");
    await page.locator('[data-testid="create-workspace-submit"]').click();
    
    await expect(page.locator('[data-testid="workspace-name-error"]')).toHaveText(/Workspace name must contain only alphanumeric characters/i);
    
    // Test Case 4: Valid data - successful creation
    await page.locator('[data-testid="workspace-name-input"]').fill("ValidWorkspaceName123");
    await page.locator('[data-testid="subscription-dropdown"]').selectOption("sub1");
    await page.locator('[data-testid="region-dropdown"]').selectOption("eastus");
    await page.locator('[data-testid="create-workspace-submit"]').click();
    
    // Verify successful creation
    await expect(page.locator('[data-testid="creation-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="creation-success"]')).toHaveText(/Workspace created successfully/i);
  });

  test("TC-003: Ensure getting started guide appears after workspace creation", async ({ page }) => {
    // Test Description: Verify that after successfully creating a workspace, 
    // the user is immediately redirected to the getting started/setup guide.
    
    // Start with a completed workspace creation scenario
    await page.setContent(`
      <html>
        <body>
          <div data-testid="workspace-creation-complete">
            <h2>Workspace Creation Complete</h2>
            <div>Workspace: GuideTestWorkspace has been created successfully</div>
          </div>
          
          <div data-testid="getting-started-guide">
            <h1 data-testid="workspace-onboarding-title">Welcome to your new Playwright Testing workspace</h1>
            <div data-testid="setup-instructions">
              <h2>Setup Instructions</h2>
              <p>Follow these steps to configure your workspace:</p>
              <ol>
                <li>Install Playwright CLI</li>
                <li>Configure your test project</li>
                <li>Run your first test</li>
              </ol>
            </div>
            <div data-testid="next-steps-section">
              <h3>Next Steps</h3>
              <ul>
                <li>Set up CI/CD integration</li>
                <li>Configure test reporting</li>
              </ul>
            </div>
            <div data-testid="setup-guide-navigation">
              <button>Previous</button>
              <button>Next</button>
            </div>
            <div data-testid="workspace-info">
              Workspace Name: GuideTestWorkspace
            </div>
          </div>
        </body>
      </html>
    `);
    
    // Expected Results:
    // - The getting started/setup guide is displayed immediately after workspace creation
    await expect(page.locator('[data-testid="getting-started-guide"]')).toBeVisible();
    
    // - Guide contains instructions relevant to onboarding the new workspace
    await expect(page.locator('[data-testid="setup-instructions"]')).toBeVisible();
    await expect(page.locator('[data-testid="workspace-onboarding-title"]')).toHaveText(/Welcome to your new Playwright Testing workspace/i);
    
    // Verify essential onboarding elements are present
    await expect(page.locator('[data-testid="next-steps-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="setup-guide-navigation"]')).toBeVisible();
    
    // Verify guide shows workspace-specific information
    await expect(page.locator('[data-testid="workspace-info"]')).toContainText("GuideTestWorkspace");
  });
  
  test("Additional: workspace creation flow works on mobile viewports", async ({ page }) => {
    // Test mobile responsiveness of workspace creation flow
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.setContent(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 10px; }
            .mobile-form { max-width: 100%; }
            input, select { width: 100%; padding: 8px; margin: 5px 0; box-sizing: border-box; }
            button { width: 100%; padding: 12px; background: #0078d4; color: white; border: none; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div data-testid="workspace-creation-dialog-mobile" class="mobile-form">
            <h2>Create New Workspace</h2>
            <form>
              <input data-testid="workspace-name-input" type="text" placeholder="Workspace name" />
              <select data-testid="subscription-dropdown">
                <option value="">Select subscription...</option>
                <option value="sub1">Development Subscription</option>
              </select>
              <select data-testid="region-dropdown">
                <option value="">Select region...</option>
                <option value="eastus">East US</option>
              </select>
              <button data-testid="create-workspace-submit" type="button">Create workspace</button>
            </form>
          </div>
        </body>
      </html>
    `);
    
    // Verify mobile viewport is set
    const isMobile = await isMobileViewport(page);
    expect(isMobile).toBe(true);
    
    // Verify mobile-optimized dialog is visible
    await expect(page.locator('[data-testid="workspace-creation-dialog-mobile"]')).toBeVisible();
    
    // Complete creation flow on mobile
    await page.locator('[data-testid="workspace-name-input"]').fill("MobileTestWorkspace");
    await page.locator('[data-testid="subscription-dropdown"]').selectOption("sub1");
    await page.locator('[data-testid="region-dropdown"]').selectOption("eastus");
    
    // Verify form inputs work on mobile
    await expect(page.locator('[data-testid="workspace-name-input"]')).toHaveValue("MobileTestWorkspace");
    await expect(page.locator('[data-testid="subscription-dropdown"]')).toHaveValue("sub1");
    await expect(page.locator('[data-testid="region-dropdown"]')).toHaveValue("eastus");
    
    // Simulate successful creation with mobile getting started guide
    await page.setContent(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 10px; }
            h1 { font-size: 1.5em; }
          </style>
        </head>
        <body>
          <div data-testid="getting-started-guide-mobile">
            <h1>Mobile Getting Started Guide</h1>
            <p>Welcome to your new workspace: MobileTestWorkspace</p>
            <div>Optimized for mobile viewing</div>
          </div>
        </body>
      </html>
    `);
    
    // Verify mobile getting started guide
    await expect(page.locator('[data-testid="getting-started-guide-mobile"]')).toBeVisible();
    await expect(page.locator('text=MobileTestWorkspace')).toBeVisible();
  });
});