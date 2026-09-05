export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function sanitizeExportFilename(name: string): string {
  const trimmed = name.trim() || 'layer';
  return [...trimmed]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code < 32 || '<>:"/\\|?*'.includes(ch)) return '_';
      return ch;
    })
    .join('');
}
