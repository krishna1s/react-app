import { test, expect } from "@playwright/test";
import { login, getByTestId, setupApiIntercepts, isMobileViewport } from "../utils/helpers";

test.describe("User Settings", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
    // Login before each test
    await login(page, "Heath93", "s3cret");
  });

  test("should display user settings page", async ({ page }) => {
    // Navigate to user settings page
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      await getByTestId(page, "sidenav-toggle").click();
      await getByTestId(page, "sidenav-user-settings").click();
    } else {
      await getByTestId(page, "nav-top-user-settings").click();
    }

    await expect(page).toHaveURL("/settings");
    await expect(getByTestId(page, "user-settings-form")).toBeVisible();
  });

  test("should update user profile information", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Update first name
    const firstNameInput = getByTestId(page, "user-settings-firstName-input");
    await firstNameInput.clear();
    await firstNameInput.fill("UpdatedFirstName");

    // Update last name
    const lastNameInput = getByTestId(page, "user-settings-lastName-input");
    await lastNameInput.clear();
    await lastNameInput.fill("UpdatedLastName");

    // Update email
    const emailInput = getByTestId(page, "user-settings-email-input");
    await emailInput.clear();
    await emailInput.fill("updated@example.com");

    // Update phone number
    const phoneInput = getByTestId(page, "user-settings-phoneNumber-input");
    await phoneInput.clear();
    await phoneInput.fill("555-123-4567");

    // Submit changes
    await getByTestId(page, "user-settings-submit").click();

    // Should show success message
    await expect(page.locator("text=Profile updated successfully")).toBeVisible();

    // Verify changes persisted
    await expect(firstNameInput).toHaveValue("UpdatedFirstName");
    await expect(lastNameInput).toHaveValue("UpdatedLastName");
    await expect(emailInput).toHaveValue("updated@example.com");
    await expect(phoneInput).toHaveValue("555-123-4567");
  });

  test("should validate required fields", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Clear required fields
    await getByTestId(page, "user-settings-firstName-input").clear();
    await getByTestId(page, "user-settings-lastName-input").clear();
    await getByTestId(page, "user-settings-email-input").clear();

    // Try to submit
    await getByTestId(page, "user-settings-submit").click();

    // Should show validation errors
    await expect(getByTestId(page, "user-settings-firstName-input")).toHaveAttribute("required");
    await expect(getByTestId(page, "user-settings-lastName-input")).toHaveAttribute("required");
    await expect(getByTestId(page, "user-settings-email-input")).toHaveAttribute("required");
  });

  test("should validate email format", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Enter invalid email
    const emailInput = getByTestId(page, "user-settings-email-input");
    await emailInput.clear();
    await emailInput.fill("invalid-email");

    await getByTestId(page, "user-settings-submit").click();

    // Should show email validation error
    await expect(page.locator("text=Please enter a valid email address")).toBeVisible();
  });

  test("should validate phone number format", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Enter invalid phone number
    const phoneInput = getByTestId(page, "user-settings-phoneNumber-input");
    await phoneInput.clear();
    await phoneInput.fill("123"); // Too short

    await getByTestId(page, "user-settings-submit").click();

    // Should show phone validation error
    await expect(page.locator("text=Please enter a valid phone number")).toBeVisible();
  });

  test("should change password", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Navigate to change password section
    await getByTestId(page, "user-settings-change-password-tab").click();

    // Fill password fields
    await getByTestId(page, "user-settings-currentPassword-input").fill("s3cret");
    await getByTestId(page, "user-settings-newPassword-input").fill("newpassword123");
    await getByTestId(page, "user-settings-confirmPassword-input").fill("newpassword123");

    // Submit password change
    await getByTestId(page, "user-settings-password-submit").click();

    // Should show success message
    await expect(page.locator("text=Password changed successfully")).toBeVisible();
  });

  test("should validate password change form", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();
    await getByTestId(page, "user-settings-change-password-tab").click();

    // Try to submit without current password
    await getByTestId(page, "user-settings-newPassword-input").fill("newpassword123");
    await getByTestId(page, "user-settings-confirmPassword-input").fill("newpassword123");
    await getByTestId(page, "user-settings-password-submit").click();

    // Should require current password
    await expect(getByTestId(page, "user-settings-currentPassword-input")).toHaveAttribute(
      "required"
    );
  });

  test("should validate password confirmation", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();
    await getByTestId(page, "user-settings-change-password-tab").click();

    // Enter mismatched passwords
    await getByTestId(page, "user-settings-currentPassword-input").fill("s3cret");
    await getByTestId(page, "user-settings-newPassword-input").fill("newpassword123");
    await getByTestId(page, "user-settings-confirmPassword-input").fill("differentpassword");

    await getByTestId(page, "user-settings-password-submit").click();

    // Should show password mismatch error
    await expect(page.locator("text=Passwords do not match")).toBeVisible();
  });

  test("should update privacy settings", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Navigate to privacy settings tab
    await getByTestId(page, "user-settings-privacy-tab").click();

    // Update default privacy level
    await getByTestId(page, "user-settings-privacy-private").check();

    // Update notification preferences
    await getByTestId(page, "user-settings-notifications-email").uncheck();
    await getByTestId(page, "user-settings-notifications-push").check();

    // Submit changes
    await getByTestId(page, "user-settings-privacy-submit").click();

    // Should show success message
    await expect(page.locator("text=Privacy settings updated")).toBeVisible();
  });

  test("should upload profile picture", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Check if profile picture upload exists
    const profilePictureInput = getByTestId(page, "user-settings-profile-picture-input");

    if (await profilePictureInput.isVisible()) {
      // Create a test image file
      const testImagePath = "/tmp/test-avatar.png";

      // Upload profile picture
      await profilePictureInput.setInputFiles(testImagePath);

      // Submit form
      await getByTestId(page, "user-settings-submit").click();

      // Should show updated profile picture
      await expect(getByTestId(page, "user-settings-profile-picture-preview")).toBeVisible();
    }
  });

  test("should cancel changes", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Make some changes
    const firstNameInput = getByTestId(page, "user-settings-firstName-input");
    const originalValue = await firstNameInput.inputValue();
    await firstNameInput.clear();
    await firstNameInput.fill("TempName");

    // Cancel changes
    await getByTestId(page, "user-settings-cancel").click();

    // Should revert to original value
    await expect(firstNameInput).toHaveValue(originalValue);
  });

  test("should delete user account", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Navigate to account deletion section
    await getByTestId(page, "user-settings-danger-zone-tab").click();

    // Click delete account button
    await getByTestId(page, "user-settings-delete-account").click();

    // Should show confirmation dialog
    await expect(getByTestId(page, "delete-account-confirmation-dialog")).toBeVisible();

    // Enter confirmation text
    await getByTestId(page, "delete-account-confirmation-input").fill("DELETE");

    // Confirm deletion
    await getByTestId(page, "delete-account-confirm").click();

    // Should redirect to signup/signin page
    await expect(page).toHaveURL(/\/(signin|signup)$/);
  });

  test("should show user account information", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Should display current user information
    await expect(getByTestId(page, "user-settings-username-display")).toBeVisible();
    await expect(getByTestId(page, "user-settings-member-since")).toBeVisible();
    await expect(getByTestId(page, "user-settings-account-balance")).toBeVisible();
  });

  test("should handle two-factor authentication setup", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Navigate to security settings
    await getByTestId(page, "user-settings-security-tab").click();

    // Check if 2FA setup exists
    const twoFactorSetup = getByTestId(page, "user-settings-2fa-setup");

    if (await twoFactorSetup.isVisible()) {
      await twoFactorSetup.click();

      // Should show 2FA setup dialog
      await expect(getByTestId(page, "2fa-setup-dialog")).toBeVisible();

      // Should show QR code or setup instructions
      await expect(page.locator("text=Scan QR code")).toBeVisible();
    }
  });

  test("should export user data", async ({ page }) => {
    await getByTestId(page, "nav-top-user-settings").click();

    // Navigate to data export section
    await getByTestId(page, "user-settings-data-tab").click();

    // Check if data export functionality exists
    const exportButton = getByTestId(page, "user-settings-export-data");

    if (await exportButton.isVisible()) {
      // Set up download handling
      const downloadPromise = page.waitForEvent("download");

      // Click export button
      await exportButton.click();

      // Wait for download
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain("user-data");
      expect(download.suggestedFilename()).toMatch(/\.(json|csv|zip)$/);
    }
  });

  test("should handle mobile responsive layout for settings", async ({ page }) => {
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      // Open mobile navigation
      await getByTestId(page, "sidenav-toggle").click();

      // Click settings from mobile menu
      await getByTestId(page, "sidenav-user-settings").click();

      await expect(page).toHaveURL("/settings");

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
