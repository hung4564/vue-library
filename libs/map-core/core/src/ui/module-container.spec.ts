import { describe, expect, it } from 'vitest';

import {
  boundsFromPanelPosition,
  buildModuleBindPosition,
  buildPopupPropsForPosition,
  isModuleCornerChromeVisible,
  moduleBtnContainerClassName,
  moduleCornerHostId,
  moduleCornerHostSelector,
  moduleDraggableHostId,
  moduleDraggableHostSelector,
  panelEdgesForCorner,
  panelPositionFromBounds,
  resolveEffectivePanelPosition,
} from './module-container';

describe('module-container helpers', () => {
  it('builds corner and draggable host ids / selectors', () => {
    expect(moduleCornerHostId('top-left', 'm1')).toBe('top-left-m1');
    expect(moduleCornerHostSelector('top-left', 'm1')).toBe('#top-left-m1');
    expect(moduleDraggableHostId('m1')).toBe('map-draggable-m1');
    expect(moduleDraggableHostSelector('m1')).toBe('#map-draggable-m1');
  });

  it('hides corner chrome for toolbar and menu layouts', () => {
    expect(isModuleCornerChromeVisible('standalone')).toBe(true);
    expect(isModuleCornerChromeVisible('button')).toBe(true);
    expect(isModuleCornerChromeVisible('toolbar')).toBe(false);
    expect(isModuleCornerChromeVisible('menu')).toBe(false);
    expect(isModuleCornerChromeVisible(undefined)).toBe(true);
  });

  it('builds btn container class names', () => {
    expect(moduleBtnContainerClassName()).toBe(
      'btn-module-container map-common-button',
    );
    expect(moduleBtnContainerClassName('mapHomeControl')).toBe(
      'btn-module-container map-common-button mapHomeControl-btn-module-container',
    );
  });

  it('builds bind position offsets for a corner', () => {
    expect(
      buildModuleBindPosition({
        position: 'bottom-right',
        btnWidth: 40,
        containerId: 'map-draggable-m1',
      }),
    ).toEqual({
      containerId: 'map-draggable-m1',
      right: 58,
      bottom: 10,
    });
  });

  it('resolveEffectivePanelPosition merges corner defaults for popup', () => {
    expect(
      resolveEffectivePanelPosition({
        panelKind: 'popup',
        buttonCorner: 'top-right',
      }),
    ).toEqual({ top: 50, right: 58 });
    expect(
      resolveEffectivePanelPosition({
        panelKind: 'popup',
        buttonCorner: 'top-right',
        overrides: { top: 80 },
      }),
    ).toEqual({ top: 80, right: 58 });
  });

  it('buildPopupPropsForPosition merges Map table then control overrides', () => {
    expect(buildPopupPropsForPosition('top-right')).toEqual({
      top: 50,
      right: 58,
    });
    expect(buildPopupPropsForPosition('bottom-left')).toEqual({
      bottom: 50,
      left: 58,
    });
    expect(
      buildPopupPropsForPosition(
        'top-right',
        { top: 80 },
        {
          cornerDefaults: { 'top-right': { top: 40 } },
        },
      ),
    ).toEqual({ top: 80, right: 58 });
    expect(
      buildPopupPropsForPosition('top-right', undefined, {
        cornerDefaults: { 'top-right': { top: 40 } },
      }),
    ).toEqual({ top: 40, right: 58 });
  });

  it('resolveEffectivePanelPosition uses location for sidebar', () => {
    expect(
      resolveEffectivePanelPosition({
        panelKind: 'sidebar',
        buttonCorner: 'top-left',
      }),
    ).toEqual({ location: 'left' });
    expect(
      resolveEffectivePanelPosition({
        panelKind: 'sidebar',
        buttonCorner: 'top-left',
        overrides: { location: 'right' },
      }),
    ).toEqual({ location: 'right' });
  });

  it('panelPositionFromBounds converts x/y/w/h to edge offsets', () => {
    expect(
      panelPositionFromBounds(
        { x: 100, y: 40, width: 200, height: 150 },
        { width: 800, height: 600 },
      ),
    ).toEqual({
      left: 100,
      top: 40,
      right: 500,
      bottom: 410,
      width: 200,
      height: 150,
    });
  });

  it('panelEdgesForCorner keeps axes for the button corner', () => {
    const all = {
      left: 100,
      top: 40,
      right: 500,
      bottom: 410,
      width: 200,
      height: 150,
    };
    expect(panelEdgesForCorner(all, 'top-right')).toEqual({
      top: 40,
      right: 500,
      width: 200,
      height: 150,
    });
    expect(panelEdgesForCorner(all, 'bottom-left')).toEqual({
      bottom: 410,
      left: 100,
      width: 200,
      height: 150,
    });
  });

  it('boundsFromPanelPosition fills missing edges from size and container', () => {
    expect(
      boundsFromPanelPosition(
        { top: 40, right: 58 },
        { width: 400, height: 300 },
        { width: 800, height: 600 },
      ),
    ).toEqual({ x: 342, y: 40, width: 400, height: 300 });
    expect(
      boundsFromPanelPosition(
        { left: 10, bottom: 20 },
        { width: 100, height: 80 },
        { width: 400, height: 300 },
        { x: 1, y: 2 },
      ),
    ).toEqual({ x: 10, y: 200, width: 100, height: 80 });
  });
});
