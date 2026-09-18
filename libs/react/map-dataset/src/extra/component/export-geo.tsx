import { errorHandler, MapError } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  createGeoExportController,
  GEO_EXPORT_COMPONENT_KEY,
  GEO_EXPORT_DEFAULT_CRS,
  GEO_EXPORT_FORMAT_META,
  GEO_EXPORT_FORMATS,
  resolveGeoExportCrs,
  resolveGeoExportUiSlot,
  type ExportGeoGetCollection,
  type GeoExportController,
  type GeoExportFormat,
  type GeoExportHandler,
  type GeoExportScope,
} from '@hungpvq/map-dataset/geo-export';
import { DraggableModal } from '@hungpvq/react-draggable';
import {
  ModuleContainer,
  RegistryItem,
  useMap,
  useShow,
} from '@hungpvq/react-map-core';
import type { ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ExportGeoForm } from './export-geo-form';

export type ExportGeoProps = {
  layer: IDataset;
  mapId?: string;
  formats?: GeoExportFormat[];
  filename?: string | ((layer: IDataset) => string);
  getCollection?: ExportGeoGetCollection;
  sourceCrs?: string | null;
  targetCrs?: string | null;
  scopes?: GeoExportScope[];
  defaultScope?: GeoExportScope;
  /**
   * Export runner. Named `exportHandler` (not `onExport`) so Vue `$attrs`
   * does not treat it as a fallthrough `export` event listener.
   * Dataset-part / menu options still use `onExport`.
   */
  exportHandler?: GeoExportHandler;
  /** Local form override: Registry key or React component (like AT cellComponent). */
  formComponent?: unknown;
  /** Local loading override: Registry key or React component. */
  loadingComponent?: unknown;
  onClose?: () => void;
};

function buildController(
  layer: IDataset,
  props: ExportGeoProps,
): GeoExportController {
  const formats = props.formats?.length
    ? props.formats
    : [...GEO_EXPORT_FORMATS];
  const scopes = props.scopes?.length
    ? props.scopes
    : (['all'] as GeoExportScope[]);
  return createGeoExportController(layer, {
    mapId: props.mapId,
    formats,
    filename: props.filename,
    getCollection: props.getCollection,
    sourceCrs: props.sourceCrs ?? GEO_EXPORT_DEFAULT_CRS,
    targetCrs: props.targetCrs ?? GEO_EXPORT_DEFAULT_CRS,
    scopes,
    defaultScope: props.defaultScope,
    onExport: props.exportHandler,
    formComponent: props.formComponent,
    loadingComponent: props.loadingComponent,
  });
}

export function ExportGeo(props: ExportGeoProps) {
  const { moduleContainerProps } = useMap({ mapId: props.mapId });
  const [show, toggleShow] = useShow(true);
  const formats = useMemo(
    () =>
      props.formats?.length ? props.formats : [...GEO_EXPORT_FORMATS],
    [props.formats],
  );
  const scopes = useMemo(
    () =>
      props.scopes?.length
        ? props.scopes
        : (['all'] as GeoExportScope[]),
    [props.scopes],
  );

  /**
   * Create + dispose inside an effect so React StrictMode cleanup does not
   * permanently dispose a useMemo instance that survives remount.
   */
  const [controller, setController] = useState(() =>
    buildController(props.layer, props),
  );
  const [, setTick] = useState(0);

  useEffect(() => {
    const c = buildController(props.layer, props);
    setController((prev) => {
      if (prev !== c) prev.dispose();
      return c;
    });
    const unsub = c.subscribe(() => setTick((v) => v + 1));
    return () => {
      unsub();
      c.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recreate on layer/options identity
  }, [
    props.layer,
    props.mapId,
    props.exportHandler,
    props.getCollection,
    props.formComponent,
    props.loadingComponent,
    props.formats,
    props.filename,
    props.sourceCrs,
    props.targetCrs,
    props.scopes,
    props.defaultScope,
  ]);

  useEffect(() => {
    toggleShow(true);
    // Only re-open when the bound layer changes (not when toggleShow identity changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.layer]);

  const busy = controller.getState().busy;
  const error = controller.getState().error;

  const [format, setFormat] = useState<GeoExportFormat>(
    formats[0] ?? 'geojson',
  );
  const [scope, setScope] = useState<GeoExportScope>(
    props.defaultScope ?? controller.suggestDefaultScope(props.mapId) ?? 'all',
  );
  const [filename, setFilename] = useState(controller.resolveFilename());
  const [target, setTarget] = useState(
    () =>
      resolveGeoExportCrs({
        sourceCrs: props.sourceCrs ?? GEO_EXPORT_DEFAULT_CRS,
        targetCrs: props.targetCrs ?? GEO_EXPORT_DEFAULT_CRS,
      }).targetCrs,
  );

  const resolvedSource = useMemo(
    () =>
      resolveGeoExportCrs({
        sourceCrs: props.sourceCrs ?? GEO_EXPORT_DEFAULT_CRS,
        targetCrs: target,
      }).sourceCrs,
    [props.sourceCrs, target],
  );

  const formatItems = useMemo(
    () =>
      formats.map((value) => ({
        value,
        text: GEO_EXPORT_FORMAT_META[value].name,
      })),
    [formats],
  );

  const scopeItems = useMemo(() => {
    const labels: Record<GeoExportScope, string> = {
      all: 'All features',
      filtered: 'Filtered (search / sort)',
      selected: 'Selected rows',
    };
    return scopes.map((value) => ({ value, text: labels[value] }));
  }, [scopes]);


  const formSlot = useMemo(() => {
    const opts = controller.getOptions();
    const slot = resolveGeoExportUiSlot(
      props.formComponent ?? opts.formComponent,
      GEO_EXPORT_COMPONENT_KEY.form,
      ExportGeoForm,
    );
    return {
      componentKey: slot.componentKey,
      defaultComponent: slot.defaultComponent as
        | ComponentType<Record<string, unknown>>
        | undefined,
    };
  }, [controller, props.formComponent]);

  const loadingComponent =
    props.loadingComponent ?? controller.getOptions().loadingComponent;

  const showScope = scopeItems.length > 1;
  const title = `Export · ${props.layer.getName?.() || props.layer.id || 'layer'}`;
  const sourceHint = `Data CRS: EPSG:${resolvedSource} (unchanged when target matches)`;

  function handleClose() {
    toggleShow(false);
    props.onClose?.();
  }

  async function onDownload() {
    if (!controller.canExport()) return;
    try {
      const ok = await controller.run({
        format,
        scope,
        filename,
        sourceCrs: resolvedSource,
        targetCrs: target,
        mapId: props.mapId,
      });
      if (ok) handleClose();
    } catch (err) {
      errorHandler.handle(
        new MapError('Geo export failed', 'DATASET_EXPORT_ERROR', {
          recoverable: true,
          cause: err,
          context: { format, layerId: props.layer.id },
        }),
      );
    }
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={({ containerId }) => (
        <DraggableModal
          show={show}
          title={title}
          containerId={containerId}
          width={420}
          height={showScope ? 460 : 420}
          resizable={false}
          onUpdateShow={toggleShow}
          onClose={handleClose}
        >
          <RegistryItem
            componentKey={formSlot.componentKey}
            defaultComponent={formSlot.defaultComponent}
            mapId={props.mapId}
            format={format}
            formatItems={formatItems}
            scope={scope}
            scopeItems={scopeItems}
            showScope={showScope}
            filename={filename}
            target={target}
            sourceHint={sourceHint}
            error={error}
            busy={busy}
            loadingComponent={loadingComponent}
            onFormatChange={(v: string) => setFormat(v as GeoExportFormat)}
            onScopeChange={(v: string) => setScope(v as GeoExportScope)}
            onFilenameChange={setFilename}
            onTargetChange={setTarget}
            onCancel={handleClose}
            onDownload={() => void onDownload()}
          />
        </DraggableModal>
      )}
    />
  );
}
