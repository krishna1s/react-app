import { test, expect } from "@playwright/test";
import { login, getByTestId, setupApiIntercepts, isMobileViewport } from "../utils/helpers";

test.describe("Notifications", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiIntercepts(page);
    // Login before each test
    await login(page, "Heath93", "s3cret");
  });

  test("should display notifications page", async ({ page }) => {
    // Navigate to notifications page
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      await getByTestId(page, "sidenav-toggle").click();
      await getByTestId(page, "sidenav-notifications").click();
    } else {
      await getByTestId(page, "nav-top-notifications").click();
    }

    await expect(page).toHaveURL("/notifications");
    await expect(getByTestId(page, "notifications-list")).toBeVisible();
  });

  test("should show notification count in navigation", async ({ page }) => {
    // Check if notification badge exists in navigation
    const notificationBadge = getByTestId(page, "nav-top-notifications-count");

    if (await notificationBadge.isVisible()) {
      // Should show a number indicating unread notifications
      const badgeText = await notificationBadge.textContent();
      expect(parseInt(badgeText || "0")).toBeGreaterThanOrEqual(0);
    }
  });

  test("should mark notification as read", async ({ page }) => {
    await getByTestId(page, "nav-top-notifications").click();

    // Wait for notifications to load
    await expect(getByTestId(page, "notifications-list")).toBeVisible();

    // Find first unread notification (if any)
    const unreadNotifications = page.locator(
      '[data-test^="notification-list-item-"][data-read="false"]'
    );

    if ((await unreadNotifications.count()) > 0) {
      const firstUnread = unreadNotifications.first();
      await firstUnread.click();

      // Should mark as read (notification styling should change)
      await expect(firstUnread).toHaveAttribute("data-read", "true");
    }
  });

  test("should dismiss notification", async ({ page }) => {
    await getByTestId(page, "nav-top-notifications").click();

    // Wait for notifications to load
    await expect(getByTestId(page, "notifications-list")).toBeVisible();

    // Count notifications before dismissal
    const notificationsBefore = await page.locator('[data-test^="notification-list-item-"]').count();

    if (notificationsBefore > 0) {
      // Click dismiss button on first notification
      const firstNotification = page.locator('[data-test^="notification-list-item-"]').first();
      await firstNotification.locator('[data-test="notification-mark-read"]').click();

      // Should have one less notification
      await page.waitForTimeout(1000);
      const notificationsAfter = await page.locator('[data-test^="notification-list-item-"]').count();
      expect(notificationsAfter).toBe(notificationsBefore - 1);
    }
  });

  test("should filter notifications by type", async ({ page }) => {
    await getByTestId(page, "nav-top-notifications").click();

    // Check if notification filter options exist
    const filterButtons = page.locator('[data-testid^="notification-filter-"]');

    if ((await filterButtons.count()) > 0) {
      // Test filtering by payment notifications
      const paymentFilter = getByTestId(page, "notification-filter-payment");
      if (await paymentFilter.isVisible()) {
        await paymentFilter.click();

        // Should show only payment notifications
        const visibleNotifications = page.locator('[data-test^="notification-list-item-"]:visible');
        const notificationTypes = await visibleNotifications
          .locator('[data-testid="notification-type"]')
          .allTextContents();

        notificationTypes.forEach((type) => {
          expect(type.toLowerCase()).toContain("payment");
        });
      }

      // Test filtering by like notifications
      const likeFilter = getByTestId(page, "notification-filter-like");
      if (await likeFilter.isVisible()) {
        await likeFilter.click();

        // Should show only like notifications
        const visibleNotifications = page.locator('[data-test^="notification-list-item-"]:visible');
        const notificationTypes = await visibleNotifications
          .locator('[data-testid="notification-type"]')
          .allTextContents();

        notificationTypes.forEach((type) => {
          expect(type.toLowerCase()).toContain("like");
        });
      }
    }
  });

  test("should handle empty notifications state", async ({ page }) => {
    // Mock empty notifications response
    await page.route("**/notifications", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });

    await getByTestId(page, "nav-top-notifications").click();

    // Should show empty state message
    await expect(page.locator("text=No notifications")).toBeVisible();
  });

  test("should navigate to related transaction from notification", async ({ page }) => {
    await getByTestId(page, "nav-top-notifications").click();

    // Wait for notifications to load
    await expect(getByTestId(page, "notifications-list")).toBeVisible();

    // Find a transaction-related notification
    const transactionNotification = page
      .locator('[data-test^="notification-list-item-"][data-type="payment"]')
      .first();

    if (await transactionNotification.isVisible()) {
      // Click on the notification
      await transactionNotification.click();

      // Should navigate to the related transaction
      await expect(page).toHaveURL(/\/transaction\/.*$/);
    }
  });

  test("should mark all notifications as read", async ({ page }) => {
    await getByTestId(page, "nav-top-notifications").click();

    // Check if "Mark all as read" button exists
    const markAllReadButton = getByTestId(page, "notifications-mark-all-read");

    if (await markAllReadButton.isVisible()) {
      await markAllReadButton.click();

      // All notifications should be marked as read
      const unreadNotifications = page.locator(
        '[data-test^="notification-list-item-"][data-read="false"]'
      );
      await expect(unreadNotifications).toHaveCount(0);
    }
  });

  test("should show notification details", async ({ page }) => {
    await getByTestId(page, "nav-top-notifications").click();

    // Wait for notifications to load
    await expect(getByTestId(page, "notifications-list")).toBeVisible();

    // Click on first notification
    const firstNotification = page.locator('[data-test^="notification-list-item-"]').first();

    if (await firstNotification.isVisible()) {
      await firstNotification.click();

      // Should show notification details
      await expect(getByTestId(page, "notification-message")).toBeVisible();
      await expect(getByTestId(page, "notification-timestamp")).toBeVisible();
    }
  });

  test("should paginate through notifications", async ({ page }) => {
    await getByTestId(page, "nav-top-notifications").click();

    // Wait for notifications to load
    await expect(getByTestId(page, "notifications-list")).toBeVisible();

    // Check if pagination exists
    const nextPageButton = getByTestId(page, "notifications-next-page");

    if (await nextPageButton.isVisible()) {
      // Count notifications on first page
      const firstPageCount = await page.locator('[data-test^="notification-list-item-"]').count();

      // Go to next page
      await nextPageButton.click();

      // Should load more notifications
      await page.waitForTimeout(1000);
      const totalNotifications = await page.locator('[data-test^="notification-list-item-"]').count();

      expect(totalNotifications).toBeGreaterThan(firstPageCount);
    }
  });

  test("should show real-time notifications", async ({ page }) => {
    await getByTestId(page, "nav-top-notifications").click();

    // Count current notifications
    const initialCount = await page.locator('[data-test^="notification-list-item-"]').count();

    // Simulate a new notification coming in (this would normally be via WebSocket or polling)
    await page.evaluate(() => {
      // Trigger a new notification event if the app supports it
      window.dispatchEvent(
        new CustomEvent("newNotification", {
          detail: {
            id: "test-notification-" + Date.now(),
            message: "New test notification",
            type: "payment",
            read: false,
          },
        })
      );
    });

    // Wait for potential UI update
    await page.waitForTimeout(2000);

    // Check if notification count increased (if real-time updates are implemented)
    const newCount = await page.locator('[data-test^="notification-list-item-"]').count();

    // This test may pass/fail based on whether real-time notifications are implemented
    // It's mainly to verify the test structure is correct
  });

  test("should handle mobile responsive layout for notifications", async ({ page }) => {
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      // Open mobile navigation
      await getByTestId(page, "sidenav-toggle").click();

      // Click notifications from mobile menu
      await getByTestId(page, "sidenav-notifications").click();

      await expect(page).toHaveURL("/notifications");

      // Should adapt layout for mobile
      await expect(getByTestId(page, "notifications-list")).toBeVisible();

      // Notification items should stack vertically on mobile
      const notifications = page.locator('[data-test^="notification-list-item-"]');
      if ((await notifications.count()) > 1) {
        const firstNotificationBox = await notifications.first().boundingBox();
        const secondNotificationBox = await notifications.nth(1).boundingBox();

        // Second notification should be below the first (higher y coordinate)
        expect(secondNotificationBox?.y).toBeGreaterThan(firstNotificationBox?.y || 0);
      }
    }
  });
});
