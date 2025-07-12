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

test.describe("User Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
  });

  test("should redirect unauthenticated user to signin page", async ({ page }) => {
    await page.goto("/personal");
    await expect(page).toHaveURL("/signin");
  });

  test("should redirect to the home page after login", async ({ page }) => {
    // Use default test user credentials that should exist in the seeded database
    await login(page, "Katharina_Bernier", "s3cret", { rememberUser: true });
    await expect(page).toHaveURL("/");
  });

  test("should remember a user for 30 days after login", async ({ page }) => {
    // Login with remember me checked
    await login(page, "Katharina_Bernier", "s3cret", { rememberUser: true });

    // Verify we're on the home page
    await expect(page).toHaveURL("/");

    // Check that session cookie exists (this would normally have proper expiry)
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === "connect.sid");
    expect(sessionCookie).toBeDefined();

    // Logout user
    const isMobile = await isMobileViewport(page);
    await logout(page, isMobile);
    await expect(page).toHaveURL("/signin");
  });

  test("should allow a visitor to sign-up, login, and logout", async ({ page }) => {
    const testUser = createTestUser();

    // Sign up new user
    await signUp(page, {
      firstName: testUser.firstName!,
      lastName: testUser.lastName!,
      username: testUser.username!,
      password: testUser.password!,
      confirmPassword: testUser.password!,
    });

    // Should redirect to signin after successful signup
    await expect(page).toHaveURL("/signin");

    // Login with the new user
    await login(page, testUser.username!, testUser.password!);
    await expect(page).toHaveURL("/");

    // Verify user is logged in by checking for user menu or navigation
    await expect(getByTestId(page, "sidenav-username")).toBeVisible();

    // Logout
    const isMobile = await isMobileViewport(page);
    await logout(page, isMobile);
    await expect(page).toHaveURL("/signin");
  });

  test("should display login errors for invalid credentials", async ({ page }) => {
    await page.goto("/signin");

    // Try to login with invalid credentials
    await getByTestId(page, "signin-username").fill("invaliduser");
    await getByTestId(page, "signin-password").fill("wrongpassword");
    await getByTestId(page, "signin-submit").click();

    // Should show error message
    await expect(getByTestId(page, "signin-error")).toBeVisible();
  });

  test("should validate required fields on signin form", async ({ page }) => {
    await page.goto("/signin");

    // Try to submit empty form
    await getByTestId(page, "signin-submit").click();

    // Username field should show validation error
    const usernameInput = getByTestId(page, "signin-username");
    await expect(usernameInput).toHaveAttribute("required");

    // Password field should show validation error
    const passwordInput = getByTestId(page, "signin-password");
    await expect(passwordInput).toHaveAttribute("required");
  });

  test("should validate required fields on signup form", async ({ page }) => {
    await page.goto("/signup");

    // Try to submit empty form
    await getByTestId(page, "signup-submit").click();

    // All required fields should show validation
    await expect(getByTestId(page, "signup-first-name")).toHaveAttribute("required");
    await expect(getByTestId(page, "signup-last-name")).toHaveAttribute("required");
    await expect(getByTestId(page, "signup-username")).toHaveAttribute("required");
    await expect(getByTestId(page, "signup-password")).toHaveAttribute("required");
    await expect(getByTestId(page, "signup-confirmPassword")).toHaveAttribute("required");
  });

  test("should validate password confirmation on signup", async ({ page }) => {
    const testUser = createTestUser();

    await page.goto("/signup");

    // Fill form with mismatched passwords
    await getByTestId(page, "signup-first-name").fill(testUser.firstName!);
    await getByTestId(page, "signup-last-name").fill(testUser.lastName!);
    await getByTestId(page, "signup-username").fill(testUser.username!);
    await getByTestId(page, "signup-password").fill(testUser.password!);
    await getByTestId(page, "signup-confirmPassword").fill("differentpassword");

    await getByTestId(page, "signup-submit").click();

    // Should show password confirmation error
    await expect(page.locator("text=Passwords must match")).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/signin");

    const passwordInput = getByTestId(page, "signin-password");
    const toggleButton = page.locator('[aria-label="toggle password visibility"]');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click toggle again to hide password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should navigate between signin and signup pages", async ({ page }) => {
    await page.goto("/signin");

    // Click link to go to signup
    await page.locator("text=Don't have an account? Sign Up").click();
    await expect(page).toHaveURL("/signup");

    // Click link to go back to signin
    await page.locator("text=Have an account? Sign In").click();
    await expect(page).toHaveURL("/signin");
  });
});
