export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Characters unsafe or awkward in download filenames across OS / browsers. */
const UNSAFE_FILENAME_CHARS = /[<>:"/\\|?*·]/u;

export function sanitizeExportFilename(name: string): string {
  const trimmed = name.trim() || 'layer';
  const cleaned = [...trimmed]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code < 32 || code === 127 || UNSAFE_FILENAME_CHARS.test(ch)) {
        return '_';
      }
      return ch;
    })
    .join('')
    // Collapse runs of underscores from replaced chars
    .replace(/_+/g, '_')
    .replace(/^[.\s_]+|[.\s_]+$/g, '');
  return cleaned || 'layer';
}
