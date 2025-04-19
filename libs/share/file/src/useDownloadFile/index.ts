import { ref } from 'vue';

type DownloadStatus = 'idle' | 'downloading' | 'success' | 'error';
type DownloadType = 'url' | 'base64' | 'blob' | 'buffer';
type DownloadInput = string | Blob | File | ArrayBuffer | Uint8Array;

const detectType = (data: DownloadInput): DownloadType => {
  if (typeof data === 'string') {
    if (
      data.startsWith('http://') ||
      data.startsWith('https://') ||
      data.startsWith('ftp://')
    ) {
      return 'url';
    } else if (data.startsWith('data:')) {
      return 'base64';
    }
  } else if (data instanceof Blob || data instanceof File) {
    return 'blob';
  } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    return 'buffer';
  }

  throw new Error('Không thể xác định loại dữ liệu để tải');
};
const guessMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    html: 'text/html',
  };
  return map[ext || ''] || 'application/octet-stream';
};
export function useDownloadFile() {
  const status = ref<DownloadStatus>('idle');
  const error = ref<string | null>(null);

  const reset = () => {
    status.value = 'idle';
    error.value = null;
  };

  const downloadFile = async (
    data: DownloadInput,
    filename?: string,
    type?: DownloadType,
    mimeType?: string
  ) => {
    reset();
    try {
      status.value = 'downloading';

      const resolvedType = type || detectType(data);
      const resolvedFilename = filename || 'download';
      const resolvedMime = mimeType || guessMimeType(resolvedFilename);
      let blob: Blob;

      switch (resolvedType) {
        case 'url': {
          const response = await fetch(data as string);
          if (!response.ok) {
            throw new Error(
              `Fetch failed: ${response.status} ${response.statusText}`
            );
          }
          blob = await response.blob();
          break;
        }

        case 'base64': {
          const base64 = data as string;
          const byteString = atob(base64.split(',')[1] || base64);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          blob = new Blob([ab], { type: resolvedMime });
          break;
        }

        case 'blob': {
          blob = data as Blob;
          break;
        }

        case 'buffer': {
          if (data instanceof ArrayBuffer) {
            blob = new Blob([data], { type: resolvedMime });
          } else if (data instanceof Uint8Array) {
            blob = new Blob([data.buffer], { type: resolvedMime });
          } else {
            throw new Error('Không thể chuyển buffer thành Blob');
          }
          break;
        }

        default:
          throw new Error('Loại dữ liệu không hợp lệ');
      }

      triggerDownload(blob, resolvedFilename);
      status.value = 'success';
    } catch (err: any) {
      status.value = 'error';
      error.value = err.message || 'Lỗi không xác định';
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    status,
    error,
    downloadFile,
    detectType,
    guessMimeType,
  };
}
