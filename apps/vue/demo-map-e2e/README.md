# vue-demo-map-e2e

Playwright smoke for [`vue-demo-map`](../demo-map).

```bash
npx nx e2e vue-demo-map-e2e
# or
npm run map:e2e
```

Starts Vite on port `4200` and asserts `/demo-map/vue/#/minimal/` renders `.map-container` + MapLibre canvas.
