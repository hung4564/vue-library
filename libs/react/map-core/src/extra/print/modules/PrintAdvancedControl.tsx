import { type WithMapPropType } from '@hungpvq/map-core';
import {
  CrosshairManager,
  PRINT_CONTROL_LOCALE,
  PRINT_PAPER_PRESETS,
  PrintableAreaManager,
  exportMapbox,
  exportMapboxWithOptions,
  type PrintOption,
} from '@hungpvq/map-core/print';
import { type MapControlButtonUIState, mdiIcon } from '@hungpvq/map-core/toolbar';
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
import { InputSelect, InputText } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang';
import { useRegisterMapControl } from '../../registry';
import { useToolbarControl } from '../../toolbar';
import { useMapPrint } from '../store';
import { MapControlButton } from '../../../components';

const DEFAULT_SETTING: PrintOption = {
  ratio: 1,
  orientation: 'portrait',
  format: 'png',
  paper: 'custom',
  dpi: 96,
  watermark: '',
};

const ORIENTATION_ITEMS = [
  { value: 'landscape', text: 'Landscape' },
  { value: 'portrait', text: 'Portrait' },
];

const PAPER_ITEMS = [
  { value: 'custom', text: 'Custom' },
  { value: 'a4', text: 'A4' },
  { value: 'letter', text: 'Letter' },
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
        const setting = printRef.current.setting;
        const image = await exportMapboxWithOptions(map, {
          ...printableArea.current.getCutSize(),
          watermark: setting.watermark || undefined,
          dpi: setting.dpi,
        });
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
        const setting = printRef.current.setting;
        const image = await exportMapbox(map, {
          watermark: setting.watermark || undefined,
          dpi: setting.dpi,
        });
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
      order: order,
      orientation: 'row' as const,
      buttons: [
        {
          id: 'mapPrintShow',
          getState: () => ({
            visible: !printRef.current.show,
            title: trans('map.print.title'),
            icon: mdiIcon(mdiPrinterEye),
          }),
          onClick: () =>
            handlersRef.current.onShowPrint(printRef.current.setting),
        },
        {
          id: 'mapPrintSave',
          getState: () => ({
            visible: printRef.current.show,
            title: trans('map.print.actions.save'),
            icon: mdiIcon(mdiContentSaveOutline),
            loading: printRef.current.loading,
          }),
          onClick: () => handlersRef.current.onSave(),
        },
        {
          id: 'mapPrintClose',
          getState: () => ({
            visible: printRef.current.show,
            title: trans('map.print.actions.clear'),
            icon: mdiIcon(mdiClose),
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
            icon: mdiIcon(mdiCogOutline),
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
          {moduleState?.mapPrintShow ? (
            <MapCommonButton
              option={moduleState.mapPrintShow}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction('mapPrintShow', e.nativeEvent);
              }}
            />
          ) : null}
          {moduleState?.mapPrintSave ? (
            <MapCommonButton
              option={moduleState.mapPrintSave}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction('mapPrintSave', e.nativeEvent);
              }}
            />
          ) : null}
          {moduleState?.mapPrintClose ? (
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
            height={340}
            {...bind}
          >
        <div className="map-print-advanced-setting">
              <div>
                <InputSelect
                  label={trans('map.print.field.paper')}
                  value={print.setting.paper || 'custom'}
                  items={PAPER_ITEMS.map((item) => ({
                    ...item,
                    text:
                      item.value === 'custom'
                        ? trans('map.print.paper.custom')
                        : item.value === 'a4'
                          ? trans('map.print.paper.a4')
                          : trans('map.print.paper.letter'),
                  }))}
                  onChange={(value) => {
                    const paper = String(value) as PrintOption['paper'];
                    const next: PrintOption = {
                      ...print.setting,
                      paper,
                    };
                    if (paper === 'a4' || paper === 'letter') {
                      next.ratio = PRINT_PAPER_PRESETS[paper].ratio;
                    }
                    onChangeSetting(next);
                  }}
                />
              </div>
              <div>
                <InputText
                  label={trans('map.print.field.ratio')}
                  value={String(print.setting.ratio)}
                  onChange={(value) =>
                    onChangeSetting({
                      ...print.setting,
                      paper: 'custom',
                      ratio: Number(value) || 1,
                    })
                  }
                />
              </div>
              <div>
                <InputSelect
                  label={trans('map.print.field.orientation')}
                  value={print.setting.orientation}
                  items={ORIENTATION_ITEMS}
                  onChange={(value) =>
                    onChangeSetting({
                      ...print.setting,
                      orientation: value as PrintOption['orientation'],
                    })
                  }
                />
              </div>
              <div>
                <InputText
                  label={trans('map.print.field.dpi')}
                  value={String(print.setting.dpi ?? 96)}
                  onChange={(value) =>
                    onChangeSetting({
                      ...print.setting,
                      dpi: Number(value) || 96,
                    })
                  }
                />
              </div>
              <div>
                <InputText
                  label={trans('map.print.field.watermark')}
                  value={print.setting.watermark || ''}
                  onChange={(value) =>
                    onChangeSetting({
                      ...print.setting,
                      watermark: value,
                    })
                  }
                />
                {print.setting.watermark ? (
                  <div className="map-print-watermark-preview" aria-hidden="true">
                    {print.setting.watermark}
                  </div>
                ) : null}
              </div>
              <div className="map-print-advanced-setting__grow" />
              {print.show ? (
                <MapControlButton variant="filled"
                  className="map-print-advanced-setting__apply"
                  onClick={() => void onSave()}
                >
                  {trans('map.print.btn.apply')}
                </MapControlButton>
              ) : null}
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
