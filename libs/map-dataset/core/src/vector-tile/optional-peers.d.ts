/**
 * Ambient stubs for optional vector-tile peers when packages are not installed.
 * Runtime loaders in archives.ts use string-spec `import()` so consumers that
 * typecheck through map-dataset source do not need these modules / @types.
 */
declare module 'sql.js' {
  type SqlJsStatic = {
    Database: new (data?: ArrayLike<number>) => {
      exec: (sql: string) => { values?: unknown[][] }[];
      close?: () => void;
    };
  };
  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}

declare module 'pmtiles' {
  export class FileSource {
    constructor(file: File);
  }
  export class PMTiles {
    constructor(source: string | FileSource);
    getHeader(): Promise<Record<string, number>>;
    getMetadata(): Promise<unknown>;
    getZxy(
      z: number,
      x: number,
      y: number,
    ): Promise<{ data?: ArrayBuffer | Uint8Array } | undefined>;
  }
}
