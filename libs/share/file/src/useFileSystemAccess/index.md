---
category: Browser
---

<script setup>
import Demo from './demo.vue'
</script>

# useFileSystemAccess

<FunctionInfo :frontmatter="$frontmatter" package="Share - File" fn="useFileSystemAccess" />
Create and read and write local files with [FileSystemAccessAPI](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```ts
import { useFileSystemAccess } from '@hungpvq@shared-file';

const { isSupported, data, file, fileName, fileMIME, fileSize, fileLastModified, create, open, save, saveAs, updateData } = useFileSystemAccess();
```
