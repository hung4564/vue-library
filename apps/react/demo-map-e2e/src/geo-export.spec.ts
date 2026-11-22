import { expect, test } from '@playwright/test';

test.describe('react-demo-map geo-export smoke', () => {
  test('loads geo-export demo with layers', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/react/#/dataset-geo-export');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.layer-control')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('.layer-item__title').first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
