/**
 * Validate a custom basemap source URL (format + live probe).
 */

export type BasemapSourceType = 'raster' | 'vector';

export type BasemapSourceValidationOk = { ok: true };

export type BasemapSourceValidationFail = {
  ok: false;
  code:
    | 'empty'
    | 'invalid-url'
    | 'invalid-template'
    | 'probe-failed'
    | 'invalid-style';
  message: string;
};

export type BasemapSourceValidationResult =
  BasemapSourceValidationOk | BasemapSourceValidationFail;

export type ValidateBasemapSourceInput = {
  type: BasemapSourceType;
  url: string;
};

const ABSOLUTE_HTTP = /^https?:\/\//i;

export function isAbsoluteHttpUrl(url: string): boolean {
  if (!ABSOLUTE_HTTP.test(url.trim())) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Raster tile templates must include {z} and both {x} and {y} (any order). */
export function isValidRasterTileTemplate(url: string): boolean {
  const u = url.trim();
  if (!isAbsoluteHttpUrl(u)) return false;
  return u.includes('{z}') && u.includes('{x}') && u.includes('{y}');
}

export function buildSampleRasterTileUrl(template: string): string {
  return template
    .trim()
    .replace(/\{z\}/g, '1')
    .replace(/\{x\}/g, '0')
    .replace(/\{y\}/g, '0')
    .replace(/\{s\}/g, 'a');
}

function fail(
  code: BasemapSourceValidationFail['code'],
  message: string,
): BasemapSourceValidationFail {
  return { ok: false, code, message };
}

async function probeRasterTile(
  template: string,
): Promise<BasemapSourceValidationResult> {
  const sample = buildSampleRasterTileUrl(template);
  try {
    await loadImage(sample);
    return { ok: true };
  } catch {
    try {
      const res = await fetch(sample, { method: 'GET', mode: 'cors' });
      if (res.ok) return { ok: true };
      return fail(
        'probe-failed',
        `Tile request failed (${res.status}). Check the URL template.`,
      );
    } catch {
      return fail(
        'probe-failed',
        'Could not load a sample tile. Check the URL and CORS.',
      );
    }
  }
}

function loadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('image-error'));
    img.referrerPolicy = 'no-referrer';
    img.src = src;
  });
}

async function probeVectorStyle(
  url: string,
): Promise<BasemapSourceValidationResult> {
  let res: Response;
  try {
    res = await fetch(url.trim(), { method: 'GET', mode: 'cors' });
  } catch {
    return fail(
      'probe-failed',
      'Could not fetch style JSON. Check the URL and CORS.',
    );
  }
  if (!res.ok) {
    return fail('probe-failed', `Style request failed (${res.status}).`);
  }
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return fail('invalid-style', 'Response is not valid JSON.');
  }
  if (!isMapLibreStyleLike(data)) {
    return fail(
      'invalid-style',
      'JSON must include sources (object) and layers (array).',
    );
  }
  return { ok: true };
}

export function isMapLibreStyleLike(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const style = data as Record<string, unknown>;
  return (
    !!style['sources'] &&
    typeof style['sources'] === 'object' &&
    !Array.isArray(style['sources']) &&
    Array.isArray(style['layers'])
  );
}

/** Format + live probe for a custom basemap URL. */
export async function validateBasemapSource(
  input: ValidateBasemapSourceInput,
): Promise<BasemapSourceValidationResult> {
  const url = (input.url ?? '').trim();
  if (!url) return fail('empty', 'URL is required.');
  if (!isAbsoluteHttpUrl(url)) {
    return fail('invalid-url', 'URL must start with http:// or https://.');
  }

  if (input.type === 'raster') {
    if (!isValidRasterTileTemplate(url)) {
      return fail(
        'invalid-template',
        'Raster URL must include {z}, {x}, and {y} placeholders.',
      );
    }
    return probeRasterTile(url);
  }

  return probeVectorStyle(url);
}
