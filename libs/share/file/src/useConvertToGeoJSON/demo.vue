<script setup lang="ts">
import { ref } from 'vue';
import { useConvertToGeoJSON } from './useConvertToGeoJSON';

const raw = ref([
  {
    name: 'Test Line',
    geometry: [
      [105.8, 21.0],
      [105.9, 21.1],
    ],
  },
  {
    name: 'Test Polygon',
    geometry: [
      [
        [105.8, 20.8],
        [105.9, 20.8],
        [105.9, 20.9],
        [105.8, 20.9],
        [105.8, 20.8],
      ],
    ],
  },
]);

const { convertList } = useConvertToGeoJSON();
const result = ref<GeoJSON.FeatureCollection | null>(null);

function convert() {
  result.value = convertList(raw.value);
}
</script>

<template>
  <div class="p-4">
    <pre class="mt-4 bg-gray-100 p-2 rounded overflow-auto text-xs"
      >{{ JSON.stringify(raw, null, 2) }}
    </pre>
    <h2 class="text-xl font-bold mb-2">GeoJSON Converter</h2>
    <button class="bg-blue-500 text-white px-3 py-1 rounded" @click="convert">
      Convert
    </button>
    <pre class="mt-4 bg-gray-100 p-2 rounded overflow-auto text-xs"
      >{{ JSON.stringify(result, null, 2) }}
    </pre>
  </div>
</template>

<style scoped>
pre {
  max-height: 400px;
}
</style>
