/**
 * Panel position contracts for map controls.
 * Prefer {@link MapPopupProps} / {@link MapSidebarProps} at author sites;
 * {@link MapControlPanelPosition} is the Registry get/set union shape.
 */

/** Dock side for sidebar panels. */
export type MapSidebarDock = 'left' | 'right' | 'top' | 'bottom';

/** Edge offsets for popup / float panels. */
export type MapPopupPanelPosition = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
};

/** Sidebar panel dock. */
export type MapSidebarPanelPosition = {
  location?: MapSidebarDock;
};

/**
 * Per-control popup/float props: edge overrides + optional size.
 * Used as `popupProps` on controls and Map table values (edges only).
 */
export type MapPopupProps = MapPopupPanelPosition & {
  width?: number;
  height?: number;
};

/** Per-control sidebar props (`initialPanelPosition` / dock). */
export type MapSidebarProps = MapSidebarPanelPosition;

/**
 * Panel offsets and/or sidebar dock for Registry `getPanelPosition` /
 * `setPanelPosition`. Prefer the dedicated popup / sidebar types when writing
 * control chrome. Optional `width` / `height` apply to popup/float panels.
 */
export type MapControlPanelPosition = MapPopupPanelPosition &
  MapSidebarPanelPosition & {
    width?: number;
    height?: number;
  };
