---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'VueLibrary'
  text: 'Powerful Vue.js Map Libraries'
  tagline: Build interactive map applications with Vue.js and MapLibre GL
  actions:
    - theme: brand
      text: Get Started
      link: /map
    - theme: alt
      text: View on GitHub
      link: https://github.com/hung4564/vue-library

features:
  - title: Shared
    details: Shared package
    link: /shared
  - title: Draggable
    details: Draggable package
    link: /draggable
  - title: Map
    details: Map package
    link: /map
---

<script setup>
import { packageVersions } from '../.vitepress/packages-versions'
</script>

<style scoped>
.home-versions {
  max-width: 1152px;
  margin: 0 auto 2rem;
  padding: 0 24px;
  display: grid;
  gap: 0.75rem;
}
.home-versions h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}
.home-versions ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.home-versions code {
  font-size: 12px;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}
</style>

<div class="home-versions">
  <h2>Current package versions</h2>
  <ul>
    <li v-for="(version, name) in packageVersions" :key="name">
      <code>{{ name }}@{{ version }}</code>
    </li>
  </ul>
</div>