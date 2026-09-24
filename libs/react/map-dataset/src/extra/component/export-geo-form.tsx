import {
  GEO_EXPORT_COMPONENT_KEY,
  resolveGeoExportUiSlot,
} from '@hungpvq/map-dataset/geo-export';
import { MapControlButton, RegistryItem } from '@hungpvq/react-map-core';
import {
  InputCrs,
  InputSelect,
  InputText,
} from '@hungpvq/react-map-core/fields';
import type { ComponentType } from 'react';
import { useMemo } from 'react';

import { ExportGeoLoading } from './export-geo-loading';

export type ExportGeoFormProps = {
  format: string;
  formatItems: { value: string; text: string }[];
  scope: string;
  scopeItems: { value: string; text: string }[];
  showScope: boolean;
  filename: string;
  target: string;
  sourceHint: string;
  error: string;
  busy: boolean;
  mapId?: string;
  onFormatChange: (value: string) => void;
  onScopeChange: (value: string) => void;
  onFilenameChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onCancel: () => void;
  onDownload: () => void;
  /** Local loading override: Registry key or React component. */
  loadingComponent?: unknown;
};

export function ExportGeoForm(props: ExportGeoFormProps) {
  const loadingSlot = useMemo(() => {
    const slot = resolveGeoExportUiSlot(
      props.loadingComponent,
      GEO_EXPORT_COMPONENT_KEY.loading,
      ExportGeoLoading,
    );
    return {
      componentKey: slot.componentKey,
      defaultComponent: slot.defaultComponent as
        ComponentType<Record<string, never>> | undefined,
    };
  }, [props.loadingComponent]);

  return (
    <div className="export-geo">
      <InputText
        label="Filename"
        value={props.filename}
        disabled={props.busy}
        onChange={props.onFilenameChange}
      />
      {props.showScope ? (
        <InputSelect
          label="Data scope"
          items={props.scopeItems}
          itemValue="value"
          itemText="text"
          value={props.scope}
          disabled={props.busy}
          onChange={(value) => props.onScopeChange(String(value ?? 'all'))}
        />
      ) : null}
      <InputSelect
        label="File format"
        items={props.formatItems}
        itemValue="value"
        itemText="text"
        value={props.format}
        disabled={props.busy}
        onChange={(value) => props.onFormatChange(String(value ?? 'geojson'))}
      />
      <InputCrs
        mapId={props.mapId}
        label="Coordinate reference system"
        placeholder="Search or enter EPSG code"
        value={props.target}
        onChange={props.onTargetChange}
      />
      <p className="export-geo__hint">{props.sourceHint}</p>
      {props.busy ? (
        <RegistryItem
          componentKey={loadingSlot.componentKey}
          defaultComponent={loadingSlot.defaultComponent}
        />
      ) : null}
      {props.error ? (
        <p className="export-geo__error" role="alert">
          {props.error}
        </p>
      ) : null}
      <div className="export-geo__actions">
        <MapControlButton
          variant="outlined"
          size="medium"
          disabled={props.busy}
          onClick={props.onCancel}
        >
          Cancel
        </MapControlButton>
        <MapControlButton
          variant="filled"
          size="medium"
          disabled={props.busy}
          loading={props.busy}
          onClick={props.onDownload}
        >
          {props.busy ? 'Exporting…' : 'Download'}
        </MapControlButton>
      </div>
      <style>{`
        .export-geo {
          box-sizing: border-box;
          height: 100%;
          padding: var(--map-space-lg, 16px);
          display: flex;
          flex-direction: column;
          gap: var(--map-space-md, 8px);
        }
        .export-geo__hint {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.75;
        }
        .export-geo__error {
          margin: 0;
          font-size: 0.85rem;
          color: var(--map-danger-color, #c0392b);
        }
        .export-geo__actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--map-space-sm, 4px);
          justify-content: flex-end;
          margin-top: auto;
        }
      `}</style>
    </div>
  );
}
