import { exportMapbox, PRINT_CONTROL_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { mdiPrinterOutline } from '@mdi/js';
import { saveAs } from 'file-saver';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { defaultMapProps, useMap } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang';
import { useRegisterMapControl } from '../../registry';
import { useToolbarControl } from '../../toolbar';

export interface PrintControlProps extends WithMapPropType {
  fileName?: string;
}

export function PrintControl({
  fileName = 'map',
  ...mapProps
}: PrintControlProps) {
  const merged = { ...defaultMapProps, ...mapProps };
  const { callMap, mapId, moduleContainerProps, order } = useMap({ ...merged, controlId: 'mapPrintControl' });
  const { trans, setLocaleDefault } = useLang(mapId);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const controlRef = useRef<{ sync: () => void } | null>(null);

  useEffect(() => {
    setLocaleDefault(PRINT_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const onPrint = useMemo(
    () => () => {
      callMap(async (map) => {
        loadingRef.current = true;
        setLoading(true);
        controlRef.current?.sync();
        try {
          const image = await exportMapbox(map);
          saveAs(image, `${fileName}.png`);
        } finally {
          loadingRef.current = false;
          setLoading(false);
          controlRef.current?.sync();
        }
      });
    },
    [callMap, fileName],
  );

  useRegisterMapControl(mapId, {
    id: 'mapPrintControl',
    panelKind: 'button',
    buttonPosition: merged.position,
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [
      {
        type: 'mapPrintControl',
        run: () => {
          onPrint();
        },
      },
    ],
  });

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapPrintControl',
    getState: () => ({
      visible: true,
      title: trans('map.print.title'),
      order,
      icon: { type: 'mdi' as const, path: mdiPrinterOutline },
      loading: loadingRef.current,
    }),
    onClick: () => {
      onPrint();
    },
  });
  controlRef.current = control;

  useEffect(() => {
    control.sync();
  }, [loading, order, control]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              control.onAction(e.nativeEvent);
            }}
          />
        ) : null
      }
    />
  );
}
