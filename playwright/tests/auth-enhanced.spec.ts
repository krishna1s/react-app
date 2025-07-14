import { test, expect } from "@playwright/test";
import {
  login,
  logout,
  signUp,
  getByTestId,
  createTestUser,
  isMobileViewport,
  setupApiIntercepts,
} from "../utils/helpers";

test.describe("Authentication Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
  });

  test("AUTH_001: User Sign Up - Valid Registration", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is not logged in, Navigate to Sign Up page
    await page.goto("/signup");
    
    // Step 1: Verify we're on signup page
    await expect(page).toHaveURL("/signup");
    await expect(getByTestId(page, "signup-title")).toBeVisible();
    
    // Step 2: Fill first name
    await getByTestId(page, "signup-first-name").fill("John");
    await expect(getByTestId(page, "signup-first-name")).toHaveValue("John");
    
    // Step 3: Fill last name
    await getByTestId(page, "signup-last-name").fill("Doe");
    await expect(getByTestId(page, "signup-last-name")).toHaveValue("Doe");
    
    // Step 4: Fill username
    const username = `johndoe_${Date.now()}`;
    await getByTestId(page, "signup-username").fill(username);
    await expect(getByTestId(page, "signup-username")).toHaveValue(username);
    
    // Step 5: Fill password
    await getByTestId(page, "signup-password").fill("password123");
    // Note: Password field should be masked, so we can't check exact value
    await expect(getByTestId(page, "signup-password")).toHaveAttribute("type", "password");
    
    // Step 6: Fill confirm password
    await getByTestId(page, "signup-confirmPassword").fill("password123");
    await expect(getByTestId(page, "signup-confirmPassword")).toHaveAttribute("type", "password");
    
    // Step 7: Submit form
    await getByTestId(page, "signup-submit").click();
    
    // Expected result: User account is created successfully and redirected to Sign In page
    await expect(page).toHaveURL("/signin");
  });

  test("AUTH_002: User Sign Up - Missing First Name", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is not logged in, Navigate to Sign Up page
    await page.goto("/signup");
    
    // Step 1: Verify we're on signup page
    await expect(page).toHaveURL("/signup");
    await expect(getByTestId(page, "signup-title")).toBeVisible();
    
    // Step 2: Fill last name (skip first name)
    await getByTestId(page, "signup-last-name").fill("Doe");
    await expect(getByTestId(page, "signup-last-name")).toHaveValue("Doe");
    
    // Step 3: Fill username
    const username = `johndoe_${Date.now()}`;
    await getByTestId(page, "signup-username").fill(username);
    await expect(getByTestId(page, "signup-username")).toHaveValue(username);
    
    // Step 4: Fill password
    await getByTestId(page, "signup-password").fill("password123");
    await expect(getByTestId(page, "signup-password")).toHaveAttribute("type", "password");
    
    // Step 5: Fill confirm password
    await getByTestId(page, "signup-confirmPassword").fill("password123");
    await expect(getByTestId(page, "signup-confirmPassword")).toHaveAttribute("type", "password");
    
    // Step 6: Verify submit button is disabled and validation error appears
    await expect(getByTestId(page, "signup-submit")).toBeDisabled();
    
    // Expected result: User is shown validation errors indicating that the first name is required
    // Check for validation error by trying to focus away from first name field
    await getByTestId(page, "signup-first-name").focus();
    await getByTestId(page, "signup-last-name").focus();
    await expect(page.locator("text=First Name is required")).toBeVisible();
  });

  test("AUTH_003: User Sign Up - Password Mismatch", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is not logged in, Navigate to Sign Up page
    await page.goto("/signup");
    
    // Step 1: Verify we're on signup page
    await expect(page).toHaveURL("/signup");
    await expect(getByTestId(page, "signup-title")).toBeVisible();
    
    // Step 2: Fill first name
    await getByTestId(page, "signup-first-name").fill("John");
    await expect(getByTestId(page, "signup-first-name")).toHaveValue("John");
    
    // Step 3: Fill last name
    await getByTestId(page, "signup-last-name").fill("Doe");
    await expect(getByTestId(page, "signup-last-name")).toHaveValue("Doe");
    
    // Step 4: Fill username
    const username = `johndoe_${Date.now()}`;
    await getByTestId(page, "signup-username").fill(username);
    await expect(getByTestId(page, "signup-username")).toHaveValue(username);
    
    // Step 5: Fill password
    await getByTestId(page, "signup-password").fill("password123");
    await expect(getByTestId(page, "signup-password")).toHaveAttribute("type", "password");
    
    // Step 6: Fill confirm password with different value
    await getByTestId(page, "signup-confirmPassword").fill("password456");
    await expect(getByTestId(page, "signup-confirmPassword")).toHaveAttribute("type", "password");
    
    // Step 7: Trigger validation by focusing away from password field
    await getByTestId(page, "signup-confirmPassword").blur();
    
    // Expected result: User is shown an error message indicating that the passwords do not match
    await expect(page.locator("text=Password does not match")).toBeVisible();
    
    // Also verify submit button is disabled due to validation error
    await expect(getByTestId(page, "signup-submit")).toBeDisabled();
  });

  test("AUTH_004: User Sign In - Valid Credentials", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User has an account, User is on the Sign In page
    await page.goto("/signin");
    
    // Step 1: Fill username
    await getByTestId(page, "signin-username").fill("Heath93");
    await expect(getByTestId(page, "signin-username")).toHaveValue("Heath93");
    
    // Step 2: Fill password
    await getByTestId(page, "signin-password").fill("s3cret");
    await expect(getByTestId(page, "signin-password")).toHaveAttribute("type", "password");
    
    // Step 3: Submit form
    await getByTestId(page, "signin-submit").click();
    
    // Expected result: User is logged in successfully and redirected to the dashboard
    await expect(page).toHaveURL("/");
    await expect(getByTestId(page, "sidenav-username")).toBeVisible();
  });

  test("AUTH_005: User Sign In - Invalid Credentials", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is on the Sign In page
    await page.goto("/signin");
    
    // Step 1: Fill invalid username
    await getByTestId(page, "signin-username").fill("wronguser");
    await expect(getByTestId(page, "signin-username")).toHaveValue("wronguser");
    
    // Step 2: Fill invalid password
    await getByTestId(page, "signin-password").fill("wrongpass");
    await expect(getByTestId(page, "signin-password")).toHaveAttribute("type", "password");
    
    // Step 3: Submit form
    await getByTestId(page, "signin-submit").click();
    
    // Expected result: User is shown an error message indicating invalid credentials
    await expect(getByTestId(page, "signin-error")).toBeVisible();
  });

  test.skip("AUTH_006: User Password Recovery - Valid Email", async ({ page }) => {
    // Password recovery feature is not implemented
    await page.goto("/signin");
    // Note: Feature not available in current implementation
  });

  test.skip("AUTH_007: User Password Recovery - Invalid Email", async ({ page }) => {
    // Password recovery feature is not implemented  
    await page.goto("/signin");
    // Note: Feature not available in current implementation
  });

  test("AUTH_008: User Sign Out", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is logged in, User is on the dashboard
    await login(page, "Heath93", "s3cret");
    await expect(page).toHaveURL("/");
    
    // Step 1: Open sidenav and sign out using the logout helper
    const isMobile = await isMobileViewport(page);
    await logout(page, isMobile);
    
    // Expected result: User is logged out successfully and redirected to Sign In page
    await expect(page).toHaveURL("/signin");
  });
});