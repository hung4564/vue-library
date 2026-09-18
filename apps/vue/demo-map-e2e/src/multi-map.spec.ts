import { expect, test } from '@playwright/test';

test.describe('vue-demo-map multi-map smoke', () => {
  test('mounts at least two maps on /#/multi-map/', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/vue/#/multi-map/');
    await expect(page.locator('.map-container').first()).toBeVisible({
      timeout: 60_000,
    });

    const containers = page.locator('.map-container');
    const canvases = page.locator('.map-content canvas, canvas.maplibregl-canvas');
    const containerCount = await containers.count();
    const canvasCount = await canvases.count();
    expect(containerCount >= 2 || canvasCount >= 2).toBeTruthy();
  });
});
