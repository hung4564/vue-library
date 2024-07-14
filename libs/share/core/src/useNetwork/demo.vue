<script setup lang="ts">
import { stringify } from '@hungpvq/shared';
import { reactive } from 'vue';
import { useNetwork } from '.';

const network = reactive(useNetwork());
const text = stringify(network);
</script>

<template>
  <pre lang="yaml">{{ text }}</pre>
</template>
