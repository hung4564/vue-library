<script setup lang="ts">
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapControl } from '@hungpvq/vue-map-core';
import { Map } from '@hungpvq/vue-map-core';
import { MeasureActionItem, MeasurementControl } from '@hungpvq/vue-map-core';
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import { mdiPlus } from '@mdi/js';

import DemoHelpPanel from '../../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import AsideControl from '../../layout/aside-control.vue';

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
