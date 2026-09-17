import { expect, test } from '@playwright/test';
import {
  DUAL_E2E_SMOKE_CONTROL_IDS,
  dualControlChromeSelector,
} from './dual-control-smoke.shared';

/**
 * Smoke: AllMapView mounts dual control corner chrome for catalog ids.
 * Mirrors vue-demo-map-e2e/src/dual-controls-smoke.spec.ts.
 */
test.describe('react dual control id smoke', () => {
  test('AllMapView exposes MAP_DUAL_E2E_SMOKE_CONTROL_IDS chrome', async ({
    page,
  }) => {
    await page.goto('/demo-map/react/#/');
    await expect(page.locator('.map-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('.map-content canvas').first()).toBeVisible({
      timeout: 60_000,
    });

    const missing: string[] = [];
    for (const id of DUAL_E2E_SMOKE_CONTROL_IDS) {
      const loc = page.locator(dualControlChromeSelector(id)).first();
      const count = await loc.count();
      if (count < 1) missing.push(id);
    }
    expect(missing, `missing control chrome: ${missing.join(', ')}`).toEqual(
      [],
    );
  });
});
