declare module '@mapbox/mapbox-gl-sync-move' {
  const syncMove: (maps: any[]) => () => void;
  export default syncMove;
}
