import type { MeasureActionItem } from '@hungpvq/map-core/measurement';
import { BaseMapControl, Map, MeasurementControl } from '@hungpvq/react-map-core';
import { loggerFactory } from '@hungpvq/shared-log';
import { mdiPlus } from '@mdi/js';

import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';

const logger = loggerFactory.createLogger().setNamespace('demo:measurement', 2);

const actions: MeasureActionItem[] = [
  {
    title: 'add to layer',
    icon: mdiPlus,
    type: 'add-to-layer',
    handle: (data) => {
      logger.info('add to layer', data);
    },
    disabled: (ctx) => !ctx.coordinates || ctx.coordinates.length < 1,
    index: 0,
    show: (ctx) => ctx.status === 'handle',
  },
];

export function MeasurementPage() {
  return (
    <MapPageShell>
      <Map>
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <MeasurementControl position="top-left" actions={actions} />
        <BaseMapControl position="bottom-left" />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
