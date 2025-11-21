import type { DrawCustomMode } from '@mapbox/mapbox-gl-draw';

const StaticMode: DrawCustomMode = {
  onSetup() {
    // disable tất cả actions
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
