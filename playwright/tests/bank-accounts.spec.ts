import { test, expect } from "@playwright/test";
import { login, getByTestId, setupApiIntercepts, isMobileViewport } from "../utils/helpers";

test.describe("Bank Accounts", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
    // Login before each test
    await login(page, "Heath93", "s3cret");
  });

  test("should display bank accounts page", async ({ page }) => {
    // Navigate to bank accounts page
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      await getByTestId(page, "sidenav-toggle").click();
      await getByTestId(page, "sidenav-bankaccounts").click();
    } else {
      await getByTestId(page, "nav-top-bank-accounts").click();
    }

    await expect(page).toHaveURL("/bankaccounts");
    await expect(getByTestId(page, "bankaccount-list")).toBeVisible();
  });

  test("should create a new bank account", async ({ page }) => {
    // Navigate to bank accounts page
    await getByTestId(page, "nav-top-bank-accounts").click();

    // Click create bank account button
    await getByTestId(page, "bankaccount-new").click();

    // Fill out bank account form
    await getByTestId(page, "bankaccount-bankName-input").fill("Test Bank");
    await getByTestId(page, "bankaccount-routingNumber-input").fill("123456789");
    await getByTestId(page, "bankaccount-accountNumber-input").fill("987654321");

    // Submit form
    await getByTestId(page, "bankaccount-submit").click();

    // Should redirect to bank accounts list
    await expect(page).toHaveURL("/bankaccounts");

    // Should show the new bank account
    await expect(page.locator("text=Test Bank")).toBeVisible();
  });

  test("should validate bank account form fields", async ({ page }) => {
    await getByTestId(page, "nav-top-bank-accounts").click();
    await getByTestId(page, "bankaccount-new").click();

    // Try to submit empty form
    await getByTestId(page, "bankaccount-submit").click();

    // Should show validation errors
    await expect(getByTestId(page, "bankaccount-bankName-input")).toHaveAttribute("required");
    await expect(getByTestId(page, "bankaccount-routingNumber-input")).toHaveAttribute("required");
    await expect(getByTestId(page, "bankaccount-accountNumber-input")).toHaveAttribute("required");
  });

  test("should validate routing number format", async ({ page }) => {
    await getByTestId(page, "nav-top-bank-accounts").click();
    await getByTestId(page, "bankaccount-new").click();

    // Fill form with invalid routing number
    await getByTestId(page, "bankaccount-bankName-input").fill("Test Bank");
    await getByTestId(page, "bankaccount-routingNumber-input").fill("123"); // Too short
    await getByTestId(page, "bankaccount-accountNumber-input").fill("987654321");

    await getByTestId(page, "bankaccount-submit").click();

    // Should show routing number validation error
    await expect(page.locator("text=Routing number must be 9 digits")).toBeVisible();
  });

  test("should validate account number format", async ({ page }) => {
    await getByTestId(page, "nav-top-bank-accounts").click();
    await getByTestId(page, "bankaccount-new").click();

    // Fill form with invalid account number
    await getByTestId(page, "bankaccount-bankName-input").fill("Test Bank");
    await getByTestId(page, "bankaccount-routingNumber-input").fill("123456789");
    await getByTestId(page, "bankaccount-accountNumber-input").fill("123"); // Too short

    await getByTestId(page, "bankaccount-submit").click();

    // Should show account number validation error
    await expect(page.locator("text=Account number must be at least 8 digits")).toBeVisible();
  });

  test("should edit an existing bank account", async ({ page }) => {
    await getByTestId(page, "nav-top-bank-accounts").click();

    // Wait for bank accounts to load and click edit on first account
    await expect(getByTestId(page, "bankaccount-list")).toBeVisible();

    const firstAccount = page.locator('[data-test^="bankaccount-list-item-"]').first();
    await firstAccount.locator('[data-test="bankaccount-edit"]').click();

    // Update bank name
    const bankNameInput = getByTestId(page, "bankaccount-bankName-input");
    await bankNameInput.clear();
    await bankNameInput.fill("Updated Bank Name");

    // Submit changes
    await getByTestId(page, "bankaccount-submit").click();

    // Should redirect back to list
    await expect(page).toHaveURL("/bankaccounts");

    // Should show updated bank name
    await expect(page.locator("text=Updated Bank Name")).toBeVisible();
  });

  test("should delete a bank account", async ({ page }) => {
    await getByTestId(page, "nav-top-bank-accounts").click();

    // Wait for bank accounts to load
    await expect(getByTestId(page, "bankaccount-list")).toBeVisible();

    // Count existing accounts
    const accountsBefore = await page.locator('[data-test^="bankaccount-list-item-"]').count();

    // Click delete on first account
    const firstAccount = page.locator('[data-test^="bankaccount-list-item-"]').first();
    await firstAccount.locator('[data-test="bankaccount-delete"]').click();

    // Confirm deletion in dialog
    await getByTestId(page, "confirmation-dialog-confirm").click();

    // Should have one less account
    await page.waitForTimeout(1000); // Wait for deletion to process
    const accountsAfter = await page.locator('[data-test^="bankaccount-list-item-"]').count();
    expect(accountsAfter).toBe(accountsBefore - 1);
  });

  test("should show bank account details", async ({ page }) => {
    await getByTestId(page, "nav-top-bank-accounts").click();

    // Wait for bank accounts to load
    await expect(getByTestId(page, "bankaccount-list")).toBeVisible();

    // Click on first bank account to view details
    const firstAccount = page.locator('[data-test^="bankaccount-list-item-"]').first();
    await firstAccount.click();

    // Should show bank account details
    await expect(getByTestId(page, "bankaccount-detail")).toBeVisible();
    await expect(getByTestId(page, "bankaccount-bank-name")).toBeVisible();
    await expect(getByTestId(page, "bankaccount-account-number")).toBeVisible();
    await expect(getByTestId(page, "bankaccount-routing-number")).toBeVisible();
  });

  test("should mask sensitive account information", async ({ page }) => {
    await getByTestId(page, "nav-top-bank-accounts").click();

    // Wait for bank accounts to load
    await expect(getByTestId(page, "bankaccount-list")).toBeVisible();

    // Account numbers should be masked (showing only last 4 digits)
    const accountNumberElements = page.locator('[data-test^="bankaccount-account-number-"]');
    const firstAccountNumber = await accountNumberElements.first().textContent();

    // Should contain masked format like "****1234"
    expect(firstAccountNumber).toMatch(/\*+\d{4}/);
  });

  test("should cancel bank account creation", async ({ page }) => {
    await getByTestId(page, "nav-top-bank-accounts").click();
    await getByTestId(page, "bankaccount-new").click();

    // Fill partial form
    await getByTestId(page, "bankaccount-bankName-input").fill("Test Bank");

    // Click cancel button
    await getByTestId(page, "bankaccount-cancel").click();

    // Should redirect back to bank accounts list
    await expect(page).toHaveURL("/bankaccounts");

    // Should not have created the bank account
    await expect(page.locator("text=Test Bank")).not.toBeVisible();
  });

  test("should handle empty bank accounts state", async ({ page }) => {
    // Mock empty bank accounts response
    await page.route("**/bankaccounts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });

    await getByTestId(page, "nav-top-bank-accounts").click();

    // Should show empty state message
    await expect(page.locator("text=No bank accounts found")).toBeVisible();
    await expect(getByTestId(page, "bankaccount-new")).toBeVisible();
  });

  test("should search bank accounts", async ({ page }) => {
    await getByTestId(page, "nav-top-bank-accounts").click();

    // Wait for bank accounts to load
    await expect(getByTestId(page, "bankaccount-list")).toBeVisible();

    // Use search functionality if available
    const searchInput = getByTestId(page, "bankaccount-search");
    if (await searchInput.isVisible()) {
      await searchInput.fill("Chase");

      // Should filter results
      const visibleAccounts = page.locator('[data-test^="bankaccount-list-item-"]:visible');
      const accountTexts = await visibleAccounts.allTextContents();

      // All visible accounts should contain "Chase"
      accountTexts.forEach((text) => {
        expect(text.toLowerCase()).toContain("chase");
      });
    }
  });

  test("should handle mobile responsive layout for bank accounts", async ({ page }) => {
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      // Open mobile navigation
      await getByTestId(page, "sidenav-toggle").click();

      // Click bank accounts from mobile menu
      await getByTestId(page, "sidenav-bankaccounts").click();

      await expect(page).toHaveURL("/bankaccounts");

      // Should adapt layout for mobile
      await expect(getByTestId(page, "bankaccount-list")).toBeVisible();
    }
  });
});
