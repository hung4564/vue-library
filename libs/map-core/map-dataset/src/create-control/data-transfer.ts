import {
  fileExtension,
  GIS_FILE_ACCEPT,
  isShapefileSidecar,
} from './gis-format';

/** Extensions allowed for CreateControl upload (from {@link GIS_FILE_ACCEPT}). */
const GIS_UPLOAD_EXTS = new Set(
  GIS_FILE_ACCEPT.split(',')
    .map((part) => part.trim().replace(/^\./, '').toLowerCase())
    .filter(Boolean),
);

/** True when the file name looks like a supported GIS upload (or shapefile sidecar). */
export function isGisUploadFileName(name?: string): boolean {
  const ext = fileExtension(name);
  if (!ext) return false;
  if (GIS_UPLOAD_EXTS.has(ext)) return true;
  return isShapefileSidecar(name || '');
}

type FileSystemEntryLike = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file?: (
    success: (file: File) => void,
    error?: (err: DOMException) => void,
  ) => void;
  createReader?: () => {
    readEntries: (
      success: (entries: FileSystemEntryLike[]) => void,
      error?: (err: DOMException) => void,
    ) => void;
  };
};

type DataTransferItemWithEntry = DataTransferItem & {
  webkitGetAsEntry?: () => FileSystemEntryLike | null;
};

function readAllDirectoryEntries(reader: {
  readEntries: (
    success: (entries: FileSystemEntryLike[]) => void,
    error?: (err: DOMException) => void,
  ) => void;
}): Promise<FileSystemEntryLike[]> {
  return new Promise((resolve, reject) => {
    const all: FileSystemEntryLike[] = [];
    const readBatch = () => {
      reader.readEntries(
        (batch) => {
          if (!batch.length) {
            resolve(all);
            return;
          }
          all.push(...batch);
          readBatch();
        },
        (err) => reject(err),
      );
    };
    readBatch();
  });
}

async function entryToFiles(entry: FileSystemEntryLike): Promise<File[]> {
  if (entry.isFile && typeof entry.file === 'function') {
    const file = await new Promise<File>((resolve, reject) => {
      entry.file!(resolve, reject);
    });
    return [file];
  }
  if (entry.isDirectory && typeof entry.createReader === 'function') {
    const reader = entry.createReader();
    const children = await readAllDirectoryEntries(reader);
    const nested = await Promise.all(children.map((child) => entryToFiles(child)));
    return nested.flat();
  }
  return [];
}

/**
 * Collect a flat `File[]` from a drop `DataTransfer`, walking folders via
 * `webkitGetAsEntry` when available. Filters to GIS upload names.
 */
export async function collectFilesFromDataTransfer(
  dataTransfer: DataTransfer | null | undefined,
): Promise<File[]> {
  if (!dataTransfer) return [];

  const items = Array.from(dataTransfer.items || []) as DataTransferItemWithEntry[];
  const hasEntries = items.some(
    (item) => item.kind === 'file' && typeof item.webkitGetAsEntry === 'function',
  );

  let files: File[] = [];
  if (hasEntries) {
    const entryLists = await Promise.all(
      items.map(async (item) => {
        if (item.kind !== 'file') return [] as File[];
        const entry = item.webkitGetAsEntry?.();
        if (!entry) {
          const file = item.getAsFile();
          return file ? [file] : [];
        }
        return entryToFiles(entry);
      }),
    );
    files = entryLists.flat();
  } else {
    files = Array.from(dataTransfer.files || []);
  }

  return files.filter((file) => isGisUploadFileName(file.name));
}

/**
 * Resolve paste payload: clipboard files (GIS) and/or text.
 */
export function readClipboardGisPaste(clipboardData: DataTransfer | null | undefined): {
  files: File[];
  text: string;
} {
  if (!clipboardData) return { files: [], text: '' };
  const files = Array.from(clipboardData.files || []).filter((file) =>
    isGisUploadFileName(file.name),
  );
  const text = clipboardData.getData('text') || clipboardData.getData('text/plain') || '';
  return { files, text };
}
