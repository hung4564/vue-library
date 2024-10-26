<template>
  <div class="my-12">
    <TopNavigation :data="data" />
    <ViewChapNormal :data="data" />
    <BottomNavigation :data="data" />
    <floatNavigation :data="data" />
  </div>
</template>
<script setup lang="ts">
import api from '../service/api.manga';
import BottomNavigation from './part/bottom-navigation.vue';
import floatNavigation from './part/float-navigation.vue';
import TopNavigation from './part/top-navigation.vue';
import ViewChapNormal from './part/view-chap-normal.vue';
import { setManga } from './store';
const data = api.getDetail();
setManga(data);
</script>
