import { expect, test } from '@playwright/test';

test.describe('react-demo-map draw + inspect smoke', () => {
  test('mounts DrawControl on /#/draw', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/react/#/draw');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.locator('.mapDrawControl-btn-module-container'),
    ).toBeAttached({ timeout: 30_000 });
  });
});
