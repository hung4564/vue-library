<script setup lang="ts">
const links = [
  { to: '/', label: 'Home' },
  { to: '/sidebar', label: 'Sidebar' },
  { to: '/popup', label: 'Popup' },
  { to: '/float', label: 'Float' },
  { to: '/bottom', label: 'Bottom' },
  { to: '/drawer', label: 'Drawer' },
  { to: '/modal', label: 'Modal' },
  { to: '/custom-card', label: 'Custom card' },
];
</script>

<template>
  <div class="demo-shell">
    <nav class="demo-nav">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="demo-nav__link"
        active-class="demo-nav__link--active"
      >
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="demo-body">
      <RouterView />
    </div>
  </div>
</template>
