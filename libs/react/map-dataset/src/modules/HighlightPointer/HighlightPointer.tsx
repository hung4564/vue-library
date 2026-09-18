import type { HighlightStyle } from '@hungpvq/map-dataset/highlight';
import { destroyHighlightController } from '@hungpvq/map-dataset/highlight';
import { useMap } from '@hungpvq/react-map-core';
import { useEffect } from 'react';
import { useMapHighlight } from '../../store/highlight';

export type HighlightPointerProps = {
  enableClick?: boolean;
  enableHover?: boolean;
  color?: string;
  durationMs?: number;
};

/** Bind map pointer to highlight controller (click / hover sources). */
export function HighlightPointer({
  enableClick = false,
  enableHover = false,
  color,
  durationMs,
}: HighlightPointerProps) {
  const { mapId } = useMap();
  const hl = useMapHighlight(mapId);

  useEffect(() => {
    const style: HighlightStyle = {};
    if (color) style.color = color;
    if (durationMs != null) style.durationMs = durationMs;
    if (Object.keys(style).length) hl.setDefaultStyle(style);
    const unbind = hl.bindPointer({ click: enableClick, hover: enableHover });
    return () => {
      unbind();
      destroyHighlightController(mapId);
    };
  }, [hl, mapId, enableClick, enableHover, color, durationMs]);

  return null;
}
