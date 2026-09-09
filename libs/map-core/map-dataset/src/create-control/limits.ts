/** Soft client-side limit before parsing GIS files in CreateControl (50 MiB). */
export const CREATE_CONTROL_MAX_FILE_BYTES = 50 * 1024 * 1024;

export function assertCreateControlFileSize(
  files: Array<Blob | File>,
  maxBytes: number = CREATE_CONTROL_MAX_FILE_BYTES,
): void {
  const total = files.reduce((sum, file) => sum + (file?.size ?? 0), 0);
  if (total <= maxBytes) return;
  const mb = (total / (1024 * 1024)).toFixed(1);
  const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
  throw new Error(
    `File too large (${mb} MiB). Max allowed is ${maxMb} MiB for browser parse.`,
  );
}

export function formatCreateControlBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}
