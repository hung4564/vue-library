<script setup lang="ts">
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import { loggerFactory } from '@hungpvq/shared-log';
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import { BaseMapControl } from '@hungpvq/vue-map-core';
import { Map } from '@hungpvq/vue-map-core';
import { MeasureActionItem, MeasurementControl } from '@hungpvq/vue-map-core';
import { mdiPlus } from '@mdi/js';
import AsideControl from '../../layout/aside-control.vue';
import DemoHelpPanel from '../../components/DemoHelpPanel.vue';

const logger = loggerFactory.createLogger().setNamespace('demo:measurement', 2);

const actions: MeasureActionItem[] = [
  {
    title: 'add to layer',
    icon: mdiPlus,
    type: 'add-to-layer',
    handle: (data) => {
      logger
        .with({ fn: 'onAddToLayer', span: 'measurement.event' })
        .info('add to layer', data);
    },
    disabled: (ctx) => !ctx.coordinates || ctx.coordinates.length < 1,
    index: 0,
    show: (ctx) => ctx.status == 'handle',
  },
];
</script>
<template>
  <Map>
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <MeasurementControl position="top-left" :actions="actions" />
    <BaseMapControl position="bottom-left" />
    <DemoHelpPanel />
  </Map>
</template>

