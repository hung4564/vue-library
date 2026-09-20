import { describe, expect, it, vi } from 'vitest';
import type { MapSimple } from '@hungpvq/map-core';
import { createWithEventHelper } from '../extra/event/model';
import { setOpacity, toggleShow } from './dataset.extra';
import type { IDataset } from './dataset.base';

describe('dataset.extra list UI emits', () => {
  it('toggleShow emits show + dataset + mapId from map.id', () => {
    const event = createWithEventHelper<{
      toggleShow: {
        show: boolean;
        dataset: IDataset;
        mapId: string;
      };
    }>();
    const onToggle = vi.fn();
    event.on('toggleShow', onToggle);

    const dataset = {
      id: 'layer-1',
      show: false,
      ...event,
    } as IDataset & typeof event & { show: boolean };

    toggleShow.call(dataset, { id: 'map-a' } as MapSimple, true);

    expect(dataset.show).toBe(true);
    expect(onToggle).toHaveBeenCalledWith({
      show: true,
      dataset,
      mapId: 'map-a',
    });
  });

  it('setOpacity emits opacity + dataset + mapId from map.id', () => {
    const event = createWithEventHelper<{
      changeOpacity: {
        opacity: number;
        dataset: IDataset;
        mapId: string;
      };
    }>();
    const onOpacity = vi.fn();
    event.on('changeOpacity', onOpacity);

    const dataset = {
      id: 'layer-1',
      opacity: 1,
      ...event,
    } as IDataset & typeof event & { opacity: number };

    setOpacity.call(dataset, { id: 'map-b' } as MapSimple, 0.4);

    expect(dataset.opacity).toBe(0.4);
    expect(onOpacity).toHaveBeenCalledWith({
      opacity: 0.4,
      dataset,
      mapId: 'map-b',
    });
  });

  it('toggleShow listener cleanup stops further calls', () => {
    const event = createWithEventHelper<{
      toggleShow: {
        show: boolean;
        dataset: IDataset;
        mapId: string;
      };
    }>();
    const onToggle = vi.fn();
    event.on('toggleShow', onToggle);

    const dataset = {
      id: 'layer-1',
      show: true,
      ...event,
    } as IDataset & typeof event & { show: boolean };

    event.off('toggleShow', onToggle);
    toggleShow.call(dataset, { id: 'map-a' } as MapSimple, false);
    expect(onToggle).not.toHaveBeenCalled();
  });
});
