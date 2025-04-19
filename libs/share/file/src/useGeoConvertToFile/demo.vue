<script setup lang="ts">
import type { FeatureCollection } from 'geojson';
import { ref } from 'vue';
import { SupportedFormat, useGeoConvertToFile } from '.';

const { convert } = useGeoConvertToFile();

const geojsonData = ref<FeatureCollection>({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        coordinates: [
          [
            [105.88454157202995, 21.0854254401454],
            [105.88454157202995, 20.878811643339404],
            [106.16710803591963, 20.878811643339404],
            [106.16710803591963, 21.0854254401454],
            [105.88454157202995, 21.0854254401454],
          ],
        ],
        type: 'Polygon',
        bbox: [
          105.88454157202995, 20.878811643339404, 106.16710803591963,
          21.0854254401454,
        ],
      },
      bbox: [
        105.88454157202995, 20.878811643339404, 106.16710803591963,
        21.0854254401454,
      ],
    },
  ],
  bbox: [
    105.88454157202995, 20.878811643339404, 106.16710803591963,
    21.0854254401454,
  ],
});

const fileFormat = ref<SupportedFormat>('geojson'); // Format có thể là 'geojson', 'shapefile', v.v.
const downloadStatus = ref('');
const geojsonInput = ref(JSON.stringify(geojsonData.value, null, 2)); // Để lưu trữ đầu vào JSON từ người dùng

// Hàm để xử lý nhập liệu GeoJSON từ chuỗi JSON
const handleGeoJsonInput = () => {
  try {
    geojsonData.value = JSON.parse(geojsonInput.value);
    downloadStatus.value = ''; // Xóa trạng thái lỗi nếu có
  } catch (error) {
    downloadStatus.value = 'Invalid GeoJSON input!';
  }
};

const downloadFile = async () => {
  const filename = `data.${
    fileFormat.value === 'geojson'
      ? 'geojson'
      : fileFormat.value === 'shapefile'
      ? 'zip'
      : fileFormat.value
  }`;
  downloadStatus.value = 'Downloading...';
  const blob = await convert(geojsonData.value, {
    format: fileFormat.value,
    filename,
  });
  if (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    downloadStatus.value = 'Download complete!';
  } else {
    downloadStatus.value = 'Download failed.';
  }
};
</script>

<template>
  <div class="actions">
    <div>
      <label for="geojsonInput">Enter GeoJSON:</label>
      <textarea
        id="geojsonInput"
        v-model="geojsonInput"
        rows="10"
        cols="50"
        placeholder="Paste your GeoJSON data here..."
      >
      </textarea>
      <button @click="handleGeoJsonInput">Parse GeoJSON</button>
    </div>

    <div>
      <label for="formatSelect">Choose export format:</label>
      <select id="formatSelect" v-model="fileFormat">
        <option value="geojson">GeoJSON</option>
        <option value="shapefile">Shapefile</option>
        <option value="kml">KML</option>
        <option value="csv">CSV</option>
      </select>
    </div>

    <button @click="downloadFile">Download as {{ fileFormat }}</button>
  </div>

  <div class="status">
    <p><b>Status:</b> {{ downloadStatus }}</p>
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
textarea {
  width: 100%;
  margin-bottom: 1rem;
}
</style>
<style scoped>
select {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}

select:focus {
  border-color: #007bff;
  background-color: #eaf2ff;
}
</style>
