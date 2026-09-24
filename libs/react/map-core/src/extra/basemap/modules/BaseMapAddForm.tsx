import {
  type BaseMapItem,
  type BasemapSourceType,
  createCustomBasemapItem,
  validateBasemapSource,
} from '@hungpvq/map-core/basemap';
import { useCallback, useMemo, useState } from 'react';

import { MapControlButton } from '../../../components/MapControlButton';
import { InputSelect, InputText } from '../../../field';
import { useMap } from '../../../hooks/useMap';
import { useLang } from '../../lang/hook';

export interface BaseMapAddFormProps {
  mapId: string;
  thumbnail?: string;
  /** Show the in-form heading (hide when the host popup already titles the panel). */
  showHeading?: boolean;
  onAdded: (item: BaseMapItem) => void;
  onCancel: () => void;
}

export function BaseMapAddForm({
  mapId,
  thumbnail = '',
  showHeading = true,
  onAdded,
  onCancel,
}: BaseMapAddFormProps) {
  const { mapId: resolvedMapId } = useMap({ mapId });
  const { trans } = useLang(resolvedMapId);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<BasemapSourceType>('raster');
  const [checking, setChecking] = useState(false);
  const [checkOk, setCheckOk] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const typeItems = useMemo(
    () => [
      { value: 'raster' as const, text: trans('map.basemap.add-type-raster') },
      { value: 'vector' as const, text: trans('map.basemap.add-type-vector') },
    ],
    [trans],
  );

  const urlHint =
    type === 'vector'
      ? trans('map.basemap.add-url-hint-vector')
      : trans('map.basemap.add-url-hint-raster');

  const canCheck = title.trim().length > 0 && url.trim().length > 0;

  const invalidateCheck = useCallback(() => {
    setCheckOk(null);
    setStatusMessage('');
  }, []);

  const onCheck = useCallback(async () => {
    if (!canCheck || checking) return;
    setChecking(true);
    setStatusMessage('');
    setCheckOk(null);
    try {
      const result = await validateBasemapSource({ type, url });
      if (result.ok) {
        setCheckOk(true);
        setStatusMessage(trans('map.basemap.add-check-ok'));
      } else {
        setCheckOk(false);
        setStatusMessage(result.message || trans('map.basemap.add-check-fail'));
      }
    } finally {
      setChecking(false);
    }
  }, [canCheck, checking, type, url, trans]);

  const onSubmit = useCallback(() => {
    if (!checkOk) return;
    const item = createCustomBasemapItem({
      title,
      type,
      url,
      thumbnail,
    });
    onAdded(item);
  }, [checkOk, title, type, url, thumbnail, onAdded]);

  return (
    <div className="base-map-add-form" onClick={(e) => e.stopPropagation()}>
      <div className="base-map-add-form__body">
        {showHeading ? (
          <div className="base-map-add-form__title">
            {trans('map.basemap.add')}
          </div>
        ) : null}
        <InputText
          label={trans('map.basemap.add-title')}
          value={title}
          onChange={(v) => {
            setTitle(v);
            invalidateCheck();
          }}
        />
        <InputSelect
          label={trans('map.basemap.add-type')}
          value={type}
          items={typeItems}
          itemValue="value"
          itemText="text"
          onChange={(v) => {
            setType(String(v) as BasemapSourceType);
            invalidateCheck();
          }}
        />
        <InputText
          label={trans('map.basemap.add-url')}
          value={url}
          placeholder={urlHint}
          onChange={(v) => {
            setUrl(v);
            invalidateCheck();
          }}
        />
        {statusMessage ? (
          <div
            className={`base-map-add-form__status${
              checkOk === true
                ? ' base-map-add-form__status--ok'
                : checkOk === false
                  ? ' base-map-add-form__status--err'
                  : ''
            }`}
          >
            {statusMessage}
          </div>
        ) : null}
      </div>
      <div className="base-map-add-form__actions">
        <MapControlButton
          variant="text"
          size="small"
          disabled={checking || !canCheck}
          onClick={onCheck}
        >
          {checking
            ? trans('map.basemap.add-checking')
            : trans('map.basemap.add-check')}
        </MapControlButton>
        <MapControlButton
          variant="text"
          size="small"
          disabled={!checkOk || checking}
          onClick={onSubmit}
        >
          {trans('map.basemap.add-submit')}
        </MapControlButton>
        <MapControlButton variant="text" size="small" onClick={onCancel}>
          {trans('map.basemap.add-cancel')}
        </MapControlButton>
      </div>
    </div>
  );
}
