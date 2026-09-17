import { type WithMapPropType } from '@hungpvq/map-core';
import {
  createPrintAdvancedSession,
  PRINT_CONTROL_LOCALE,
  type PrintAdvancedSession,
  type PrintAdvancedUiState,
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
import { MapControlButton } from '../../../components/MapControlButton';
import { MapControlGroupButton } from '../../../components/MapControlGroupButton';
import { InputSelect, InputText } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang/hook';
import { useRegisterMapControl } from '../../registry/useRegisterMapControl';
import { useToolbarControl } from '../../toolbar/helper';
import { useMapPrint } from '../store';

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
  const { trans, registerLocale } = useLang(mapId);
  const { initPrint } = useMapPrint(mapId);

  const [print, setPrint] = useState<PrintAdvancedUiState>({
    show: false,
    loading: false,
    setting_show: false,
    setting: {
      ratio: 1,
      orientation: 'portrait',
      format: 'png',
      paper: 'custom',
      dpi: 96,
      watermark: '',
    },
  });

  const controlRef = useRef<{ sync: () => void } | null>(null);
  const sessionRef = useRef<PrintAdvancedSession | null>(null);
  const callMapRef = useRef(callMap);
  callMapRef.current = callMap;
  const disabledCrosshairRef = useRef(disabledCrosshair);
  const disabledPrintableAreaRef = useRef(disabledPrintableArea);
  const fileNameRef = useRef(fileName);
  disabledCrosshairRef.current = disabledCrosshair;
  disabledPrintableAreaRef.current = disabledPrintableArea;
  fileNameRef.current = fileName;

  if (!sessionRef.current) {
    sessionRef.current = createPrintAdvancedSession({
      callMap: (fn) => callMapRef.current(fn),
      saveFile: (dataUrl, name) => saveAs(dataUrl, name),
      getDisabledCrosshair: () => disabledCrosshairRef.current,
      getDisabledPrintableArea: () => disabledPrintableAreaRef.current,
      getFileName: () => fileNameRef.current,
      onStateChange: (next) => {
        setPrint(next);
        controlRef.current?.sync();
      },
    });
  }
  const session = sessionRef.current;

  useEffect(() => {
    registerLocale('en', PRINT_CONTROL_LOCALE);
  }, [registerLocale]);

  useEffect(() => {
    return () => {
      session.destroy();
    };
  }, [session]);

  function onInit() {
    initPrint(session.getStoreHandlers());
  }

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
            visible: !session.getState().show,
            title: trans('map.print.title'),
            icon: mdiIcon(mdiPrinterEye),
          }),
          onClick: () => session.show(session.getState().setting),
        },
        {
          id: 'mapPrintSave',
          getState: () => ({
            visible: session.getState().show,
            title: trans('map.print.actions.save'),
            icon: mdiIcon(mdiContentSaveOutline),
            loading: session.getState().loading,
          }),
          onClick: () => session.save(),
        },
        {
          id: 'mapPrintClose',
          getState: () => ({
            visible: session.getState().show,
            title: trans('map.print.actions.clear'),
            icon: mdiIcon(mdiClose),
            loading: session.getState().loading,
          }),
          onClick: () => session.close(),
        },
        {
          id: 'mapPrintSetting',
          getState: () => ({
            visible: true,
            active: session.getState().setting_show,
            title: trans('map.print.actions.setting'),
            icon: mdiIcon(mdiCogOutline),
            loading: session.getState().loading,
          }),
          onClick: () => session.toggleSetting(),
        },
      ],
    }),
    [order, trans, session],
  );

  const { state, control } = useToolbarControl(mapId, merged, toolbarConfig);
  controlRef.current = control;

  const registerActions = useMemo(
    () => [
      {
        type: 'mapPrintShow',
        run: () => session.show(session.getState().setting),
      },
      {
        type: 'mapPrintSave',
        run: () => session.save(),
      },
      {
        type: 'mapPrintClose',
        run: () => session.close(),
      },
      {
        type: 'mapPrintSetting',
        run: () => session.toggleSetting(),
      },
    ],
    [session],
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
            onUpdateShow={(v) => session.setSettingShow(!!v)}
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
                    session.applyPaper(
                      String(value) as NonNullable<PrintOption['paper']>,
                    );
                  }}
                />
              </div>
              <div>
                <InputText
                  label={trans('map.print.field.ratio')}
                  value={String(print.setting.ratio)}
                  onChange={(value) =>
                    session.updateSetting({
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
                    session.updateSetting({
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
                    session.updateSetting({
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
                    session.updateSetting({
                      ...print.setting,
                      watermark: value,
                    })
                  }
                />
                {print.setting.watermark ? (
                  <div
                    className="map-print-watermark-preview"
                    aria-hidden="true"
                  >
                    {print.setting.watermark}
                  </div>
                ) : null}
              </div>
              <div className="map-print-advanced-setting__grow" />
              {print.show ? (
                <MapControlButton
                  variant="filled"
                  className="map-print-advanced-setting__apply"
                  onClick={() => void session.save()}
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
