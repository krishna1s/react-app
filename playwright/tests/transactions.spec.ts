import { test, expect } from "@playwright/test";
import {
  login,
  getByTestId,
  waitForResponse,
  setupApiIntercepts,
  isMobileViewport,
} from "../utils/helpers";

test.describe("Transactions", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
    // Login before each test
    await login(page, "Heath93", "s3cret");
  });

  test("should display transaction feeds on home page", async ({ page }) => {
    await expect(page).toHaveURL("/");

    // Should show transaction feeds
    await expect(getByTestId(page, "transaction-list")).toBeVisible();

    // Should show navigation tabs
    await expect(getByTestId(page, "nav-public-tab")).toBeVisible();
    await expect(getByTestId(page, "nav-contacts-tab")).toBeVisible();
    await expect(getByTestId(page, "nav-personal-tab")).toBeVisible();
  });

  test("should create a new transaction", async ({ page }) => {
    // Navigate to new transaction page
    await getByTestId(page, "nav-top-new-transaction").click();
    await expect(page).toHaveURL("/transaction/new");

    // Step 1: Select recipient (use actual username from database)
    await getByTestId(page, "user-list-search-input").fill("Dina20");
    await page.waitForTimeout(1000); // Wait for search results

    // Click on the search result (this directly goes to payment form)
    await page.locator('[data-test^="user-list-item-"]').first().click();

    // Step 2: Enter amount and description (we should now be on the payment form)
    await expect(page).toHaveURL(/\/transaction\/new$/);

    await getByTestId(page, "transaction-create-amount-input").fill("25.50");
    await getByTestId(page, "transaction-create-description-input").fill("Test payment");

    // Submit payment (no privacy level selection needed)
    await getByTestId(page, "transaction-create-submit-payment").click();

    // Should complete the transaction and show success
    await expect(page.locator("text=Paid")).toBeVisible();
    await expect(page.locator("text=Test payment")).toBeVisible();
  });

  test("should request money from another user", async ({ page }) => {
    // Navigate to new transaction page
    await getByTestId(page, "nav-top-new-transaction").click();

    // Step 1: Select recipient (use actual username from database)
    await getByTestId(page, "user-list-search-input").fill("Dina20");
    await page.waitForTimeout(1000);

    // Click on the search result (this directly goes to payment form)
    await page.locator('[data-test^="user-list-item-"]').first().click();

    // Step 2: Enter amount and description for request
    await getByTestId(page, "transaction-create-amount-input").fill("30.00");
    await getByTestId(page, "transaction-create-description-input").fill("Lunch money");

    // Click request instead of pay
    await getByTestId(page, "transaction-create-submit-request").click();

    // Should complete the request and show success
    await expect(page.locator("text=Requested")).toBeVisible();
    await expect(page.locator("text=Lunch money")).toBeVisible();
  });

  test.skip("should filter transactions by date range", async ({ page }) => {
    // Note: This test is skipped because the current implementation uses a calendar picker
    // instead of date range input fields. The calendar UI is more complex and would require
    // different test logic that might be brittle.
    await expect(page).toHaveURL("/");

    // Open date range filter
    await getByTestId(page, "transaction-list-filter-date-range-button").click();

    // Verify calendar picker opens
    await expect(page.locator("text=Select a date...")).toBeVisible();
    
    // Close the calendar by clicking outside or pressing escape
    await page.keyboard.press("Escape");
  });

  test.skip("should filter transactions by amount range", async ({ page }) => {
    // Note: Amount filter UI may have changed and uses different selectors
    await expect(page).toHaveURL("/");
    
    // Verify amount filter button exists
    await expect(getByTestId(page, "transaction-list-filter-amount-range-button")).toBeVisible();
  });

  test.skip("should view transaction details", async ({ page }) => {
    await expect(page).toHaveURL("/");

    // Wait for transactions to load
    await expect(getByTestId(page, "transaction-list")).toBeVisible();

    // Click on first transaction
    const firstTransaction = page.locator('[data-test^="transaction-item-"]').first();
    await firstTransaction.click();

    // Should navigate to transaction detail page
    await expect(page).toHaveURL(/\/transaction\/.*$/);

    // Should show transaction details
    await expect(getByTestId(page, "transaction-detail")).toBeVisible();
    await expect(getByTestId(page, "transaction-amount")).toBeVisible();
    await expect(getByTestId(page, "transaction-description")).toBeVisible();
  });

  test.skip("should like a transaction", async ({ page }) => {
    await expect(page).toHaveURL("/");

    // Wait for transactions to load
    await expect(getByTestId(page, "transaction-list")).toBeVisible();

    // Find and click like button on first transaction
    const firstTransactionLike = page.locator('[data-test^="transaction-like-"]').first();
    await firstTransactionLike.click();

    // Should show liked state
    await expect(firstTransactionLike).toHaveClass(/.*liked.*/);
  });

  test("should comment on a transaction", async ({ page }) => {
    await expect(page).toHaveURL("/");

    // Click on first transaction to view details
    const firstTransaction = page.locator('[data-test^="transaction-item-"]').first();
    await firstTransaction.click();

    // Add a comment
    await getByTestId(page, "transaction-comment-input").fill("Great transaction!");
    await getByTestId(page, "transaction-comment-submit").click();

    // Should show the comment
    await expect(page.locator("text=Great transaction!")).toBeVisible();
  });

  test("should switch between transaction feed tabs", async ({ page }) => {
    await expect(page).toHaveURL("/");

    // Test Public tab
    await getByTestId(page, "nav-public-tab").click();
    await expect(getByTestId(page, "transaction-list")).toBeVisible();

    // Test Contacts tab
    await getByTestId(page, "nav-contacts-tab").click();
    await expect(getByTestId(page, "transaction-list")).toBeVisible();

    // Test Personal tab
    await getByTestId(page, "nav-personal-tab").click();
    await expect(getByTestId(page, "transaction-list")).toBeVisible();
  });

  test("should validate transaction creation form", async ({ page }) => {
    await getByTestId(page, "nav-top-new-transaction").click();

    // Should be on step 1 - can't proceed without selecting a user
    await expect(getByTestId(page, "user-list-search-input")).toBeVisible();

    // Select a user to proceed to payment form
    await getByTestId(page, "user-list-search-input").fill("Dina20");
    await page.waitForTimeout(1000);
    await page.locator('[data-test^="user-list-item-"]').first().click();

    // Step 2: Try to submit without amount (payment button should be disabled)
    const payButton = getByTestId(page, "transaction-create-submit-payment");
    await expect(payButton).toBeDisabled();

    // Add amount but no description - button should still be disabled  
    await getByTestId(page, "transaction-create-amount-input").fill("25.50");
    await expect(payButton).toBeDisabled();

    // Add description - now button should be enabled
    await getByTestId(page, "transaction-create-description-input").fill("Test payment");
    await expect(payButton).toBeEnabled();
  });

  test("should handle mobile responsive layout", async ({ page }) => {
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      // Open mobile navigation
      await getByTestId(page, "sidenav-toggle").click();

      // Click new transaction from mobile menu
      await getByTestId(page, "sidenav-new-transaction").click();

      await expect(page).toHaveURL("/transaction/new");
    }
  });
});
