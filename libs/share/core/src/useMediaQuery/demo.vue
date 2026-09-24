<script setup lang="ts">
import YAML from 'js-yaml';
import { computed, reactive } from 'vue';

import { useMediaQuery } from '.';

const isLargeScreen = useMediaQuery('(min-width: 1024px)');
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

const code = computed(() =>
  YAML.dump(
    reactive({
      isLargeScreen,
      prefersDark,
    }),
  ),
);
</script>

<template>
  <pre lang="json">{{ code }}</pre>
</template>
