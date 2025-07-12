import { test, expect } from '@playwright/test';
import { 
  login, 
  getByTestId, 
  waitForResponse,
  setupApiIntercepts,
  isMobileViewport 
} from '../utils/helpers';

test.describe('Transactions', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
    // Login before each test
    await login(page, 'Katharina_Bernier', 's3cret');
  });

  test('should display transaction feeds on home page', async ({ page }) => {
    await expect(page).toHaveURL('/');
    
    // Should show transaction feeds
    await expect(getByTestId(page, 'transaction-list')).toBeVisible();
    
    // Should show navigation tabs
    await expect(getByTestId(page, 'nav-public-tab')).toBeVisible();
    await expect(getByTestId(page, 'nav-contacts-tab')).toBeVisible();
    await expect(getByTestId(page, 'nav-personal-tab')).toBeVisible();
  });

  test('should create a new transaction', async ({ page }) => {
    // Navigate to new transaction page
    await getByTestId(page, 'nav-top-new-transaction').click();
    await expect(page).toHaveURL('/transaction/new');
    
    // Step 1: Select recipient
    await getByTestId(page, 'user-list-search-input').fill('Devon');
    await page.waitForTimeout(1000); // Wait for search results
    
    // Click on first search result
    await page.locator('[data-testid^="user-list-item-"]').first().click();
    await getByTestId(page, 'user-list-item-next').click();
    
    // Step 2: Enter amount and description
    await expect(page).toHaveURL(/\/transaction\/new$/);
    
    await getByTestId(page, 'transaction-create-amount-input').fill('25.50');
    await getByTestId(page, 'transaction-create-description-input').fill('Test payment');
    
    // Select privacy level
    await getByTestId(page, 'transaction-create-privacy-private').click();
    
    await getByTestId(page, 'transaction-create-submit-payment').click();
    
    // Step 3: Confirm transaction
    await expect(page.locator('text=Pay Devon')).toBeVisible();
    await expect(page.locator('text=$25.50')).toBeVisible();
    await expect(page.locator('text=Test payment')).toBeVisible();
    
    await getByTestId(page, 'transaction-create-submit-payment').click();
    
    // Should redirect to transaction complete page
    await expect(page).toHaveURL(/\/transaction\/.*\/complete$/);
    await expect(page.locator('text=Paid')).toBeVisible();
  });

  test('should request money from another user', async ({ page }) => {
    // Navigate to new transaction page
    await getByTestId(page, 'nav-top-new-transaction').click();
    
    // Step 1: Select recipient
    await getByTestId(page, 'user-list-search-input').fill('Devon');
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid^="user-list-item-"]').first().click();
    await getByTestId(page, 'user-list-item-next').click();
    
    // Step 2: Enter amount and description for request
    await getByTestId(page, 'transaction-create-amount-input').fill('30.00');
    await getByTestId(page, 'transaction-create-description-input').fill('Lunch money');
    
    await getByTestId(page, 'transaction-create-privacy-public').click();
    
    // Click request instead of pay
    await getByTestId(page, 'transaction-create-submit-request').click();
    
    // Step 3: Confirm request
    await expect(page.locator('text=Request from Devon')).toBeVisible();
    await expect(page.locator('text=$30.00')).toBeVisible();
    
    await getByTestId(page, 'transaction-create-submit-request').click();
    
    // Should redirect to transaction complete page
    await expect(page).toHaveURL(/\/transaction\/.*\/complete$/);
    await expect(page.locator('text=Requested')).toBeVisible();
  });

  test('should filter transactions by date range', async ({ page }) => {
    await expect(page).toHaveURL('/');
    
    // Open date range filter
    await getByTestId(page, 'transaction-list-filter-date-range-button').click();
    
    // Set date range (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    await getByTestId(page, 'transaction-list-filter-date-range-start').fill(
      lastWeek.toISOString().split('T')[0]
    );
    await getByTestId(page, 'transaction-list-filter-date-range-end').fill(
      today.toISOString().split('T')[0]
    );
    
    await getByTestId(page, 'transaction-list-filter-date-range-apply').click();
    
    // Verify filter is applied
    await expect(page.locator('text=Filtered by date')).toBeVisible();
  });

  test('should filter transactions by amount range', async ({ page }) => {
    await expect(page).toHaveURL('/');
    
    // Open amount range filter
    await getByTestId(page, 'transaction-list-filter-amount-range-button').click();
    
    // Set amount range
    await getByTestId(page, 'transaction-list-filter-amount-range-min').fill('10');
    await getByTestId(page, 'transaction-list-filter-amount-range-max').fill('100');
    
    await getByTestId(page, 'transaction-list-filter-amount-range-apply').click();
    
    // Verify filter is applied
    await expect(page.locator('text=Filtered by amount')).toBeVisible();
  });

  test('should view transaction details', async ({ page }) => {
    await expect(page).toHaveURL('/');
    
    // Wait for transactions to load
    await expect(getByTestId(page, 'transaction-list')).toBeVisible();
    
    // Click on first transaction
    const firstTransaction = page.locator('[data-testid^="transaction-item-"]').first();
    await firstTransaction.click();
    
    // Should navigate to transaction detail page
    await expect(page).toHaveURL(/\/transaction\/.*$/);
    
    // Should show transaction details
    await expect(getByTestId(page, 'transaction-detail')).toBeVisible();
    await expect(getByTestId(page, 'transaction-amount')).toBeVisible();
    await expect(getByTestId(page, 'transaction-description')).toBeVisible();
  });

  test('should like a transaction', async ({ page }) => {
    await expect(page).toHaveURL('/');
    
    // Wait for transactions to load
    await expect(getByTestId(page, 'transaction-list')).toBeVisible();
    
    // Find and click like button on first transaction
    const firstTransactionLike = page.locator('[data-testid^="transaction-like-"]').first();
    await firstTransactionLike.click();
    
    // Should show liked state
    await expect(firstTransactionLike).toHaveClass(/.*liked.*/);
  });

  test('should comment on a transaction', async ({ page }) => {
    await expect(page).toHaveURL('/');
    
    // Click on first transaction to view details
    const firstTransaction = page.locator('[data-testid^="transaction-item-"]').first();
    await firstTransaction.click();
    
    // Add a comment
    await getByTestId(page, 'transaction-comment-input').fill('Great transaction!');
    await getByTestId(page, 'transaction-comment-submit').click();
    
    // Should show the comment
    await expect(page.locator('text=Great transaction!')).toBeVisible();
  });

  test('should switch between transaction feed tabs', async ({ page }) => {
    await expect(page).toHaveURL('/');
    
    // Test Public tab
    await getByTestId(page, 'nav-public-tab').click();
    await expect(getByTestId(page, 'transaction-list')).toBeVisible();
    
    // Test Contacts tab
    await getByTestId(page, 'nav-contacts-tab').click();
    await expect(getByTestId(page, 'transaction-list')).toBeVisible();
    
    // Test Personal tab
    await getByTestId(page, 'nav-personal-tab').click();
    await expect(getByTestId(page, 'transaction-list')).toBeVisible();
  });

  test('should validate transaction creation form', async ({ page }) => {
    await getByTestId(page, 'nav-top-new-transaction').click();
    
    // Step 1: Try to proceed without selecting a user
    await getByTestId(page, 'user-list-item-next').click();
    
    // Should still be on step 1
    await expect(getByTestId(page, 'user-list-search-input')).toBeVisible();
    
    // Select a user
    await getByTestId(page, 'user-list-search-input').fill('Devon');
    await page.waitForTimeout(1000);
    await page.locator('[data-testid^="user-list-item-"]').first().click();
    await getByTestId(page, 'user-list-item-next').click();
    
    // Step 2: Try to submit without amount
    await getByTestId(page, 'transaction-create-submit-payment').click();
    
    // Should show validation error
    await expect(getByTestId(page, 'transaction-create-amount-input')).toHaveAttribute('required');
  });

  test('should handle mobile responsive layout', async ({ page }) => {
    const isMobile = await isMobileViewport(page);
    
    if (isMobile) {
      // Open mobile navigation
      await getByTestId(page, 'sidenav-toggle').click();
      
      // Click new transaction from mobile menu
      await getByTestId(page, 'sidenav-new-transaction').click();
      
      await expect(page).toHaveURL('/transaction/new');
    }
  });
});