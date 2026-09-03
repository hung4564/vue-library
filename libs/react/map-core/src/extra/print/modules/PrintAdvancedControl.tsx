import {
  CrosshairManager,
  PRINT_CONTROL_LOCALE,
  PrintableAreaManager,
  exportMapbox,
  exportMapboxWithOptions,
  type PrintOption,
  type MapControlButtonUIState,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  mdiClose,
  mdiCogOutline,
  mdiContentSaveOutline,
  mdiPrinterEye,
} from '@mdi/js';
import { saveAs } from 'file-saver';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { MapControlGroupButton } from '../../../components/MapControlGroupButton';
import { BaseButton, InputSelect, InputText } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang';
import { useRegisterMapControl } from '../../registry';
import { useToolbarControl } from '../../toolbar';
import { useMapPrint } from '../store';

const DEFAULT_SETTING: PrintOption = {
  ratio: 1,
  orientation: 'portrait',
  format: 'png',
};

const ORIENTATION_ITEMS = [
  { value: 'landscape', text: 'Landscape' },
  { value: 'portrait', text: 'Portrait' },
];

export interface PrintAdvancedControlProps extends WithMapPropType {
  disabledCrosshair?: boolean;
  disabledPrintableArea?: boolean;
  fileName?: string;
}

export function PrintAdvancedControl({
  disabledCrosshair = false,
  disabledPrintableArea = false,
  fileName = 'map',
  ...mapProps
}: PrintAdvancedControlProps) {
  const merged = { ...defaultMapProps, ...mapProps };
  const { callMap, mapId, moduleContainerProps, order } = useMap(
    { ...merged, controlId: 'mapPrintAdvancedControl' },
    onInit,
  );
  const { trans, setLocaleDefault } = useLang(mapId);
  const { initPrint } = useMapPrint(mapId);

  const [print, setPrint] = useState({
    show: false,
    loading: false,
    setting_show: false,
    setting: DEFAULT_SETTING,
  });

  const crosshair = useRef<CrosshairManager | undefined>();
  const printableArea = useRef<PrintableAreaManager | undefined>();
  const controlRef = useRef<{ sync: () => void } | null>(null);
  const printRef = useRef(print);

  function updatePrint(
    patch: Partial<typeof print> | ((prev: typeof print) => typeof print),
  ) {
    const next =
      typeof patch === 'function'
        ? patch(printRef.current)
        : { ...printRef.current, ...patch };
    printRef.current = next;
    setPrint(next);
    controlRef.current?.sync();
  }

  const disabledCrosshairRef = useRef(disabledCrosshair);
  const disabledPrintableAreaRef = useRef(disabledPrintableArea);
  disabledCrosshairRef.current = disabledCrosshair;
  disabledPrintableAreaRef.current = disabledPrintableArea;

  useEffect(() => {
    setLocaleDefault(PRINT_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  useEffect(() => {
    return () => {
      onClosePrint();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount cleanup only
  }, []);

  function onMapResize() {
    printableArea.current?.mapResize();
    crosshair.current?.mapResize();
  }

  function toggleCrosshair(show: boolean) {
    if (disabledCrosshairRef.current) return;
    callMap((map) => {
      if (!show) {
        crosshair.current?.destroy();
        crosshair.current = undefined;
        return;
      }
      crosshair.current = new CrosshairManager(map.getCanvas());
      crosshair.current.create();
    });
  }

  function togglePrintableArea(show: boolean, options: PrintOption) {
    if (disabledPrintableAreaRef.current) return;
    callMap((map) => {
      if (!show) {
        map.off('resize', onMapResize);
        printableArea.current?.destroy();
        printableArea.current = undefined;
        return;
      }
      map.on('resize', onMapResize);
      printableArea.current = new PrintableAreaManager(
        map.getCanvas(),
        options,
      );
      printableArea.current.create();
    });
  }

  function onClosePrint() {
    updatePrint({ loading: false, show: false });
    toggleCrosshair(false);
    togglePrintableArea(false, printRef.current.setting);
  }

  function onShowPrint(options: PrintOption) {
    const nextSetting = { ...DEFAULT_SETTING, ...options };
    updatePrint({ show: true, setting: nextSetting });
    toggleCrosshair(true);
    togglePrintableArea(true, nextSetting);
  }

  async function onDownload(data64: string) {
    saveAs(data64, `${fileName}.png`);
  }

  async function onSave(cb?: (image: string) => Promise<void>) {
    callMap(async (map) => {
      if (!printableArea.current) return;
      try {
        updatePrint({ loading: true });
        const image = await exportMapboxWithOptions(
          map,
          printableArea.current.getCutSize(),
        );
        if (cb) await cb(image);
        else await onDownload(image);
      } finally {
        updatePrint({ loading: false });
      }
    });
  }

  async function onSaveAll(cb?: (image: string) => Promise<void>) {
    callMap(async (map) => {
      updatePrint({ loading: true });
      try {
        const image = await exportMapbox(map);
        if (cb) await cb(image);
        else await onDownload(image);
      } finally {
        updatePrint({ loading: false });
      }
    });
  }

  function toggleSetting() {
    updatePrint((prev) => ({ ...prev, setting_show: !prev.setting_show }));
  }

  function onChangeSetting(next: PrintOption) {
    updatePrint({ setting: next });
    printableArea.current?.setOption(next);
  }

  const apiRef = useRef({
    onShowPrint,
    onClosePrint,
    onSave,
    onSaveAll,
  });
  apiRef.current = { onShowPrint, onClosePrint, onSave, onSaveAll };

  function onInit() {
    initPrint({
      show: (options) => apiRef.current.onShowPrint(options),
      close: () => apiRef.current.onClosePrint(),
      save: (cb) => apiRef.current.onSave(cb),
      saveAll: (cb) => apiRef.current.onSaveAll(cb),
    });
  }

  const handlersRef = useRef({
    onShowPrint,
    onClosePrint,
    onSave,
    toggleSetting,
  });
  handlersRef.current = {
    onShowPrint,
    onClosePrint,
    onSave,
    toggleSetting,
  };

  const toolbarConfig = useMemo(
    () => ({
      kind: 'module' as const,
      moduleId: 'mapPrintAdvancedControl',
      moduleOrder: order,
      buttons: [
        {
          id: 'mapPrintShow',
          getState: () => ({
            visible: !printRef.current.show,
            title: trans('map.print.title'),
            icon: { type: 'mdi' as const, path: mdiPrinterEye },
          }),
          onClick: () =>
            handlersRef.current.onShowPrint(printRef.current.setting),
        },
        {
          id: 'mapPrintSave',
          getState: () => ({
            visible: printRef.current.show,
            title: trans('map.print.actions.save'),
            icon: { type: 'mdi' as const, path: mdiContentSaveOutline },
            loading: printRef.current.loading,
          }),
          onClick: () => handlersRef.current.onSave(),
        },
        {
          id: 'mapPrintClose',
          getState: () => ({
            visible: printRef.current.show,
            title: trans('map.print.actions.clear'),
            icon: { type: 'mdi' as const, path: mdiClose },
            loading: printRef.current.loading,
          }),
          onClick: () => handlersRef.current.onClosePrint(),
        },
        {
          id: 'mapPrintSetting',
          getState: () => ({
            visible: true,
            active: printRef.current.setting_show,
            title: trans('map.print.actions.setting'),
            icon: { type: 'mdi' as const, path: mdiCogOutline },
            loading: printRef.current.loading,
          }),
          onClick: () => handlersRef.current.toggleSetting(),
        },
      ],
    }),
    [order, trans],
  );

  const { state, control } = useToolbarControl(mapId, merged, toolbarConfig);
  controlRef.current = control;

  const registerActions = useMemo(
    () => [
      {
        type: 'mapPrintShow',
        run: () =>
          handlersRef.current.onShowPrint(printRef.current.setting),
      },
      {
        type: 'mapPrintSave',
        run: () => handlersRef.current.onSave(),
      },
      {
        type: 'mapPrintClose',
        run: () => handlersRef.current.onClosePrint(),
      },
      {
        type: 'mapPrintSetting',
        run: () => handlersRef.current.toggleSetting(),
      },
    ],
    [],
  );

  useRegisterMapControl(mapId, {
    id: 'mapPrintAdvancedControl',
    panelKind: 'button',
    buttonPosition: merged.position,
    defaultActionType: 'mapPrintShow',
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
      disabledCrosshair,
      disabledPrintableArea,
    }),
    actions: registerActions,
  });

  useEffect(() => {
    control.sync();
  }, [print, order, control]);

  const moduleState = state as
    | Record<string, MapControlButtonUIState | undefined>
    | undefined;

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlGroupButton row>
          {!print.show && moduleState?.mapPrintShow ? (
            <MapCommonButton
              option={moduleState.mapPrintShow}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction('mapPrintShow', e.nativeEvent);
              }}
            />
          ) : null}
          {print.show && moduleState?.mapPrintSave ? (
            <MapCommonButton
              option={moduleState.mapPrintSave}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction('mapPrintSave', e.nativeEvent);
              }}
            />
          ) : null}
          {print.show && moduleState?.mapPrintClose ? (
            <MapCommonButton
              option={moduleState.mapPrintClose}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction('mapPrintClose', e.nativeEvent);
              }}
            />
          ) : null}
          {moduleState?.mapPrintSetting ? (
            <MapCommonButton
              option={moduleState.mapPrintSetting}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction('mapPrintSetting', e.nativeEvent);
              }}
            />
          ) : null}
        </MapControlGroupButton>
      }
      draggable={(bind) =>
        print.setting_show ? (
          <DraggableItemPopup
            show={print.setting_show}
            onUpdateShow={(v) => updatePrint({ setting_show: !!v })}
            title={trans('map.print.setting.title')}
            height={220}
            {...bind}
          >
        <div className="map-print-advanced-setting">
              <div>
                <InputText
                  label={trans('map.print.field.ratio')}
                  value={String(print.setting.ratio)}
                  onChange={(v) =>
                    onChangeSetting({
                      ...printRef.current.setting,
                      ratio: Number(v) || 1,
                    })
                  }
                />
              </div>
              <div>
                <InputSelect
                  label={trans('map.print.field.orientation')}
                  value={print.setting.orientation}
                  items={ORIENTATION_ITEMS}
                  onChange={(v) =>
                    onChangeSetting({
                      ...printRef.current.setting,
                      orientation: v as PrintOption['orientation'],
                    })
                  }
                />
              </div>
              <div className="map-print-advanced-setting__grow" />
              {print.show ? (
                <BaseButton
                  className="map-print-advanced-setting__apply"
                  onClick={() => onSave()}
                >
                  {trans('map.print.btn.apply')}
                </BaseButton>
              ) : null}
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
