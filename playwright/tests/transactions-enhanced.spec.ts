import { test, expect } from "@playwright/test";
import {
  login,
  getByTestId,
  setupApiIntercepts,
  isMobileViewport,
} from "../utils/helpers";

test.describe("Transaction Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
    // Login before each test
    await login(page, "Heath93", "s3cret");
  });

  test("TRANS_001: User Initiates a Transfer - Valid Details", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is logged in, User has sufficient balance, Navigate to Transfer page
    await expect(page).toHaveURL("/");
    
    // Step 1: Click new transaction button
    await getByTestId(page, "nav-top-new-transaction").click();
    await expect(page).toHaveURL("/transaction/new");
    
    // Step 2: Search for recipient (use actual username from database)
    await getByTestId(page, "user-list-search-input").fill("Dina20");
    await page.waitForTimeout(1000); // Wait for search results
    await expect(page.locator("[data-test^='user-list-item-']")).toBeVisible();
    
    // Step 3: Select recipient
    await page.locator("[data-test^='user-list-item-']").first().click();
    await expect(getByTestId(page, "transaction-create-amount-input")).toBeVisible();
    
    // Step 4: Enter amount
    await getByTestId(page, "transaction-create-amount-input").locator("input").fill("100");
    await expect(getByTestId(page, "transaction-create-amount-input").locator("input")).toHaveValue("$100");
    
    // Step 5: Enter description
    await getByTestId(page, "transaction-create-description-input").locator("input").fill("Test payment");
    await expect(getByTestId(page, "transaction-create-description-input").locator("input")).toHaveValue("Test payment");
    
    // Step 6: Click pay button - just click without checking text
    await getByTestId(page, "transaction-create-submit-payment").click();
    
    // Step 7: Confirm payment - check confirmation screen then click again
    await expect(page.locator("text=Pay Dina")).toBeVisible();
    await expect(page.locator("text=$100")).toBeVisible();
    await expect(page.locator("text=Test payment")).toBeVisible();
    
    await getByTestId(page, "transaction-create-submit-payment").click();
    
    // Expected result: Transfer is completed successfully and user is redirected to completion page
    await expect(page).toHaveURL(/\/transaction\/.*\/complete/);
    await expect(page.locator("text=Paid")).toBeVisible();
  });

  test("TRANS_002: User Initiates a Transfer - Invalid Amount", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is logged in, Navigate to Transfer page
    await expect(page).toHaveURL("/");
    
    // Step 1: Click new transaction button
    await getByTestId(page, "nav-top-new-transaction").click();
    await expect(page).toHaveURL("/transaction/new");
    
    // Step 2: Search for recipient (use actual username from database)
    await getByTestId(page, "user-list-search-input").fill("Dina20");
    await page.waitForTimeout(1000); // Wait for search results
    await expect(page.locator("[data-test^='user-list-item-']")).toBeVisible();
    
    // Step 3: Select recipient
    await page.locator("[data-test^='user-list-item-']").first().click();
    await expect(getByTestId(page, "transaction-create-amount-input")).toBeVisible();
    
    // Step 4: Enter invalid amount
    await getByTestId(page, "transaction-create-amount-input").locator("input").fill("invalid");
    await expect(getByTestId(page, "transaction-create-amount-input").locator("input")).toHaveValue("invalid");
    
    // Step 5: Enter description
    await getByTestId(page, "transaction-create-description-input").locator("input").fill("Test payment");
    await expect(getByTestId(page, "transaction-create-description-input").locator("input")).toHaveValue("Test payment");
    
    // Step 6: Verify validation error appears and buttons are disabled
    await expect(page.locator("text=Please enter a valid amount")).toBeVisible();
    await expect(getByTestId(page, "transaction-create-submit-payment")).toBeDisabled();
  });

  test("TRANS_003: User Views Transaction History", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is logged in, Navigate to Transaction History page
    await expect(page).toHaveURL("/");
    
    // Step 1: Click personal tab to view transaction history
    await getByTestId(page, "nav-personal-tab").click();
    await expect(getByTestId(page, "transaction-list")).toBeVisible();
    await expect(page).toHaveURL("/personal");
    
    // Expected result: Transaction history is displayed
    await expect(getByTestId(page, "transaction-list")).toBeVisible();
  });

  test.skip("TRANS_004: User Downloads Transaction Report", async ({ page }) => {
    // Transaction report download feature is not implemented
    await expect(page).toHaveURL("/");
    
    // Step 1: Navigate to transaction history
    await getByTestId(page, "nav-personal-tab").click();
    
    // Note: Feature not available in current implementation
  });
});