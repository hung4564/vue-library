---
category: Browser
---

<script setup>
import Demo from './demo.vue'
</script>

# useDownloadFile

<FunctionInfo :frontmatter="$frontmatter" package="Share - File" fn="useDownloadFile" />
Easily download files from a URL, Blob, Base64, or Buffer (ArrayBuffer/Uint8Array). Provides download status tracking and error handling.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Return Values

| Name           | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| `status`       | Current download status (`'idle'`, `'downloading'`, `'success'`, `'error'`)  |
| `error`        | Error message if the download fails (or `null` if no error)                  |
| `downloadFile` | Unified function to download a file from URL, Blob, base64, or binary buffer |

## Input Parameters for `downloadFile`

- `data` (string | Blob | ArrayBuffer | Uint8Array)

  - Required. The content to be downloaded. It can be:
    - A URL (string)
    - A base64 string (with or without data URI prefix)
    - A `Blob` object
    - An `ArrayBuffer` or `Uint8Array` for binary data

- `filename` (string)

  - Optional. The name of the file to save. Defaults to `'download'` if not provided.

- `mimeType` (string)
  - Optional. The MIME type of the file content.
  - If not provided, it will be guessed based on the file extension in `filename`, or default to `'application/octet-stream'`.

## Usage

```ts
import { useDownloadFile } from '@hungpvq@shared-file';

const { status, error, downloadFile } = useDownloadFile();

// Download from URL
await downloadFile('https://example.com/file.pdf', 'example.pdf');

// Download from base64
const base64 = 'data:text/plain;base64,SGVsbG8=';
await downloadFile(base64, 'greeting.txt');

// Download from Blob
const blob = new Blob(['Hello'], { type: 'text/plain' });
await downloadFile(blob, 'hello.txt');

// Download from ArrayBuffer / Uint8Array
const buffer = new TextEncoder().encode('binary data');
await downloadFile(buffer, 'data.bin');
```

## Notes

- Automatically detects input type (URL, base64, Blob, Buffer).
- Automatically guesses MIME type from filename if not provided.
- Supports binary data with `ArrayBuffer` and `Uint8Array`.
