import { expect, test } from '@playwright/test';

test.describe('vue-demo-map theme / basemap smoke', () => {
  test('all-map-view loads map and theme class on html', async ({ page }) => {
    await page.goto('/demo-map/vue/#/all-map-view/');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });
    const themeClass = await page.evaluate(() =>
      Array.from(document.documentElement.classList).find((c) =>
        c.startsWith('map-theme-'),
      ),
    );
    expect(themeClass).toBeTruthy();
  });
});
