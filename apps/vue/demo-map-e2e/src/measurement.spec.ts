import { expect, test } from '@playwright/test';

test.describe('vue-demo-map measurement smoke', () => {
  test('mounts MeasurementControl and starts distance mode', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/vue/#/measurement/');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.locator('.mapMeasurementControl-btn-module-container'),
    ).toBeAttached({ timeout: 30_000 });
    await expect(page.locator('.map-measurement-control')).toBeVisible({
      timeout: 15_000,
    });

    const distanceBtn = page
      .locator(
        '.map-measurement-control button, .map-measurement-control .map-control-button',
      )
      .first();
    await distanceBtn.click();
    await expect(
      page
        .locator(
          '.map-measurement-control, .map-measurement-geometry, .map-measurement-fields',
        )
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
