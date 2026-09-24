import { expect, test } from '@playwright/test';

test.describe('vue-demo-map draw + inspect smoke', () => {
  test('opens DrawControl toolbar on /#/draw/', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/vue/#/draw/');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.locator('.mapDrawControl-btn-module-container'),
    ).toBeAttached({ timeout: 30_000 });

    const drawBtn = page
      .locator('.mapDrawControl-btn-module-container button')
      .first();
    if (await drawBtn.count()) {
      await drawBtn.click();
    }
    await expect(
      page
        .locator('.button-draw-container, .mapDrawControl-btn-module-container')
        .first(),
    ).toBeVisible({ timeout: 15_000 });

    // Soft: Draft list when enabled (needs drafts); skip if disabled
    const draftListBtn = page
      .getByRole('button', { name: /Draft list/i })
      .first();
    if (await draftListBtn.count()) {
      const disabled = await draftListBtn.isDisabled();
      if (!disabled) {
        await draftListBtn.click();
        await expect(
          page
            .locator(
              '.draft-items-table, .draggable-popup-wrapper, [class*="draft"]',
            )
            .first(),
        ).toBeVisible({ timeout: 15_000 });
      }
    }
  });
});
