import { expect, test } from '@playwright/test';

test.describe('react-demo-map basemap-error smoke', () => {
  test('mounts map on /#/basemap-error and shows error surface if present', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/react/#/basemap-error');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });

    const errorSurface = page.locator(
      '.map-error-toast, .basemap-error-note, text=/error/i',
    );
    if (await errorSurface.count()) {
      await expect(errorSurface.first()).toBeVisible({ timeout: 30_000 });
    }
  });
});
