import { beforeEach, describe, expect, it, vi } from 'vitest';

const listControls = vi.fn();
const closeControl = vi.fn();
const hideIfSource = vi.fn();

vi.mock('@hungpvq/map-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hungpvq/map-core')>();
  return {
    ...actual,
    UniversalRegistry: {
      ...actual.UniversalRegistry,
      listControls: (...args: unknown[]) => listControls(...args),
      closeControl: (...args: unknown[]) => closeControl(...args),
    },
  };
});

vi.mock('../highlight/controller', () => ({
  getHighlightController: () => ({ hideIfSource }),
}));

import {
  closeIdentifyExclusiveUi,
  LAYER_DETAIL_CONTROL_ID,
} from './close-exclusive-ui';

describe('closeIdentifyExclusiveUi', () => {
  beforeEach(() => {
    listControls.mockReset();
    closeControl.mockReset();
    hideIfSource.mockReset();
  });

  it('closes LayerDetail and AttributeTable controls, clears highlight sources', () => {
    listControls.mockReturnValue([
      { id: LAYER_DETAIL_CONTROL_ID },
      { id: 'mapAttributeTable:layer-a' },
      { id: 'mapIdentifyControl' },
      { id: 'mapAttributeTable' },
    ]);

    closeIdentifyExclusiveUi('map-1');

    expect(closeControl).toHaveBeenCalledWith('map-1', LAYER_DETAIL_CONTROL_ID);
    expect(closeControl).toHaveBeenCalledWith(
      'map-1',
      'mapAttributeTable:layer-a',
    );
    expect(closeControl).toHaveBeenCalledWith('map-1', 'mapAttributeTable');
    expect(closeControl).not.toHaveBeenCalledWith(
      'map-1',
      'mapIdentifyControl',
    );
    expect(hideIfSource).toHaveBeenCalledWith('detail');
    expect(hideIfSource).toHaveBeenCalledWith('attribute-table');
  });
});
