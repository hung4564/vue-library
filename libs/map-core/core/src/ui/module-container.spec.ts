import { describe, expect, it } from 'vitest';
import {
  buildModuleBindPosition,
  isModuleCornerChromeVisible,
  moduleBtnContainerClassName,
  moduleCornerHostId,
  moduleCornerHostSelector,
  moduleDraggableHostId,
  moduleDraggableHostSelector,
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
});
