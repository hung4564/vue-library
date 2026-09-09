export type ExportGeoSubmenuPlacement = 'end' | 'bottom';

export function getExportGeoSubmenuPosition(
  trigger: HTMLElement,
  menu: HTMLElement | null | undefined,
  placement: ExportGeoSubmenuPlacement,
): { top: number; left: number } {
  const rect = trigger.getBoundingClientRect();
  const menuWidth = menu?.offsetWidth || 160;
  const menuHeight = menu?.offsetHeight || 0;
  const gap = 2;
  let top = placement === 'bottom' ? rect.bottom + gap : rect.top;
  let left = placement === 'bottom' ? rect.left : rect.right - gap;

  const maxLeft = window.innerWidth - menuWidth - 8;
  if (left > maxLeft) left = Math.max(8, maxLeft);
  if (left < 8) left = 8;

  if (menuHeight > 0) {
    const maxTop = window.innerHeight - menuHeight - 8;
    if (top > maxTop) {
      top =
        placement === 'bottom'
          ? Math.max(8, rect.top - menuHeight - gap)
          : Math.max(8, maxTop);
    }
  }

  return { top, left };
}
