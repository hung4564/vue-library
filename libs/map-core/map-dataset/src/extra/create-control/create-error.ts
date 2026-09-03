import {
  errorHandler,
  isCallStackOverflow,
  MapError,
} from '@hungpvq/map-core';

export type CreateLayerErrorContext = {
  crs?: string | null;
  layerType?: string;
  name?: string;
};

function asMapError(err: unknown): MapError | null {
  if (err instanceof MapError) return err;
  // Duplicate @hungpvq/map-core bundles break `instanceof`.
  if (
    err &&
    typeof err === 'object' &&
    (err as Error).name === 'MapError' &&
    typeof (err as { code?: unknown }).code === 'string'
  ) {
    return err as MapError;
  }
  return null;
}

/**
 * Normalize CreateControl failures and report them to Debug → Errors once.
 */
export function reportCreateLayerError(
  err: unknown,
  context?: CreateLayerErrorContext,
): MapError {
  const mapError = normalizeCreateLayerError(err, context);
  try {
    if (typeof window !== 'undefined') {
      errorHandler.handleOnce(mapError, {
        source: 'create-control',
        ...context,
      });
    }
  } catch {
    // Listener failures must not hide the create error.
  }
  return mapError;
}

export function normalizeCreateLayerError(
  err: unknown,
  context?: CreateLayerErrorContext,
): MapError {
  const existing = asMapError(err);
  if (existing) {
    existing.setContext({
      source: 'create-control',
      stage: existing.context?.['stage'] ?? 'create',
      ...context,
    });
    return existing;
  }

  const raw = err instanceof Error ? err.message : String(err ?? '');
  const stackOverflow = isCallStackOverflow(err);
  const crs = context?.crs ? String(context.crs) : undefined;

  if (stackOverflow) {
    return new MapError(
      crs && crs !== '4326'
        ? `Failed to create layer while handling CRS EPSG:${crs}. The transform/clone hit a call-stack overflow — try EPSG:4326 data, or restart the app so the GIS worker reloads.`
        : 'Failed to create layer: call-stack overflow while cloning or building the layer. Try a smaller file or restart the app.',
      'LAYER_CREATE_ERROR',
      {
        recoverable: false,
        cause: err,
        context: {
          source: 'create-control',
          stage: 'create',
          reason: 'call_stack_overflow',
          ...context,
        },
      },
    );
  }

  return new MapError(raw || 'Failed to create layer', 'LAYER_CREATE_ERROR', {
    recoverable: false,
    cause: err,
    context: {
      source: 'create-control',
      stage: 'create',
      reason: 'create_failed',
      ...context,
    },
  });
}
