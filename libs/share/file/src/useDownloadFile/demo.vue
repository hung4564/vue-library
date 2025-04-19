<script setup lang="ts">
import { ref } from 'vue';
import { useDownloadFile } from '../useDownloadFile';

const { status, error, downloadFile } = useDownloadFile();

const base64 = ref('data:text/plain;base64,SGVsbG8sIHdvcmxkIQ=='); // "Hello, world!"
const blob = new Blob(['Blob content example!'], { type: 'text/plain' });
const buffer = new TextEncoder().encode('Binary text!');
const downloadingFrom = ref('');

const downloadUrlFile = () => {
  downloadingFrom.value = 'url';
  downloadFile(
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'example.pdf'
  );
};

const downloadBase64File = () => {
  downloadingFrom.value = 'base64';
  downloadFile(base64.value, 'hello.txt');
};

const downloadBlobFile = () => {
  downloadingFrom.value = 'blob';
  downloadFile(blob, 'blob-example.txt');
};

const downloadBufferFile = () => {
  downloadingFrom.value = 'buffer';
  downloadFile(buffer, 'binary.txt');
};
</script>

<template>
  <div class="actions">
    <button @click="downloadUrlFile">Download from URL</button>
    <button @click="downloadBase64File">Download from Base64</button>
    <button @click="downloadBlobFile">Download from Blob</button>
    <button @click="downloadBufferFile">Download from Buffer</button>
  </div>

  <div class="status">
    <p><b>Status:</b> {{ status }}</p>
    <p><b>Source:</b> {{ downloadingFrom }}</p>
    <p v-if="error" class="error">❌ Error: {{ error }}</p>
  </div>
</template>

<style scoped>
.actions button {
  margin-right: 1rem;
  margin-bottom: 0.5rem;
}
.status {
  margin-top: 1rem;
}
.error {
  color: red;
}
.actions {
  button ~ button {
    margin-left: 0;
  }
}
</style>
