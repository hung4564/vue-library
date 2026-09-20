import {
  fileExtension,
  GIS_FILE_ACCEPT,
  isFileGdbPartName,
  isFileGdbZipName,
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
  if (!name) return false;
  const normalized = name.replace(/\\/g, '/');
  if (isFileGdbZipName(normalized) || isFileGdbPartName(normalized)) return true;
  const ext = fileExtension(normalized);
  if (!ext) return false;
  if (GIS_UPLOAD_EXTS.has(ext)) return true;
  return isShapefileSidecar(normalized);
}

type FileSystemEntryLike = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath?: string;
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

function fileWithPath(file: File, pathHint: string): File {
  const normalized = pathHint.replace(/\\/g, '/').replace(/^\//, '');
  if (!normalized || normalized === file.name) return file;
  if (!normalized.includes('/')) return file;
  return new File([file], normalized, {
    type: file.type,
    lastModified: file.lastModified,
  });
}

async function entryToFiles(entry: FileSystemEntryLike): Promise<File[]> {
  if (entry.isFile && typeof entry.file === 'function') {
    const file = await new Promise<File>((resolve, reject) => {
      entry.file!(resolve, reject);
    });
    const pathHint = entry.fullPath || entry.name;
    return [fileWithPath(file, pathHint)];
  }
  if (entry.isDirectory && typeof entry.createReader === 'function') {
    const reader = entry.createReader();
    const children = await readAllDirectoryEntries(reader);
    const nested = await Promise.all(children.map((child) => entryToFiles(child)));
    return nested.flat();
  }
  return [];
}

async function collectRawFilesFromDataTransfer(
  dataTransfer: DataTransfer,
): Promise<File[]> {
  const items = Array.from(dataTransfer.items || []) as DataTransferItemWithEntry[];
  const hasEntries = items.some(
    (item) => item.kind === 'file' && typeof item.webkitGetAsEntry === 'function',
  );

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
    return entryLists.flat();
  }

  return Array.from(dataTransfer.files || []).map((file) => {
    const relative =
      typeof file.webkitRelativePath === 'string' && file.webkitRelativePath
        ? file.webkitRelativePath
        : file.name;
    return fileWithPath(file, relative);
  });
}

/**
 * Collect a flat `File[]` from a drop `DataTransfer`, walking folders via
 * `webkitGetAsEntry` when available. Filters to GIS upload names.
 */
export async function collectFilesFromDataTransfer(
  dataTransfer: DataTransfer | null | undefined,
): Promise<File[]> {
  if (!dataTransfer) return [];
  const files = await collectRawFilesFromDataTransfer(dataTransfer);
  return files.filter((file) => isGisUploadFileName(file.name));
}

/**
 * Collect FileGDB zip / folder members from a drop (keeps `.gdb/` path in names).
 */
export async function collectFileGdbFilesFromDataTransfer(
  dataTransfer: DataTransfer | null | undefined,
): Promise<File[]> {
  if (!dataTransfer) return [];
  const files = await collectRawFilesFromDataTransfer(dataTransfer);
  if (!files.length) return [];

  if (files.length === 1 && isFileGdbZipName(files[0].name)) {
    return files;
  }

  const gdbFiles = files.filter((file) => {
    const path = (file.webkitRelativePath || file.name || '').replace(/\\/g, '/');
    return isFileGdbPartName(path) || path.toLowerCase().includes('.gdb/');
  });
  if (gdbFiles.length) return gdbFiles;

  // Plain `.zip` that may contain a `.gdb` (validated later by parser).
  if (files.length === 1 && fileExtension(files[0].name) === 'zip') {
    return files;
  }
  return [];
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
