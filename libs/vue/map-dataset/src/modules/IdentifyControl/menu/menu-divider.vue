<template lang="">
  <div class="menu-divider"></div>
</template>
<script setup lang="ts">
import type { IIdentifyView, MenuAction } from '@hungpvq/map-dataset';

defineProps<{ item: MenuAction<IIdentifyView>; data: IIdentifyView }>();
</script>
