/**
 * Capture the first useful call-site from a stack string.
 * Skips Logger / shared-log frames and common tooling noise.
 */

export type LogCallerSite = {
  /** Shortened `file:line` */
  file?: string;
  /** Function / method name from the stack frame, when available */
  fn?: string;
};

export function captureLogCallerSite(
  stack = new Error().stack ?? '',
): LogCallerSite {
  const lines = stack.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('Error')) continue;
    if (
      /Logger\.|captureLogCallerSite|buildRecord|LoggerFactory|ConsoleAdapter|logHelper|shared-log[/\\]src/.test(
        line,
      )
    ) {
      continue;
    }
    if (/\bLogger\.(log|debug|info|warn|error)\b/.test(line)) continue;

    // at fn (path:line:col) | at path:line:col | fn@path:line:col
    const withFn =
      line.match(/at\s+(?:async\s+)?(\S+?)\s+\((.+?):(\d+):\d+\)/) ||
      line.match(/([^@\s]+)@(.+?):(\d+):\d+/);
    const pathOnly =
      line.match(/at\s+(.+?):(\d+):\d+/) || line.match(/\((.+?):(\d+):\d+\)/);

    let fnName: string | undefined;
    let rawPath: string | undefined;
    let lineNo: string | undefined;

    if (withFn) {
      fnName = cleanFnName(withFn[1]!);
      rawPath = withFn[2]!;
      lineNo = withFn[3]!;
    } else if (pathOnly) {
      rawPath = pathOnly[1]!;
      lineNo = pathOnly[2]!;
    } else {
      continue;
    }

    if (
      /node:internal|node_modules|\/vite\/|@vite\b|dep-|[/\\]vitest[/\\]|[/\\]runner[/\\]dist[/\\]/.test(
        rawPath,
      )
    ) {
      continue;
    }

    return {
      file: `${shortenCallerPath(rawPath)}:${lineNo}`,
      ...(fnName ? { fn: fnName } : {}),
    };
  }
  return {};
}

function cleanFnName(raw: string): string | undefined {
  let name = raw.trim();
  if (
    !name ||
    name === 'Object' ||
    name === 'anonymous' ||
    name === '<anonymous>'
  ) {
    return undefined;
  }
  // Object.foo / Module.foo / Proxy.foo → foo (keep nested Foo.bar)
  name = name.replace(/^(?:Object|Module|Proxy)\./, '');
  if (!name || name === '<anonymous>') return undefined;
  return name;
}

function shortenCallerPath(path: string): string {
  let p = path.replace(/\?.*$/, '');
  p = p.replace(/^file:\/\/\/?/i, '');
  p = p.replace(/^https?:\/\/[^/]+/i, '');
  p = p.replace(/\\/g, '/');
  const parts = p.split('/').filter(Boolean);
  if (parts.length <= 3) return parts.join('/');
  return parts.slice(-3).join('/');
}
