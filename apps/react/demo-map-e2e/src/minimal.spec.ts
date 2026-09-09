import { expect, test } from '@playwright/test';

test.describe('react-demo-map minimal smoke', () => {
  test('loads map shell on /#/minimal', async ({ page }) => {
    await page.goto('/demo-map/react/#/minimal');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content')).toBeVisible();
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });
  });
});
