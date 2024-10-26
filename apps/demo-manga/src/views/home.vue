<template lang="">
  <div style="display: flex; gap: 8px" class="p-4">
    <VBtn @click="onClick" color="primary"> test </VBtn>
    <VBtn @click="onClick" color="primary" variant="outlined"> test </VBtn>
    <VBtn @click="onClick" color="primary" variant="plain"> test </VBtn>
  </div>
  <div style="display: flex; gap: 8px" class="p-4">
    <VBtn @click="onClick" color="primary" disabled> test </VBtn>
    <VBtn @click="onClick" color="primary" variant="outlined" disabled>
      test
    </VBtn>
    <VBtn @click="onClick" color="primary" variant="plain" disabled>
      test
    </VBtn>
  </div>
  <div style="display: flex; gap: 8px" class="p-4">
    <VBtn @click="onClick" color="primary" size="xs"> test </VBtn>
    <VBtn @click="onClick" color="primary" size="s"> test </VBtn>
    <VBtn @click="onClick" color="primary" size="m"> test </VBtn>
    <VBtn @click="onClick" color="primary" size="l"> test </VBtn>
    <VBtn @click="onClick" color="primary" size="xl"> test </VBtn>
  </div>
</template>
<script setup>
import { VBtn } from '@hungpvq/ui-core';
function onClick() {
  alert(1);
}
</script>
<style lang=""></style>
