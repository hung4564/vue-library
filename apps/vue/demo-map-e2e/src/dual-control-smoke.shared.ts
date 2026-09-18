/**
 * Shared dual-control smoke helpers for vue/react demo-map Playwright e2e.
 * Keep in sync with `MAP_DUAL_E2E_SMOKE_CONTROL_IDS` in map-core dual catalog.
 */
import { MAP_DUAL_E2E_SMOKE_CONTROL_IDS } from '../../../../libs/map-core/core/src/dual/parity-catalog';

export const DUAL_E2E_SMOKE_CONTROL_IDS = MAP_DUAL_E2E_SMOKE_CONTROL_IDS;

/** Corner chrome selector for a dual control id. */
export function dualControlChromeSelector(controlId: string): string {
  return `[data-map-control-id="${controlId}"], .${controlId}-btn-module-container`;
}
