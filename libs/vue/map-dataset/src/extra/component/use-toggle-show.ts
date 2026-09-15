import {
  bindToggleShowAction,
  getToggleShowTitleKey,
  LAYER_CONTROL_LOCALE,
  performToggleShowAction,
} from '@hungpvq/map-dataset';
import { useLang, useMap } from '@hungpvq/vue-map-core';
import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue';
import { useMapDatasetStore } from '../../store/dataset-api';
import type { WithLayerItemActionType } from './types';

/** Shared toggle-show logic for default and custom menu components. */
export function useToggleShowAction(props: WithLayerItemActionType) {
  const showValue = ref(props.data.show);
  const { callMap, mapId } = useMap(props);
  const { trans, setLocaleDefault } = useLang(mapId.value);
  setLocaleDefault(LAYER_CONTROL_LOCALE);
  const store = useMapDatasetStore(mapId.value);

  const title = computed(() =>
    trans.value(getToggleShowTitleKey(!!showValue.value)),
  );

  const onToggleShow = () => {
    callMap((map) => {
      performToggleShowAction({
        item: props.data,
        map,
        currentShow: showValue.value,
        applyToMap: store.allLayerShow.value,
        disabled: props.disabled,
        onShowChange: (show) => {
          showValue.value = show;
        },
      });
    });
  };

  onMounted(() => {
    const cleanup = bindToggleShowAction(props.data, (show) => {
      showValue.value = show;
    });
    onUnmounted(cleanup);
  });

  return {
    mapId,
    showValue: showValue as Ref<boolean | undefined>,
    title,
    onToggleShow,
  };
};
