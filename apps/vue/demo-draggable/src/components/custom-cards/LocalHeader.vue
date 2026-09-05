<template>
  <div class="custom-header custom-header--local">
    <hr class="map-divider" />
    <div class="draggable-header">
      <div class="draggable-header__content">
        <slot name="pre-title" />
        <div class="draggable-header__title">
          <slot name="title" />
        </div>
        <div class="map-spacer" />
        <slot name="extra-btn" />
      </div>
    </div>
    <hr class="map-divider" />
  </div>
</template>
