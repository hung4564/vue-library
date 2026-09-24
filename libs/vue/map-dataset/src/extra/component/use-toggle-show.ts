import {
  bindToggleShowAction,
  getToggleShowTitleKey,
  performToggleShowAction,
} from '@hungpvq/map-dataset';
import { useLang, useMap } from '@hungpvq/vue-map-core';
import { computed, type Ref, ref, watch } from 'vue';

import { useMapDatasetStore } from '../../store/dataset-store';
import type { WithLayerItemActionType } from './types';

/** Shared toggle-show logic for default and custom menu components. */
export function useToggleShowAction(props: WithLayerItemActionType) {
  const showValue = ref(props.data.show);
  const { callMap, mapId } = useMap(props);
  const { trans } = useLang(mapId.value);
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
        applyToMap: store.allLayerShow !== false,
        disabled: props.disabled,
        onShowChange: (show) => {
          showValue.value = show;
        },
      });
    });
  };

  watch(
    () => props.data,
    (data, _prev, onCleanup) => {
      showValue.value = data.show;
      onCleanup(
        bindToggleShowAction(data, (show) => {
          showValue.value = show;
        }),
      );
    },
    { immediate: true },
  );

  return {
    mapId,
    showValue: showValue as Ref<boolean | undefined>,
    title,
    onToggleShow,
  };
}
