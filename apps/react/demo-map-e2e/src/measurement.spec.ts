import { expect, test } from '@playwright/test';

test.describe('react-demo-map measurement smoke', () => {
  test('mounts MeasurementControl on /#/measurement', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/react/#/measurement');
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
  });
});
