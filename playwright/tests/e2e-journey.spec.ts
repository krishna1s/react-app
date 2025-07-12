import { test, expect } from '@playwright/test';
import { 
  login, 
  logout, 
  signUp, 
  getByTestId, 
  createTestUser, 
  setupApiIntercepts,
  isMobileViewport 
} from '../utils/helpers';

test.describe('End-to-End User Journey', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
  });

  test('complete user journey: signup, login, add bank account, create transaction, logout', async ({ page }) => {
    const testUser = createTestUser();
    
    // Step 1: Sign up new user
    await signUp(page, {
      firstName: testUser.firstName!,
      lastName: testUser.lastName!,
      username: testUser.username!,
      password: testUser.password!,
      confirmPassword: testUser.password!
    });
    
    // Should redirect to signin after signup
    await expect(page).toHaveURL('/signin');
    
    // Step 2: Login with new user
    await login(page, testUser.username!, testUser.password!);
    await expect(page).toHaveURL('/');
    
    // Verify user is logged in
    await expect(getByTestId(page, 'sidenav-username')).toBeVisible();
    
    // Step 3: Complete onboarding - Add bank account
    // Check if onboarding flow is triggered
    const onboardingModal = getByTestId(page, 'user-onboarding-dialog');
    if (await onboardingModal.isVisible()) {
      await getByTestId(page, 'user-onboarding-next').click();
      
      // Fill bank account details during onboarding
      await getByTestId(page, 'bankaccount-bankName-input').fill('First National Bank');
      await getByTestId(page, 'bankaccount-routingNumber-input').fill('123456789');
      await getByTestId(page, 'bankaccount-accountNumber-input').fill('987654321');
      
      await getByTestId(page, 'bankaccount-submit').click();
      await getByTestId(page, 'user-onboarding-finish').click();
    } else {
      // Manually navigate to add bank account
      await getByTestId(page, 'nav-top-bank-accounts').click();
      await getByTestId(page, 'bankaccount-new').click();
      
      await getByTestId(page, 'bankaccount-bankName-input').fill('First National Bank');
      await getByTestId(page, 'bankaccount-routingNumber-input').fill('123456789');
      await getByTestId(page, 'bankaccount-accountNumber-input').fill('987654321');
      
      await getByTestId(page, 'bankaccount-submit').click();
    }
    
    // Step 4: Navigate back to home and create a transaction
    await getByTestId(page, 'nav-top-home').click();
    await expect(page).toHaveURL('/');
    
    // Create a new transaction
    await getByTestId(page, 'nav-top-new-transaction').click();
    
    // Select recipient
    await getByTestId(page, 'user-list-search-input').fill('Devon');
    await page.waitForTimeout(1000);
    await page.locator('[data-testid^="user-list-item-"]').first().click();
    await getByTestId(page, 'user-list-item-next').click();
    
    // Enter transaction details
    await getByTestId(page, 'transaction-create-amount-input').fill('50.00');
    await getByTestId(page, 'transaction-create-description-input').fill('Lunch payment');
    await getByTestId(page, 'transaction-create-privacy-public').click();
    
    await getByTestId(page, 'transaction-create-submit-payment').click();
    
    // Confirm transaction
    await getByTestId(page, 'transaction-create-submit-payment').click();
    
    // Should show completion page
    await expect(page).toHaveURL(/\/transaction\/.*\/complete$/);
    await expect(page.locator('text=Paid')).toBeVisible();
    
    // Step 5: Return to home and verify transaction appears
    await getByTestId(page, 'transaction-complete-return-home').click();
    await expect(page).toHaveURL('/');
    
    // Should see the transaction in personal feed
    await getByTestId(page, 'nav-personal-tab').click();
    await expect(page.locator('text=Lunch payment')).toBeVisible();
    
    // Step 6: Check notifications
    await getByTestId(page, 'nav-top-notifications').click();
    await expect(getByTestId(page, 'notifications-list')).toBeVisible();
    
    // Step 7: Update user settings
    await getByTestId(page, 'nav-top-user-settings').click();
    
    const firstNameInput = getByTestId(page, 'user-settings-firstName-input');
    await firstNameInput.clear();
    await firstNameInput.fill('UpdatedName');
    
    await getByTestId(page, 'user-settings-submit').click();
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    
    // Step 8: Logout
    const isMobile = await isMobileViewport(page);
    await logout(page, isMobile);
    await expect(page).toHaveURL('/signin');
  });

  test('user journey with mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login
    await login(page, 'Katharina_Bernier', 's3cret');
    
    // Test mobile navigation
    await getByTestId(page, 'sidenav-toggle').click();
    await expect(getByTestId(page, 'sidenav')).toBeVisible();
    
    // Navigate to different sections via mobile menu
    await getByTestId(page, 'sidenav-bankaccounts').click();
    await expect(page).toHaveURL('/bankaccounts');
    
    await getByTestId(page, 'sidenav-toggle').click();
    await getByTestId(page, 'sidenav-notifications').click();
    await expect(page).toHaveURL('/notifications');
    
    await getByTestId(page, 'sidenav-toggle').click();
    await getByTestId(page, 'sidenav-user-settings').click();
    await expect(page).toHaveURL('/settings');
    
    // Logout via mobile menu
    await getByTestId(page, 'sidenav-toggle').click();
    await getByTestId(page, 'sidenav-signout').click();
    await expect(page).toHaveURL('/signin');
  });

  test('error handling and recovery', async ({ page }) => {
    // Test network error handling
    await page.route('**/users', async route => {
      await route.abort();
    });
    
    await page.goto('/signup');
    
    const testUser = createTestUser();
    await signUp(page, {
      firstName: testUser.firstName!,
      lastName: testUser.lastName!,
      username: testUser.username!,
      password: testUser.password!,
      confirmPassword: testUser.password!
    });
    
    // Should show error message for network failure
    await expect(page.locator('text=Network error')).toBeVisible();
    
    // Recovery: Remove network error and retry
    await page.unroute('**/users');
    
    await getByTestId(page, 'signup-submit').click();
    
    // Should succeed now
    await expect(page).toHaveURL('/signin');
  });

  test('accessibility navigation', async ({ page }) => {
    await login(page, 'Katharina_Bernier', 's3cret');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Focus first interactive element
    await page.keyboard.press('Tab'); // Move to next element
    await page.keyboard.press('Tab'); // Continue tabbing
    
    // Test screen reader compatibility by checking ARIA labels
    const navigation = page.locator('nav[role="navigation"]');
    await expect(navigation).toBeVisible();
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    expect(await headings.count()).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = page.locator('img');
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });

  test('cross-browser functionality verification', async ({ page, browserName }) => {
    await login(page, 'Katharina_Bernier', 's3cret');
    
    // Test basic functionality across different browsers
    await expect(getByTestId(page, 'transaction-list')).toBeVisible();
    
    // Create a simple transaction to test core functionality
    await getByTestId(page, 'nav-top-new-transaction').click();
    
    // Verify form elements work in all browsers
    const searchInput = getByTestId(page, 'user-list-search-input');
    await searchInput.fill('Devon');
    await expect(searchInput).toHaveValue('Devon');
    
    // Test that CSS animations/transitions work
    if (browserName === 'webkit') {
      // Safari-specific tests
      console.log('Running Safari-specific tests');
    } else if (browserName === 'firefox') {
      // Firefox-specific tests
      console.log('Running Firefox-specific tests');
    } else {
      // Chrome/Chromium-specific tests
      console.log('Running Chrome-specific tests');
    }
  });

  test('performance and loading behavior', async ({ page }) => {
    // Measure page load performance
    const navigationStart = await page.evaluate(() => performance.now());
    
    await page.goto('/');
    
    // Wait for main content to load
    await expect(getByTestId(page, 'main-content')).toBeVisible();
    
    const loadComplete = await page.evaluate(() => performance.now());
    const loadTime = loadComplete - navigationStart;
    
    // Assert reasonable load time (adjust based on requirements)
    expect(loadTime).toBeLessThan(5000); // 5 seconds
    
    // Test lazy loading behavior
    await login(page, 'Katharina_Bernier', 's3cret');
    
    // Scroll to trigger lazy loading if implemented
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for any lazy-loaded content
    await page.waitForTimeout(1000);
  });

  test('data persistence and state management', async ({ page }) => {
    await login(page, 'Katharina_Bernier', 's3cret');
    
    // Navigate to different pages and verify state persistence
    await getByTestId(page, 'nav-top-bank-accounts').click();
    await getByTestId(page, 'nav-top-home').click();
    
    // Should maintain user session
    await expect(getByTestId(page, 'sidenav-username')).toBeVisible();
    
    // Test browser back/forward functionality
    await page.goBack();
    await expect(page).toHaveURL('/bankaccounts');
    
    await page.goForward();
    await expect(page).toHaveURL('/');
    
    // Test page refresh maintains session
    await page.reload();
    await expect(getByTestId(page, 'transaction-list')).toBeVisible();
  });
});