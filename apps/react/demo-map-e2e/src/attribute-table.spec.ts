import { expect, test } from '@playwright/test';

test.describe('react-demo-map attribute-table smoke', () => {
  test('opens attribute table from demo controls', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/react/#/dataset-attribute-table');
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
      page.locator('.attribute-table__table tbody tr').first(),
    ).toBeVisible({ timeout: 30_000 });

    const sortable = page.locator('.attribute-table__table th.is-sortable').first();
    if (await sortable.count()) {
      await sortable.click();
    }

    await expect(page.locator('.attribute-table__table')).toBeVisible();
  });
});
