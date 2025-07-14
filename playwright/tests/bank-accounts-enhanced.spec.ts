import { test, expect } from "@playwright/test";
import { login, getByTestId, setupApiIntercepts, isMobileViewport } from "../utils/helpers";

test.describe("Bank Account Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
    // Login before each test
    await login(page, "Heath93", "s3cret");
  });

  test("BANK_001: User Creates a New Bank Account - Valid Details", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is logged in, Navigate to Bank Accounts page
    await expect(page).toHaveURL("/");
    
    // Step 1: Navigate to bank accounts page via side navigation
    await getByTestId(page, "sidenav-bankaccounts").click();
    await expect(page).toHaveURL("/bankaccounts");
    await expect(getByTestId(page, "bankaccount-list")).toBeVisible();
    
    // Step 2: Click create new bank account button
    await getByTestId(page, "bankaccount-new").click();
    await expect(page).toHaveURL("/bankaccounts/new");
    await expect(getByTestId(page, "bankaccount-form")).toBeVisible();
    
    // Step 3: Fill bank name with unique value
    const bankName = `Test Bank ${Date.now()}`;
    await getByTestId(page, "bankaccount-bankName-input").fill(bankName);
    await expect(getByTestId(page, "bankaccount-bankName-input")).toHaveValue(bankName);
    
    // Step 4: Fill routing number
    await getByTestId(page, "bankaccount-routingNumber-input").fill("123456789");
    await expect(getByTestId(page, "bankaccount-routingNumber-input")).toHaveValue("123456789");
    
    // Step 5: Fill account number
    await getByTestId(page, "bankaccount-accountNumber-input").fill("987654321");
    await expect(getByTestId(page, "bankaccount-accountNumber-input")).toHaveValue("987654321");
    
    // Step 6: Submit form
    await getByTestId(page, "bankaccount-submit").click();
    
    // Expected result: Bank account is created successfully and user is redirected to bank accounts list
    await expect(page).toHaveURL("/bankaccounts");
    await expect(page.locator(`text=${bankName}`)).toBeVisible();
  });

  test("BANK_002: User Creates Bank Account - Validation Errors", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is logged in, Navigate to Bank Account creation page
    await expect(page).toHaveURL("/");
    
    // Step 1: Navigate to bank accounts page via side navigation
    await getByTestId(page, "sidenav-bankaccounts").click();
    await expect(page).toHaveURL("/bankaccounts");
    
    // Step 2: Click create new bank account button
    await getByTestId(page, "bankaccount-new").click();
    await expect(page).toHaveURL("/bankaccounts/new");
    
    // Step 3: Try to submit empty form - this should not allow submission
    await getByTestId(page, "bankaccount-submit").click();
    
    // Expected result: Form stays on the same page due to validation errors
    await expect(page).toHaveURL("/bankaccounts/new");
  });

  test("BANK_003: User Deletes a Bank Account", async ({ page }) => {
    // Preconditions: Application is running on localhost:3000, User is logged in, User has existing bank accounts
    await expect(page).toHaveURL("/");
    
    // Step 1: Navigate to bank accounts page via side navigation
    await getByTestId(page, "sidenav-bankaccounts").click();
    await expect(page).toHaveURL("/bankaccounts");
    await expect(getByTestId(page, "bankaccount-list")).toBeVisible();
    
    // Step 2: Delete a bank account
    // Find accounts that are not deleted (have delete buttons visible)
    const activeAccounts = page.locator('[data-test^="bankaccount-list-item-"]').locator('[data-test="bankaccount-delete"]');
    const accountsCountBefore = await activeAccounts.count();
    
    if (accountsCountBefore > 0) {
      // Click delete on first active account
      await activeAccounts.first().click();

      // Wait for deletion to process
      await page.waitForTimeout(1000);
      
      // Expected result: Bank account is soft deleted and marked as deleted
      await expect(page.locator("text=(Deleted)").first()).toBeVisible();
    } else {
      // Skip test if no deletable accounts are available
      console.log("No active bank accounts available to delete");
    }
  });
});