import { expect, test } from '@playwright/test';

const TINY_GEOJSON = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'e2e-point' },
      geometry: { type: 'Point', coordinates: [106.7, 10.78] },
    },
  ],
});

test.describe('vue-demo-map CreateControl smoke', () => {
  test('opens CreateControl and creates a layer from raw GeoJSON', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto('/demo-map/vue/#/minimal/');
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

    const titlesBefore = await page.locator('.layer-item__title').count();

    await page.getByTestId('map-layer-create').click();
    await expect(page.locator('.create-control-container')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('.create-control-form')).toBeVisible();

    const rawTab = page.locator('.create-control-data__tab').filter({
      hasText: /raw|dán|paste/i,
    });
    if (await rawTab.count()) {
      await rawTab.first().click();
    }

    const textarea = page.locator('.create-control-form textarea').first();
    await expect(textarea).toBeVisible();
    await textarea.fill(TINY_GEOJSON);

    // Debounced parse (~400ms) + worker
    await expect(page.locator('.create-control-sample-error')).toHaveCount(0, {
      timeout: 15_000,
    });
    await page.waitForTimeout(600);

    const createBtn = page.locator('.create-control-container .btn-container');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    await expect(page.locator('.create-control-container')).toBeHidden({
      timeout: 30_000,
    });
    await expect(page.locator('.layer-item__title')).toHaveCount(
      titlesBefore + 1,
      { timeout: 30_000 },
    );
  });
});
