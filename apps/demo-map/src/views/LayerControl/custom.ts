import { IBuild, LayerAction } from '@hungpvq/vue-map-core';
import {
  Layer,
  LayerLegendBuild,
  LayerLegendLinearGradient,
  LayerLegendSingleColor,
  LayerListBuild,
  OptionDefault,
  getLayerData,
  setupDefault,
  toBoundAction,
  toggleShowAction,
} from '@hungpvq/vue-map-layer';
import { mdiInformation } from '@mdi/js';
import CustomButton from './custom-button.vue';
import CustomChangeIcon from './custom-change-icon.vue';
import CustomShowComponent from './custom-show-component.vue';
export function createCustomLegendLayer(options: OptionDefault) {
  const layer = new Layer();
  layer.setInfo({ name: 'Custom legend', metadata: {} });
  const builds: IBuild[] = [
    new LayerListBuild().disableOpacity(),
    new LayerLegendBuild().setFields([
      {
        option: { text: 'legend text', value: 'test' },
      },
      {
        option: {
          text: 'legend color',
          color: '#fff',
        },
        component: LayerLegendSingleColor,
      },
      {
        option: {
          text: 'legend linear',
          items: [
            { value: 'test 1', color: '#fff' },
            { value: 'test 2', color: '#000' },
            { value: 'test 3', color: 'red' },
          ],
        },
        component: LayerLegendLinearGradient,
      },
    ]),
  ];
  const actions: LayerAction[] = [];
  return setupDefault(layer, { builds, actions }, options);
}
export function createCustomActionLayer() {
  const layer = new Layer();
  layer.setInfo({ name: 'Custom action', metadata: {} });
  const builds: IBuild[] = [new LayerListBuild()];
  const actions: LayerAction[] = [
    toBoundAction(),
    toggleShowAction(),
    {
      id: 'call click',
      menu: {
        location: 'menu',
        name: 'Call click on menu',
        type: 'item',
        click(layer, map_id) {
          alert(`layer id: ${layer.id}\n map id: ${map_id}`);
        },
      },
    },
    {
      id: 'call click on extra',
      menu: {
        location: 'extra',
        icon: mdiInformation,
        name: 'Call click on extra',
        type: 'item',
        click(layer, map_id) {
          alert(`layer id: ${layer.id}\nmap id: ${map_id}`);
        },
      },
    },
    {
      id: 'edit icon on extra',
      menu: {
        location: 'extra',
        type: 'item',
        name: 'edit icon on extra',
        icon: () => {
          return CustomChangeIcon;
        },
        click(layer) {
          layer.getView('list').show = !layer.getView('list').show;
        },
      },
    },
    {
      id: 'button show component',
      component: () => CustomShowComponent,
      option: { test: 'test-option' },
      menu: {
        location: 'menu',
        type: 'item',
        name: 'button show component',
      },
    },
    toBoundAction({ location: 'bottom' }),
    {
      id: 'divider',
      menu: { location: 'bottom', type: 'divider' },
    },
    {
      id: 'button show component bottom',
      component: () => CustomShowComponent,
      option: { test: 'test-option' },
      menu: {
        location: 'bottom',
        type: 'item',
        icon: mdiInformation,
        name: 'button show component',
      },
    },
  ];
  return setupDefault(layer, { builds, actions });
}

export function createCustomActionBottomLayer() {
  const layer = new Layer();
  layer.setInfo({ name: 'Custom bottom action', metadata: {} });
  const builds: IBuild[] = [new LayerListBuild().disableOpacity()];
  const actions: LayerAction[] = [
    toBoundAction({ location: 'bottom' }),
    {
      id: 'divider',
      menu: { location: 'bottom', type: 'divider' },
    },
    {
      id: 'button show component bottom',
      menu: {
        location: 'bottom',
        type: 'item',
        icon: () => CustomButton,
        name: 'button show component',
        click: (layer, map_id) => {
          const data = getLayerData(map_id, layer.id);
          data.value.is_show = !data.value.is_show;
        },
      },
    },
  ];
  return setupDefault(layer, { builds, actions });
}
