import { Page, Locator } from "@playwright/test";

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  avatar: string;
  defaultPrivacyLevel: string;
  createdAt: string;
  modifiedAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  isDeleted: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface Transaction {
  id: string;
  source: string;
  amount: number;
  description: string;
  receiverId: string;
  senderId: string;
  balanceAtCompletion: number;
  privacyLevel: string;
  status: string;
  requestStatus: string;
  requestResolvedAt: string;
  createdAt: string;
  modifiedAt: string;
}

/**
 * Custom data attribute selector helper
 * Equivalent to Cypress cy.getBySel()
 */
export const getByTestId = (page: Page, testId: string): Locator => {
  const element = page.locator(`[data-test="${testId}"]`);
  
  // For form fields (TextField), we need to target the actual input element
  // Apply this to form input fields but not to display elements like sidenav
  // Note: user-settings fields are already direct input elements and don't need .locator('input')
  if ((testId.includes('signin-') || testId.includes('signup-') || testId.includes('bankaccount-')) && 
      (testId.includes('-username') || testId.includes('-password') || testId.includes('-first-name') || 
       testId.includes('-last-name') || testId.includes('-confirmPassword') || 
       testId.includes('-bankName') || testId.includes('-routingNumber') || testId.includes('-accountNumber'))) {
    return element.locator('input');
  }
  
  // Transaction create fields and user settings fields are already input elements
  if ((testId.includes('transaction-create-') || testId.includes('user-settings-')) && 
      (testId.includes('-amount-input') || testId.includes('-description-input') || 
       testId.includes('-email-input') || testId.includes('-phoneNumber-input') || 
       testId.includes('-firstName-input') || testId.includes('-lastName-input'))) {
    return element; // These are already input elements
  }
  
  return element;
};

/**
 * Login helper function
 */
export const login = async (
  page: Page,
  username: string,
  password: string,
  options: { rememberUser?: boolean } = {}
): Promise<void> => {
  // Navigate to signin page
  await page.goto("/signin");

  // Fill in credentials
  await getByTestId(page, "signin-username").fill(username);
  await getByTestId(page, "signin-password").fill(password);

  // Check remember me if requested
  if (options.rememberUser) {
    await getByTestId(page, "signin-remember-me").check();
  }

  // Submit form
  await getByTestId(page, "signin-submit").click();

  // Wait for navigation to complete with increased timeout
  await page.waitForURL("/", { timeout: 60000 });
};

/**
 * Logout helper function
 */
export const logout = async (page: Page, isMobile = false): Promise<void> => {
  // Handle onboarding dialog if it's open
  const onboardingDialog = getByTestId(page, "user-onboarding-dialog");
  if (await onboardingDialog.isVisible()) {
    try {
      // Try to complete onboarding by clicking through all steps
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts && await onboardingDialog.isVisible()) {
        const nextButton = getByTestId(page, "user-onboarding-next");
        
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
        } else {
          // No more next buttons, try to close the dialog by pressing escape or clicking outside
          await page.keyboard.press("Escape");
          await page.waitForTimeout(500);
        }
        
        attempts++;
      }
      
      // Wait for dialog to close
      if (await onboardingDialog.isVisible()) {
        await onboardingDialog.waitFor({ state: "hidden", timeout: 5000 });
      }
    } catch (error) {
      console.warn("Could not close onboarding dialog:", error);
      // Try to force close with escape key
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);
    }
  }

  // Also handle any other modals
  try {
    const modals = page.locator('[role="dialog"], .MuiDialog-root');
    const modalCount = await modals.count();
    if (modalCount > 0) {
      for (let i = 0; i < modalCount; i++) {
        const modal = modals.nth(i);
        if (await modal.isVisible()) {
          // Try to find and click a close button
          const closeButton = modal
            .locator("button")
            .filter({ hasText: /close|skip|done|dismiss|×/i })
            .first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await modal.waitFor({ state: "hidden" });
          } else {
            // Try pressing escape
            await page.keyboard.press("Escape");
            await page.waitForTimeout(500);
          }
        }
      }
    }
  } catch (error) {
    console.warn("Could not close modals:", error);
  }

  if (isMobile) {
    await getByTestId(page, "sidenav-toggle").click();
  }
  
  // Wait for the logout button to be clickable
  await getByTestId(page, "sidenav-signout").waitFor({ state: "visible" });
  await getByTestId(page, "sidenav-signout").click();
  await page.waitForURL("/signin");
};

/**
 * Wait for API response helper
 */
export const waitForResponse = async (
  page: Page,
  url: string | RegExp,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET"
): Promise<any> => {
  return page.waitForResponse((response) => {
    const urlMatches =
      typeof url === "string" ? response.url().includes(url) : url.test(response.url());
    return urlMatches && response.request().method() === method;
  });
};

/**
 * Setup API intercepts for common endpoints
 */
export const setupApiIntercepts = async (page: Page): Promise<void> => {
  // Mock database seed
  await page.route("**/testData/seed", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  // Don't mock user creation - let it go through to the actual API
  // The real backend should handle user registration properly
};

/**
 * Create test user data
 */
export const createTestUser = (): Partial<User> => ({
  username: `testuser_${Date.now()}`,
  password: "s3cret",
  email: `test_${Date.now()}@example.com`,
  firstName: "Test",
  lastName: "User",
  balance: 1000,
  avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/avatar.svg",
});

/**
 * Mobile viewport detection helper
 */
export const isMobileViewport = async (page: Page): Promise<boolean> => {
  const viewport = page.viewportSize();
  return viewport ? viewport.width <= 414 : false;
};

/**
 * Fill out signup form
 */
export const signUp = async (
  page: Page,
  userData: {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    confirmPassword: string;
  }
): Promise<void> => {
  await page.goto("/signup");

  await getByTestId(page, "signup-first-name").fill(userData.firstName);
  await getByTestId(page, "signup-last-name").fill(userData.lastName);
  await getByTestId(page, "signup-username").fill(userData.username);
  await getByTestId(page, "signup-password").fill(userData.password);
  await getByTestId(page, "signup-confirmPassword").fill(userData.confirmPassword);

  // Ensure all fields are filled and form is valid
  const submitButton = getByTestId(page, "signup-submit");
  await submitButton.waitFor({ state: "visible" });
  
  // Check if submit button is enabled
  const isDisabled = await submitButton.isDisabled();
  if (isDisabled) {
    // Check for validation errors
    const validationErrors = await page.locator('[id$="-helper-text"]').allTextContents();
    console.error("Form validation errors:", validationErrors.filter(text => text.length > 0));
    throw new Error("Signup form submit button is disabled due to validation errors");
  }

  // Wait for the signup request to complete with a more specific pattern
  const signupPromise = page.waitForResponse("**/users");
  await submitButton.click();
  
  try {
    const response = await signupPromise;
    if (response.status() !== 201) {
      console.error(`Signup failed with status ${response.status()}`);
      const responseText = await response.text();
      console.error("Response body:", responseText);
      throw new Error(`Signup failed with status ${response.status()}: ${responseText}`);
    }
  } catch (error) {
    console.error("Signup error:", error);
    
    // Check if there are any validation errors on the page
    const validationErrors = await page.locator('[id$="-helper-text"]').allTextContents();
    if (validationErrors.length > 0) {
      console.error("Validation errors:", validationErrors);
    }
    
    throw error;
  }

  // Wait for redirect to signin page with increased timeout
  await page.waitForURL("/signin", { timeout: 15000 });
};

/**
 * Navigate to a specific page and wait for it to load
 */
export const navigateToPage = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
};
