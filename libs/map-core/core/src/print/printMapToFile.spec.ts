import { describe, expect, it, vi } from 'vitest';
import type { MapSimple } from '../types';
import { printMapToFile } from './utils';

describe('printMapToFile', () => {
  it('exports then saves with .png file name', async () => {
    const save = vi.fn();
    const exportMap = vi.fn(async () => 'data:image/png;base64,abc');
    const map = {} as MapSimple;
    const dataUrl = await printMapToFile(map, {
      fileName: 'snapshot',
      save,
      exportMap,
    });
    expect(exportMap).toHaveBeenCalledWith(map, undefined);
    expect(save).toHaveBeenCalledWith(
      'data:image/png;base64,abc',
      'snapshot.png',
    );
    expect(dataUrl).toBe('data:image/png;base64,abc');
  });

  it('defaults file name to map.png', async () => {
    const save = vi.fn();
    await printMapToFile({} as MapSimple, {
      save,
      exportMap: async () => 'x',
    });
    expect(save).toHaveBeenCalledWith('x', 'map.png');
  });
});
