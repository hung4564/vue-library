import { MapControlButton } from '@hungpvq/react-map-core';
import { ToggleShow } from '@hungpvq/react-map-dataset';
import { type WithLayerItemActionType } from '@hungpvq/map-dataset/menu';

/** Per-layer ToggleShow: reuse logic wrapper, only customize the button UI. */
export function SampleLayerToggleShow(props: WithLayerItemActionType) {
  return (
    <ToggleShow
      {...props}
      renderButton={({ show, disabled, title, onToggle }) => (
        <MapControlButton variant="plain"
          disabled={disabled}
          title={title}
          active={show}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          <input
            type="checkbox"
            checked={show}
            disabled={disabled}
            tabIndex={-1}
            readOnly
            onClick={(event) => event.preventDefault()}
            style={{ pointerEvents: 'none', margin: 0, cursor: 'inherit' }}
          />
        </MapControlButton>
      )}
    />
  );
}
