export type VirtualRowWindow = {
  start: number;
  end: number;
  offsetY: number;
  totalHeight: number;
};

/**
 * Compute a window of rows for a fixed-height virtual list.
 */
export function getVirtualRowWindow(
  rowCount: number,
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  overscan = 8,
): VirtualRowWindow {
  const safeRowHeight = Math.max(1, rowHeight);
  const totalHeight = rowCount * safeRowHeight;
  if (rowCount === 0 || viewportHeight <= 0) {
    return { start: 0, end: 0, offsetY: 0, totalHeight };
  }
  const start = Math.max(
    0,
    Math.floor(scrollTop / safeRowHeight) - overscan,
  );
  const visibleCount = Math.ceil(viewportHeight / safeRowHeight) + overscan * 2;
  const end = Math.min(rowCount, start + visibleCount);
  return {
    start,
    end,
    offsetY: start * safeRowHeight,
    totalHeight,
  };
}

export const ATTRIBUTE_TABLE_ROW_HEIGHT = 34;
