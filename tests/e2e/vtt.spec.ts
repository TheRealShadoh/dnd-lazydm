import { test, expect } from '@playwright/test';

test.describe('Virtual Tabletop (VTT)', () => {
  test('should load VTT with map parameter', async ({ page }) => {
    const mapUrl = 'https://example.com/map.jpg';
    await page.goto(`/vtt?map=${encodeURIComponent(mapUrl)}`);

    // Check for VTT heading
    await expect(page.getByRole('heading', { name: /Virtual Tabletop/i })).toBeVisible();

    // Check for canvas
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should show error when no map is provided', async ({ page }) => {
    await page.goto('/vtt');

    // Should show error message
    await expect(page.getByText(/No Map Selected/i)).toBeVisible();
  });

  test('should display token controls', async ({ page }) => {
    await page.goto('/vtt?map=test.jpg');

    // Check for token controls
    await expect(page.getByText(/Token Controls/i)).toBeVisible();
    await expect(page.getByText(/Create New Token/i)).toBeVisible();
  });

  test('should display grid controls', async ({ page }) => {
    await page.goto('/vtt?map=test.jpg');

    // Check for grid controls
    await expect(page.getByText(/Grid Settings/i)).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Show Grid/i })).toBeVisible();
  });

  test('should display initiative tracker', async ({ page }) => {
    await page.goto('/vtt?map=test.jpg');

    // Check for initiative tracker
    await expect(page.getByText(/Initiative Tracker/i)).toBeVisible();
  });

  test('should create a token', async ({ page }) => {
    await page.goto('/vtt?map=test.jpg');

    // Fill in token details
    await page.selectOption('select:has-text("Type")', 'monster');
    await page.selectOption('select:has-text("Size")', 'medium');

    // Optional: Add name
    const nameInput = page.getByPlaceholder(/Goblin Scout/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Monster');
    }

    // Add combat stats
    const hpInput = page.getByPlaceholder(/Current/i).first();
    if (await hpInput.isVisible()) {
      await hpInput.fill('25');
    }

    const maxHpInput = page.getByPlaceholder(/Max/i).first();
    if (await maxHpInput.isVisible()) {
      await maxHpInput.fill('25');
    }

    // Click create button
    await page.getByRole('button', { name: /Create Token/i }).click();

    // Verify token was created - check token list
    await expect(page.getByText(/All Tokens/i)).toBeVisible();
  });

  test('should toggle grid visibility', async ({ page }) => {
    await page.goto('/vtt?map=test.jpg');

    const gridCheckbox = page.getByRole('checkbox', { name: /Show Grid/i });

    // Toggle grid off
    if (await gridCheckbox.isChecked()) {
      await gridCheckbox.uncheck();
      expect(await gridCheckbox.isChecked()).toBe(false);
    }

    // Toggle grid on
    await gridCheckbox.check();
    expect(await gridCheckbox.isChecked()).toBe(true);
  });

  test('should display keyboard shortcuts help', async ({ page }) => {
    await page.goto('/vtt?map=test.jpg');

    // Check for keyboard shortcuts panel
    await expect(page.getByText(/Keyboard Shortcuts:/i)).toBeVisible();
    await expect(page.getByText(/Measure distance/i)).toBeVisible();
    await expect(page.getByText(/Delete selected/i)).toBeVisible();
  });

  test('should have clear all and reset buttons', async ({ page }) => {
    await page.goto('/vtt?map=test.jpg');

    await expect(page.getByRole('button', { name: /Clear All Tokens/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reset VTT/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Close/i })).toBeVisible();
  });
});
