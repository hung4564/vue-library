<script setup lang="ts">
import { useFileDialog } from '../useFileDialog';

import { useFileReader } from '.';
import { ref } from 'vue';
const { files, open, reset, onChange } = useFileDialog();
const { read } = useFileReader();
const text = ref('');
onChange((files) => {
  if (files && files[0])
    read(files[0]).then((res) => {
      console.log(res);
      if (typeof res == 'string') text.value = res;
    });
  /** do something with files */
});
</script>

<template>
  <button type="button" @click="open()">Choose files</button>
  <button type="button" :disabled="!files" @click="reset()">Reset</button>
  <template v-if="files">
    <p>
      You have selected:
      <b>{{ `${files.length} ${files.length === 1 ? 'file' : 'files'}` }}</b>
    </p>
    <li v-for="file of files" :key="file.name">
      {{ file.name }}
    </li>
  </template>
  <textarea readonly v-model="text"> </textarea>
</template>
<style>
textarea {
  background: rgba(0, 0, 0, 0);
  border: none;
  outline: 0;
  cursor: text;
  width: 100%;
  height: 300px;
}
textarea {
  resize: none;
}
</style>
