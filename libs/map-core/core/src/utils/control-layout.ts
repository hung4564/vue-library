import type { ButtonInMobile, ControlLayout } from '../types';

export type { ButtonInMobile, ControlLayout };

export type ResolvedControlLayout = 'standalone' | 'toolbar' | 'menu';

export const BUTTON_IN_MOBILE_VALUES = [
  'button',
  'toolbar',
  'menu',
] as const satisfies readonly ButtonInMobile[];

export function resolveControlLayout(
  controlLayout: ControlLayout | undefined,
  ctx: { buttonInMobile?: ButtonInMobile; isMobile?: boolean } = {},
): ResolvedControlLayout {
  if (controlLayout === 'toolbar') return 'toolbar';
  if (controlLayout === 'button') return 'standalone';
  if (ctx.isMobile && ctx.buttonInMobile === 'toolbar') return 'toolbar';
  if (ctx.isMobile && ctx.buttonInMobile === 'menu') return 'menu';
  return 'standalone';
}
