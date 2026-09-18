import { expect, test } from '@playwright/test';

test.describe('react-demo-map theme / basemap smoke', () => {
  test('all-map-view loads map and theme class on html', async ({ page }) => {
    await page.goto('/demo-map/react/#/');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });
    const themeClass = await page.evaluate(() =>
      Array.from(document.documentElement.classList).find((c) =>
        c.startsWith('map-theme-'),
      ),
    );
    expect(themeClass).toBeTruthy();
  });

  test('theme demo shows ThemeControl, token panel, and html theme class', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto('/demo-map/react/#/theme/');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-theme-control-group')).toBeVisible({
      timeout: 30_000,
    });
    const tokens = page.getByTestId('demo-theme-tokens');
    await expect(tokens).toBeVisible();
    await expect(tokens).toContainText('--map-primary-color');
    await expect(tokens).toContainText('--map-background-color');

    const group = page.locator('.map-theme-control-group');
    await group.hover();
    const darkBtn = page
      .locator('button[title*="Dark"], button[title*="Tối"]')
      .first();
    const lightBtn = page
      .locator('button[title*="Light"], button[title*="Sáng"]')
      .first();
    if (await darkBtn.count()) {
      await darkBtn.click();
      await expect(page.locator('html')).toHaveClass(/map-theme-dark/);
    } else if (await lightBtn.count()) {
      await lightBtn.click();
      await expect(page.locator('html')).toHaveClass(/map-theme-light/);
    } else {
      await group.locator('button').first().click();
    }

    const themeClass = await page.evaluate(() =>
      Array.from(document.documentElement.classList).find(
        (c) => c === 'map-theme-dark' || c === 'map-theme-light',
      ),
    );
    expect(themeClass).toBeTruthy();
  });
});
