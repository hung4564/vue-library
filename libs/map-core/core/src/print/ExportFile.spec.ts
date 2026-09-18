import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

import { saveAs } from 'file-saver';
import { exportFile, Format } from './ExportFile';

describe('exportFile', () => {
  beforeEach(() => {
    vi.mocked(saveAs).mockClear();
  });

  it('exports png and jpg via file-saver', () => {
    const canvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,abc'),
    } as unknown as HTMLCanvasElement;

    exportFile(canvas, Format.PNG, 'shot');
    expect(saveAs).toHaveBeenCalledWith(
      'data:image/png;base64,abc',
      'shot.png',
    );

    exportFile(canvas, Format.JPEG, 'shot');
    expect(saveAs).toHaveBeenCalledWith(
      'data:image/png;base64,abc',
      'shot.jpg',
    );
  });

  it('does not call saveAs for unsupported pdf format', () => {
    const canvas = {
      toDataURL: vi.fn(() => 'data:'),
    } as unknown as HTMLCanvasElement;
    exportFile(canvas, 'pdf');
    expect(saveAs).not.toHaveBeenCalled();
  });
});
