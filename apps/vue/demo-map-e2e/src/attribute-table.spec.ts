import { expect, test } from '@playwright/test';

test.describe('vue-demo-map attribute-table smoke', () => {
  test('opens attribute table from demo controls', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/vue/#/dataset-attribute-table/');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });

    await expect(page.locator('.at-card')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Open', exact: true }).click();

    await expect(page.locator('.attribute-table__table')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('.attribute-table__toolbar')).toBeVisible();
    await expect(
      page.locator('.attribute-table__table tbody tr[data-row-id]').first(),
    ).toBeVisible({ timeout: 30_000 });

    const sortBtn = page.locator('.attribute-table__sort-btn').first();
    if (await sortBtn.count()) {
      await sortBtn.focus();
      await page.keyboard.press('Enter');
      await expect(
        page.locator('.attribute-table__table th[aria-sort]').first(),
      ).toBeVisible();
    }

    const scroll = page.locator('.attribute-table__scroll').first();
    await scroll.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');

    const selected = page.locator(
      '.attribute-table__table tbody tr[aria-selected="true"]',
    );
    await expect(selected.first()).toBeVisible({ timeout: 10_000 });

    await expect(page.locator('.attribute-table__table')).toBeVisible();
    await expect(
      page.locator('.attribute-table [role="status"]').first(),
    ).toBeAttached();
  });
});
