# vue-demo-map-e2e

Playwright smoke for [`vue-demo-map`](../demo-map).

```bash
npx nx e2e vue-demo-map-e2e
# or
npm run map:e2e
```

Starts Vite on port `4200`. Specs:

| Spec | Route | Checks |
| --- | --- | --- |
| `minimal.spec.ts` | `/#/minimal/` | `.map-container` + MapLibre canvas |
| `layer-identify.spec.ts` | `/#/dataset-identify/` | LayerControl panel + Identify toolbar btn |
| `create-control.spec.ts` | `/#/minimal/` | Open CreateControl, paste raw GeoJSON, new layer row |
| `theme-basemap.spec.ts` | `/#/all-map-view/` | Map canvas + `map-theme-*` class applied |
