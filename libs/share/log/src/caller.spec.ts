import { describe, expect, it } from 'vitest';

import { captureLogCallerSite } from './caller';

describe('captureLogCallerSite', () => {
  it('returns shortened file:line and fn from a V8 stack', () => {
    const stack = [
      'Error',
      '    at Logger.log (G:/code/libs/share/log/src/Logger.ts:120:10)',
      '    at Logger.debug (G:/code/libs/share/log/src/Logger.ts:124:10)',
      '    at registerLocale (G:/code/libs/vue/map-core/src/extra/lang/store.ts:34:42)',
    ].join('\n');
    expect(captureLogCallerSite(stack)).toEqual({
      file: 'extra/lang/store.ts:34',
      fn: 'registerLocale',
    });
  });

  it('skips node_modules and vite frames', () => {
    const stack = [
      'Error',
      '    at Logger.log (/proj/libs/share/log/src/Logger.ts:1:1)',
      '    at Object.fn (/proj/node_modules/vitest/dist/index.js:1:1)',
      '    at run (/proj/apps/demo/src/boot.ts:9:3)',
    ].join('\n');
    expect(captureLogCallerSite(stack)).toEqual({
      file: 'demo/src/boot.ts:9',
      fn: 'run',
    });
  });
});
