import { expect, test } from '@playwright/test';

test.describe('vue-demo-map layer + identify smoke', () => {
  test('mounts LayerControl and IdentifyControl on /#/dataset-identify/', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/vue/#/dataset-identify/');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });

    // Panel open → toolbar btn wrapper is often `display:none`; still mounted.
    await expect(
      page.locator('.mapLayerControl-btn-module-container'),
    ).toBeAttached({ timeout: 30_000 });
    await expect(page.locator('.layer-control')).toBeVisible();
    await expect(page.locator('.layer-item__title').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator('.mapIdentifyControl-btn-module-container'),
    ).toBeAttached();
  });
});
