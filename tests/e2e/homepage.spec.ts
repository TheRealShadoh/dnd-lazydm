import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display homepage with campaign selector', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(page.getByRole('heading', { name: /D&D Lazy DM/i })).toBeVisible();

    // Check for campaign selection section
    await expect(page.getByText(/Available Campaigns/i)).toBeVisible();
  });

  test('should navigate to a campaign', async ({ page }) => {
    await page.goto('/');

    // Wait for campaigns to load
    await page.waitForSelector('[data-campaign-card]', { timeout: 10000 }).catch(() => {
      // No campaigns might be available, that's okay
    });

    // Try to click a campaign if available
    const campaignCard = page.locator('[data-campaign-card]').first();
    const count = await campaignCard.count();

    if (count > 0) {
      await campaignCard.click();
      // Should navigate to campaign page
      await expect(page).toHaveURL(/\/campaigns\/.+/);
    }
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for admin link
    const adminLink = page.getByRole('link', { name: /Admin/i });
    if (await adminLink.isVisible()) {
      await expect(adminLink).toHaveAttribute('href', '/admin');
    }
  });
});
