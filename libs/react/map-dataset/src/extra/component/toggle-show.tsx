import { LAYER_CONTROL_LOCALE, setListViewIntendedShow } from '@hungpvq/map-dataset';
import { LIST_VIEW_MENU_COMPONENT_KEY, type WithLayerItemActionType } from '@hungpvq/map-dataset/menu';
import { RegistryItem, useLang, useMap } from '@hungpvq/react-map-core';
import { type ReactNode, useEffect, useState } from 'react';
import { useMapDataset } from '../../store';
import {
  ToggleShowButton,
  type ToggleShowButtonProps,
} from './toggle-show-button';

/** Shared toggle-show logic for default and custom menu components. */
export function useToggleShowAction(props: WithLayerItemActionType) {
  const { callMap, mapId } = useMap(props);
  const { trans, setLocaleDefault } = useLang(mapId);
  const { getStoreDataset } = useMapDataset(mapId);
  const store = getStoreDataset();
  const [showValue, setShowValue] = useState(!!props.data.show);

  useEffect(() => {
    setLocaleDefault(LAYER_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  useEffect(() => {
    const onToggle = (e: { show: boolean }) => setShowValue(!!e.show);
    props.data.on('toggleShow', onToggle);
    return () => props.data.off('toggleShow', onToggle);
  }, [props.data]);

  function onToggleShow() {
    if (props.disabled) return;
    const show = !showValue;
    setShowValue(show);
    callMap((map) => {
      setListViewIntendedShow(
        props.data,
        map,
        show,
        store?.allLayerShow !== false,
      );
    });
  }

  return {
    mapId,
    showValue,
    title: trans(
      showValue
        ? 'map.layer-control.toggle.hide'
        : 'map.layer-control.toggle.show',
    ),
    onToggleShow,
  };
}

export type ToggleShowRenderButton = (
  props: ToggleShowButtonProps,
) => ReactNode;

/** Logic wrapper: default UI via registry, or `renderButton` for custom UI. */
export function ToggleShow({
  renderButton,
  ...props
}: WithLayerItemActionType & {
  renderButton?: ToggleShowRenderButton;
}) {
  const { mapId, showValue, title, onToggleShow } = useToggleShowAction(props);

  const buttonProps: ToggleShowButtonProps = {
    show: showValue,
    disabled: props.disabled,
    title,
    onToggle: onToggleShow,
  };

  if (renderButton) return <>{renderButton(buttonProps)}</>;

  return (
    <RegistryItem
      componentKey={LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton}
      defaultComponent={ToggleShowButton}
      mapId={mapId}
      {...buttonProps}
    />
  );
}
