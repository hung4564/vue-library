/**
 * @turf/*@6 ships typings but omits them from package.json "exports".
 * With TypeScript moduleResolution "bundler" that yields TS7016.
 * Ambient modules silence that resolution gap (imports type as any).
 */
declare module '@turf/turf';
declare module '@turf/*';
