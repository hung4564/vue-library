<template lang="">
  <div style="display: flex; gap: 8px" class="p-4">
    <VBtn @click="onClick" color="primary"> TEST </VBtn>
    <VBtn @click="onClick" color="primary" variant="outlined"> TEST </VBtn>
    <VBtn @click="onClick" color="primary" variant="plain"> TEST </VBtn>
  </div>
  <div style="display: flex; gap: 8px" class="p-4">
    <VBtn @click="onClick" color="primary" disabled> TEST </VBtn>
    <VBtn @click="onClick" color="primary" variant="outlined" disabled>
      TEST
    </VBtn>
    <VBtn @click="onClick" color="primary" variant="plain" disabled>
      TEST
    </VBtn>
  </div>
  <div style="display: flex; gap: 8px" class="p-4">
    <VBtn @click="onClick" color="primary" size="xs"> TEST </VBtn>
    <VBtn @click="onClick" color="primary" size="s"> TEST </VBtn>
    <VBtn @click="onClick" color="primary" size="m"> TEST </VBtn>
    <VBtn @click="onClick" color="primary" size="l"> TEST </VBtn>
    <VBtn @click="onClick" color="primary" size="xl"> TEST </VBtn>
  </div>
</template>
<script setup>
import { VBtn } from '@hungpvq/ui-core';
function onClick() {
  alert(1);
}
</script>
<style lang=""></style>
