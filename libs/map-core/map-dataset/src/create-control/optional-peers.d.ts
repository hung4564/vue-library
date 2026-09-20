/** Ambient types for optional CreateControl GIS peers (when the package is not installed). */
declare module 'gdal3.js' {
  // Runtime is loaded via classic <script> / CDN — see filegdb-parse.ts.
  // Keep a minimal stub so `import('gdal3.js')` type-checks if referenced elsewhere.
  const initGdalJs: (config?: unknown) => Promise<unknown>;
  export default initGdalJs;
}
