import type { MapSimple } from '@hungpvq/map-core';
import {
  Popup,
  type LayerSpecification,
  type MapMouseEvent,
  type MapSourceDataEvent,
  type PointLike,
  type QueryRenderedFeaturesOptions,
  type StyleSpecification,
} from 'maplibre-gl';
import { brightColor } from './colors';
import {
  getSourcesFromMap,
  isInspectStyle,
  markInspectStyle,
  cloneStyleSpecification,
  type InspectStyleSpecification,
} from './inspect';
import { renderPopup as defaultRenderPopup } from './renderPopup';
import { generateColoredLayers, generateInspectStyle } from './stylegen';

function sourcesEqual(
  a: Record<string, string[]>,
  b: Record<string, string[]>,
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    const av = a[key];
    const bv = b[key];
    if (!bv || av.length !== bv.length) return false;
    for (let i = 0; i < av.length; i++) {
      if (av[i] !== bv[i]) return false;
    }
  }
  return true;
}

/** Build MapLibre screen bbox: top-left → bottom-right (see MapLibre docs). */
export function buildInspectQueryBox(
  point: { x: number; y: number },
  selectThreshold: number,
): PointLike | [PointLike, PointLike] {
  if (selectThreshold === 0) {
    return [point.x, point.y];
  }
  return [
    [point.x - selectThreshold, point.y - selectThreshold],
    [point.x + selectThreshold, point.y + selectThreshold],
  ];
}

/**
 * Options for {@link InspectController} — mirrors maplibre-gl-inspect.
 */
export type InspectControllerOptions = {
  showInspectMap?: boolean;
  showMapPopup?: boolean;
  showMapPopupOnHover?: boolean;
  showInspectMapPopup?: boolean;
  showInspectMapPopupOnHover?: boolean;
  blockHoverPopupOnClick?: boolean;
  backgroundColor?: string;
  assignLayerColor?: (layerId: string, alpha: number) => string;
  buildInspectStyle?: (
    originalMapStyle: StyleSpecification,
    coloredLayers: LayerSpecification[],
    opts: { backgroundColor?: string },
  ) => StyleSpecification;
  renderPopup?: (
    features: Parameters<typeof defaultRenderPopup>[0],
  ) => string | HTMLElement;
  popup?: Popup;
  selectThreshold?: number;
  useInspectStyle?: boolean;
  queryParameters?: QueryRenderedFeaturesOptions;
  sources?: Record<string, string[]>;
  /** Called whenever inspect mode toggles (for UI sync). */
  onToggle?: (showInspectMap: boolean) => void;
};

type ResolvedInspectOptions = Required<
  Omit<InspectControllerOptions, 'popup' | 'sources' | 'onToggle'>
> & {
  popup: Popup;
  sources: Record<string, string[]>;
  onToggle: (showInspectMap: boolean) => void;
};

/**
 * Framework-agnostic inspect logic shared by Vue and React InspectControl.
 * Pointer events (click / mousemove) are wired by adapters via EventClick /
 * EventMouseMove + useEventMap — call {@link handlePointerEvent}.
 */
export class InspectController {
  options: ResolvedInspectOptions;
  sources: Record<string, string[]>;
  private _popup: Popup;
  private _popupBlocked = false;
  private _showInspectMap: boolean;
  private _originalStyle: StyleSpecification | undefined;
  private _map: MapSimple | undefined;
  private _renderTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(options: InspectControllerOptions = {}) {
    const popup =
      options.popup ??
      new Popup({
        closeButton: false,
        closeOnClick: false,
      });

    this.options = {
      showInspectMap: options.showInspectMap ?? false,
      showInspectMapPopup: options.showInspectMapPopup ?? true,
      showMapPopup: options.showMapPopup ?? false,
      showMapPopupOnHover: options.showMapPopupOnHover ?? true,
      // Click-to-inspect by default (hover opt-in)
      showInspectMapPopupOnHover: options.showInspectMapPopupOnHover ?? false,
      blockHoverPopupOnClick: options.blockHoverPopupOnClick ?? false,
      backgroundColor: options.backgroundColor ?? '#fff',
      assignLayerColor: options.assignLayerColor ?? brightColor,
      buildInspectStyle: options.buildInspectStyle ?? generateInspectStyle,
      renderPopup: options.renderPopup ?? defaultRenderPopup,
      popup,
      selectThreshold: options.selectThreshold ?? 5,
      useInspectStyle: options.useInspectStyle ?? true,
      queryParameters: options.queryParameters ?? {},
      sources: options.sources ?? {},
      onToggle: options.onToggle ?? (() => undefined),
    };

    this.sources = { ...this.options.sources };
    this._popup = this.options.popup;
    this._showInspectMap = this.options.showInspectMap;
  }

  get showInspectMap(): boolean {
    return this._showInspectMap;
  }

  /** Whether adapters should register EventClick via useEventMap. */
  needsClickEvent(): boolean {
    if (this._showInspectMap) return this.options.showInspectMapPopup;
    return this.options.showMapPopup;
  }

  /** Whether adapters should register EventMouseMove via useEventMap. */
  needsHoverEvent(): boolean {
    if (this._showInspectMap) {
      return (
        this.options.showInspectMapPopup &&
        this.options.showInspectMapPopupOnHover
      );
    }
    return this.options.showMapPopup && this.options.showMapPopupOnHover;
  }

  attach(map: MapSimple): void {
    this._map = map;

    if (Object.keys(this.sources).length === 0) {
      map.on('sourcedata', this._onSourceChange);
    }
    map.on('styledata', this._onStyleChange);
    map.on('load', this._onStyleChange);

    // Capture original style if map already loaded
    this._onStyleChange();
  }

  detach(): void {
    const map = this._map;
    if (!map) return;

    if (this._renderTimer) {
      clearTimeout(this._renderTimer);
      this._renderTimer = undefined;
    }

    map.off('styledata', this._onStyleChange);
    map.off('load', this._onStyleChange);
    map.off('sourcedata', this._onSourceChange);

    this._popup.remove();
    this._showInspectMap = false;
    this.render();
    this._map = undefined;
  }

  toggle(): void {
    this._showInspectMap = !this._showInspectMap;
    this._popupBlocked = false;
    this.options.onToggle(this._showInspectMap);

    void (async () => {
      if (this._showInspectMap && this._map) {
        this.sources = await getSourcesFromMap(this._map);
      } else {
        this._popup.remove();
      }
      this.render();
    })();
  }

  setShowInspectMap(show: boolean): void {
    if (this._showInspectMap === show) return;
    this._showInspectMap = show;
    this._popupBlocked = false;
    this.options.onToggle(this._showInspectMap);
    void (async () => {
      if (this._showInspectMap && this._map) {
        this.sources = await getSourcesFromMap(this._map);
      } else {
        this._popup.remove();
      }
      this.render();
    })();
  }

  render(): void {
    const map = this._map;
    if (!map) return;

    if (this._showInspectMap) {
      if (this.options.useInspectStyle) {
        map.setStyle(markInspectStyle(this._inspectStyle()));
      }
    } else if (this._originalStyle) {
      if (this.options.useInspectStyle) {
        map.setStyle(this._originalStyle);
      }
    }
  }

  /** Adapter entry: wire EventClick / EventMouseMove handlers here. */
  handlePointerEvent = (e: MapMouseEvent): void => {
    if (this._showInspectMap) {
      if (!this.options.showInspectMapPopup) return;
      if (e.type === 'mousemove' && !this.options.showInspectMapPopupOnHover)
        return;
      if (
        e.type === 'click' &&
        this.options.showInspectMapPopupOnHover &&
        this.options.blockHoverPopupOnClick
      ) {
        this._popupBlocked = !this._popupBlocked;
      }
    } else {
      if (!this.options.showMapPopup) return;
      if (e.type === 'mousemove' && !this.options.showMapPopupOnHover) return;
      if (
        e.type === 'click' &&
        this.options.showMapPopupOnHover &&
        this.options.blockHoverPopupOnClick
      ) {
        this._popupBlocked = !this._popupBlocked;
      }
    }

    if (this._popupBlocked || !this._popup || !this._map) return;

    const queryBox = buildInspectQueryBox(
      e.point,
      this.options.selectThreshold,
    );
    const features =
      this._map.queryRenderedFeatures(queryBox, this.options.queryParameters) ||
      [];
    this._map.getCanvas().style.cursor = features.length ? 'pointer' : '';

    if (!features.length) {
      this._popup.remove();
      return;
    }

    this._popup.setLngLat(e.lngLat);
    const renderedPopup = this.options.renderPopup(features);
    if (typeof renderedPopup === 'string') {
      this._popup.setHTML(renderedPopup);
    } else {
      this._popup.setDOMContent(renderedPopup);
    }
    this._popup.addTo(this._map);
  };

  handleRightClick = (): void => {
    if (
      !this.options.showMapPopupOnHover &&
      !this.options.showInspectMapPopupOnHover &&
      !this.options.blockHoverPopupOnClick
    ) {
      this._popup.remove();
    }
  };

  private _inspectStyle(): StyleSpecification {
    const map = this._map!;
    const coloredLayers = generateColoredLayers(
      this.sources,
      this.options.assignLayerColor,
    );
    return this.options.buildInspectStyle(map.getStyle(), coloredLayers, {
      backgroundColor: this.options.backgroundColor,
    });
  }

  private _onSourceChange = async (e: MapSourceDataEvent) => {
    if (!this._map) return;
    if (e.sourceDataType === 'visibility' || !e.isSourceLoaded) {
      return;
    }
    const previousSources = { ...this.sources };
    this.sources = await getSourcesFromMap(this._map);

    if (
      !sourcesEqual(previousSources, this.sources) &&
      Object.keys(this.sources).length > 0
    ) {
      if (this._renderTimer) clearTimeout(this._renderTimer);
      this._renderTimer = setTimeout(() => this.render(), 1000);
    }
  };

  private _onStyleChange = () => {
    if (!this._map) return;
    const style = this._map.getStyle();
    if (!isInspectStyle(style as InspectStyleSpecification)) {
      try {
        // Prefer JSON over structuredClone: getStyle() can include
        // non-cloneable values (DataCloneError on Window.structuredClone).
        this._originalStyle = cloneStyleSpecification(style);
      } catch {
        // Keep last good snapshot; avoid throwing on every styledata event.
      }
    }
  };
}
