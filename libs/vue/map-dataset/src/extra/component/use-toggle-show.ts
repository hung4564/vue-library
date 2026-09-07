import {
  LAYER_CONTROL_LOCALE,
  setListViewIntendedShow,
} from '@hungpvq/map-dataset';
import { useLang, useMap } from '@hungpvq/vue-map-core';
import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue';
import { useMapDatasetStore } from '../../store';
import type { WithLayerItemActionType } from './types';

/** Shared toggle-show logic for default and custom menu components. */
export function useToggleShowAction(props: WithLayerItemActionType) {
  const showValue = ref(props.data.show);
  const { callMap, mapId } = useMap(props);
  const { trans, setLocaleDefault } = useLang(mapId.value);
  setLocaleDefault(LAYER_CONTROL_LOCALE);
  const store = useMapDatasetStore(mapId.value);

  const title = computed(() =>
    trans.value(
      showValue.value
        ? 'map.layer-control.toggle.hide'
        : 'map.layer-control.toggle.show',
    ),
  );

  const onToggleShow = () => {
    if (props.disabled) return;
    const show = !showValue.value;
    showValue.value = show;
    callMap((map) => {
      setListViewIntendedShow(
        props.data,
        map,
        show,
        store.allLayerShow.value,
      );
    });
  };

  function onToggleShowEvent(e: { show: boolean }) {
    showValue.value = e.show;
  }

  onMounted(() => {
    props.data.on('toggleShow', onToggleShowEvent);
  });
  onUnmounted(() => {
    props.data.off('toggleShow', onToggleShowEvent);
  });

  return {
    mapId,
    showValue: showValue as Ref<boolean | undefined>,
    title,
    onToggleShow,
  };
}
