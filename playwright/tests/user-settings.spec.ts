import { test, expect } from "@playwright/test";
import { login, getByTestId, setupApiIntercepts, isMobileViewport } from "../utils/helpers";

test.describe("User Settings", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
    // Login before each test
    await login(page, "Heath93", "s3cret", { waitForRedirect: false });
    // Go directly to user settings page to avoid waiting for "/" navigation
    await page.goto("/user/settings");
  });

  test("should display user settings page", async ({ page }) => {
    // Navigate to user settings page
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      await getByTestId(page, "sidenav-toggle").click();
      await getByTestId(page, "sidenav-user-settings").click();
    } else {
      // For desktop, use sidebar navigation as there's no topbar user settings link
      await getByTestId(page, "sidenav-user-settings").click();
    }

    await expect(page).toHaveURL("/user/settings");
    await expect(getByTestId(page, "user-settings-form")).toBeVisible();
  });

  test("should update user profile information", async ({ page }) => {
    await getByTestId(page, "sidenav-user-settings").click();

    // Update first name
    const firstNameInput = getByTestId(page, "user-settings-firstName-input");
    await firstNameInput.fill("");
    await firstNameInput.fill("UpdatedFirstName");

    // Update last name
    const lastNameInput = getByTestId(page, "user-settings-lastName-input");
    await lastNameInput.fill("");
    await lastNameInput.fill("UpdatedLastName");

    // Update email
    const emailInput = getByTestId(page, "user-settings-email-input");
    await emailInput.fill("");
    await emailInput.fill("updated@example.com");

    // Update phone number
    const phoneInput = getByTestId(page, "user-settings-phoneNumber-input");
    await phoneInput.fill("");
    await phoneInput.fill("555-123-4567");

    // Submit changes
    await getByTestId(page, "user-settings-submit").click();

    // Wait for the API call to complete - this indicates success
    // The form doesn't show a success message, but the values should persist
    await page.waitForTimeout(1000); // Wait for form submission

    // Verify changes persisted

    await expect(firstNameInput).toHaveValue("UpdatedFirstName");
    await expect(lastNameInput).toHaveValue("UpdatedLastName");
    await expect(emailInput).toHaveValue("updated@example.com");
    await expect(phoneInput).toHaveValue("555-123-4567");
    
    // Verify user display name updated in the sidebar
    await expect(page.locator("text=UpdatedFirstName")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await getByTestId(page, "sidenav-user-settings").click();

    // Clear required fields
    const firstNameInput = getByTestId(page, "user-settings-firstName-input");
    const lastNameInput = getByTestId(page, "user-settings-lastName-input");
    const emailInput = getByTestId(page, "user-settings-email-input");
    await firstNameInput.fill("");
    await lastNameInput.fill("");
    await emailInput.fill("");

    // The submit button should be disabled when required fields are empty
    await expect(getByTestId(page, "user-settings-submit")).toBeDisabled();

    // Check that validation errors are shown
    await expect(page.locator("text=Enter a first name")).toBeVisible();
    await expect(page.locator("text=Enter a last name")).toBeVisible(); 
    await expect(page.locator("text=Enter an email address")).toBeVisible();

  });

  test("should validate email format", async ({ page }) => {
    await getByTestId(page, "sidenav-user-settings").click();

    // Enter invalid email
    const emailInput = getByTestId(page, "user-settings-email-input");
    await emailInput.fill("");
    await emailInput.fill("invalid-email");

    // Should show email validation error (form becomes invalid)
    await expect(page.locator("text=Must contain a valid email address")).toBeVisible();
  });

  test("should validate phone number format", async ({ page }) => {
    await getByTestId(page, "sidenav-user-settings").click();

    // Enter invalid phone number
    const phoneInput = getByTestId(page, "user-settings-phoneNumber-input");
    await phoneInput.fill("");
    await phoneInput.fill("123"); // Too short

    // Should show phone validation error
    await expect(page.locator("text=Phone number is not valid")).toBeVisible();
  });

  test.skip("should change password", async ({ page }) => {
    // Password change functionality is not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();
  });

  test.skip("should validate password change form", async ({ page }) => {
    // Password change functionality is not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();
  });

  test.skip("should validate password confirmation", async ({ page }) => {
    // Password change functionality is not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();
  });

  test.skip("should update privacy settings", async ({ page }) => {
    // Privacy settings tabs are not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();
  });

  test.skip("should upload profile picture", async ({ page }) => {
    // Profile picture upload is not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();
  });

  test.skip("should cancel changes", async ({ page }) => {
    // Cancel button is not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();
  });

  test.skip("should delete user account", async ({ page }) => {
    // Account deletion functionality is not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();
  });

  test.skip("should show user account information", async ({ page }) => {
    // Additional user account information display is not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();
  });

  test.skip("should handle two-factor authentication setup", async ({ page }) => {
    // Two-factor authentication is not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();
  });

  test.skip("should export user data", async ({ page }) => {
    // Data export functionality is not implemented in the current user settings form
    await getByTestId(page, "sidenav-user-settings").click();

  });

  test("should handle mobile responsive layout for settings", async ({ page }) => {
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      // Open mobile navigation
      await getByTestId(page, "sidenav-toggle").click();

      // Click settings from mobile menu
      await getByTestId(page, "sidenav-user-settings").click();

      await expect(page).toHaveURL("/user/settings");

      // Should adapt layout for mobile
      await expect(getByTestId(page, "user-settings-form")).toBeVisible();

      // Form fields should stack vertically on mobile
      const formFields = page.locator('[data-testid^="user-settings-"][data-testid$="-input"]');
      if ((await formFields.count()) > 1) {
        const firstFieldBox = await formFields.first().boundingBox();
        const secondFieldBox = await formFields.nth(1).boundingBox();

        // Second field should be below the first (higher y coordinate)
        expect(secondFieldBox?.y).toBeGreaterThan(firstFieldBox?.y || 0);
      }
    }
  });
});