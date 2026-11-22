import { type WithMapPropType } from '@hungpvq/map-core';
import { printMapToFile } from '@hungpvq/map-core/print';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiPrinterOutline } from '@mdi/js';
import { saveAs } from 'file-saver';
import { useEffect, useMemo, useRef, useState } from 'react';

import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang/hook';
import { useMapControl } from '../../registry/useMapControl';

export interface PrintControlProps extends WithMapPropType {
  fileName?: string;
}

export function PrintControl({
  fileName = 'map',
  ...mapProps
}: PrintControlProps) {
  const merged = { ...defaultMapProps, ...mapProps };
  const { callMap, mapId, order } = useMap(merged);
  const { trans } = useLang(mapId);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const onPrint = useMemo(
    () => () => {
      callMap(async (map) => {
        loadingRef.current = true;
        setLoading(true);
        controlRef.current?.sync();
        try {
          await printMapToFile(map, {
            fileName,
            save: (dataUrl, name) => saveAs(dataUrl, name),
          });
        } finally {
          loadingRef.current = false;
          setLoading(false);
          controlRef.current?.sync();
        }
      });
    },
    [callMap, fileName],
  );

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiPrinterOutline, {
        visible: true,
        title: trans('map.print.title'),
        order,
        loading: loadingRef.current,
      }),
    onClick: () => {
      onPrint();
    },
  };

  const { moduleContainerProps, control } = useMapControl(mapId, {
    id: 'mapPrintControl',
    panelKind: 'button',
    from: merged,
    order,
    actions: [
      {
        type: 'mapPrintControl',
        run: () => {
          onPrint();
        },
      },
    ],
    host: { button: singleButton },
    toolbar: singleButton,
  });
  const controlRef = useRef(control);
  controlRef.current = control;

  useEffect(() => {
    control.sync();
  }, [loading, order, control]);

  return <ModuleContainer {...moduleContainerProps} />;
}
