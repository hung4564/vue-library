import { describe, expect, it } from 'vitest';

import {
  collectFilesFromDataTransfer,
  isGisUploadFileName,
  readClipboardGisPaste,
} from './data-transfer';

describe('isGisUploadFileName', () => {
  it('accepts common GIS extensions', () => {
    expect(isGisUploadFileName('a.geojson')).toBe(true);
    expect(isGisUploadFileName('b.shp')).toBe(true);
    expect(isGisUploadFileName('c.prj')).toBe(true);
    expect(isGisUploadFileName('d.txt')).toBe(true);
  });

  it('rejects unknown extensions', () => {
    expect(isGisUploadFileName('a.png')).toBe(false);
    expect(isGisUploadFileName('readme.md')).toBe(false);
  });
});

describe('collectFilesFromDataTransfer', () => {
  it('filters files from dataTransfer.files when no entries API', async () => {
    const geo = new File(['{}'], 'a.geojson', { type: 'application/json' });
    const png = new File(['x'], 'x.png', { type: 'image/png' });
    const dt = {
      items: [],
      files: [geo, png],
    } as unknown as DataTransfer;
    const files = await collectFilesFromDataTransfer(dt);
    expect(files.map((f) => f.name)).toEqual(['a.geojson']);
  });

  it('walks directory entries when webkitGetAsEntry is present', async () => {
    const nested = new File(['{}'], 'nested.csv', { type: 'text/csv' });
    const fileEntry = {
      isFile: true,
      isDirectory: false,
      name: 'nested.csv',
      file: (ok: (f: File) => void) => ok(nested),
    };
    const dirEntry = {
      isFile: false,
      isDirectory: true,
      name: 'folder',
      createReader: () => {
        let done = false;
        return {
          readEntries: (ok: (entries: unknown[]) => void) => {
            if (done) {
              ok([]);
              return;
            }
            done = true;
            ok([fileEntry]);
          },
        };
      },
    };
    const item = {
      kind: 'file',
      webkitGetAsEntry: () => dirEntry,
      getAsFile: () => null,
    };
    const dt = {
      items: [item],
      files: [],
    } as unknown as DataTransfer;
    const files = await collectFilesFromDataTransfer(dt);
    expect(files.map((f) => f.name)).toEqual(['nested.csv']);
  });
});

describe('readClipboardGisPaste', () => {
  it('returns GIS files and text', () => {
    const geo = new File(['{}'], 'a.geojson');
    const dt = {
      files: [geo, new File(['x'], 'x.png')],
      getData: (type: string) =>
        type === 'text' || type === 'text/plain' ? '{"type":"Point"}' : '',
    } as unknown as DataTransfer;
    const result = readClipboardGisPaste(dt);
    expect(result.files.map((f) => f.name)).toEqual(['a.geojson']);
    expect(result.text).toContain('Point');
  });

  it('handles null clipboard', () => {
    expect(readClipboardGisPaste(null)).toEqual({ files: [], text: '' });
  });
});
