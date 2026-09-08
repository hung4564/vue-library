import type { DrawCustomMode } from '@mapbox/mapbox-gl-draw';

/**
 * Idle mode: features stay visible, no edit interactions
 * (mapbox-gl-draw custom mode).
 */
const StaticMode: DrawCustomMode = {
  onSetup() {
    this.setActionableState({
      trash: false,
      combineFeatures: false,
      uncombineFeatures: false,
    });
    return {};
  },

  toDisplayFeatures(_state, geojson, display) {
    display(geojson);
  },
};

export default StaticMode;
