/**
 * Shell locales that ship with the root entry.
 * Domain locales live next to their domain (`basemap/locale`, `crs/locale`, …).
 */
export const MAP_ACTION_LOCALE = {
  map: {
    action: {
      'navigation-control-zoom-in': 'Zoom in',
      'navigation-control-zoom-out': 'Zoom out',
      'navigation-control-reset-bearing': 'Reset bearing to north',
      'geolocate-control-find-my-location': 'Find my location',
      'geolocate-control-location-not-available': 'Location not available',
      'fullscreen-control-enter': 'Enter fullscreen',
      'fullscreen-control-exit': 'Exit fullscreen',
    },
  },
};

export const HOME_CONTROL_LOCALE = {
  map: {
    home: {
      title: 'Default view',
    },
  },
};

export const GLOBE_CONTROL_LOCALE = {
  map: {
    'global-control': {
      title: 'Toggle projection',
    },
  },
};

export const INFO_CONTROL_LOCALE = {
  map: {
    'info-control': {
      title: 'INFO',
      screenshot: 'Screenshot',
      center: 'Center',
      zoom: 'Zoom',
      pitch: 'Pitch',
      bearing: 'Bearing',
      projection: 'Projection',
      bounds: 'Bounds',
      copy: 'Copy',
    },
  },
};

export const GOTO_CONTROL_LOCALE = {
  map: {
    'goto-control': {
      title: 'Go to',
      field: {
        zoom: 'Zoom',
        center: 'Center',
      },
      btn: {
        apply: 'Go to',
      },
    },
  },
};

export const SETTING_CONTROL_LOCALE = {
  map: {
    'setting-control': {
      title: 'Setting',
      field: {
        zoom: 'Zoom',
        center: 'Center',
        sprite: 'Sprite url',
        glyphs: 'Glyphs url',
      },
      btn: {
        apply: 'Apply',
      },
    },
  },
};

export const WORKER_CONTROL_LOCALE = {
  map: {
    'worker-control': {
      title: 'Workers',
      empty: 'No workers registered',
      emptyMatch: 'No matching workers',
      hint: 'Workers appear here when a task starts (GeoJSON parse, CRS, …).',
      search: 'Search',
      searchPlaceholder: 'Filter by name, id, task…',
      count: '{n} workers',
      busyCount: '{n} busy',
      pending: '{n} running',
      noRunning: 'No running task',
      status: {
        'not-started': 'Not started',
        idle: 'Idle',
        busy: 'Busy',
        unavailable: 'Unavailable',
        terminated: 'Terminated',
      },
      engine: {
        worker: 'Worker',
        main: 'Main thread',
      },
      field: {
        status: 'Status',
        task: 'Task',
        progress: 'Progress',
        elapsed: 'Elapsed',
        error: 'Error',
        history: 'Recent tasks',
        logs: 'Worker log',
        taskLogs: 'Task log',
      },
      stats: {
        ok: 'OK',
        error: 'Errors',
        fallback: 'Fallback',
      },
      action: {
        clear: 'Clear this worker',
        clearAll: 'Clear all workers',
      },
    },
  },
};

export const REGISTRY_CONTROL_LOCALE = {
  map: {
    'registry-control': {
      title: 'Registry',
      hint: 'List, open, close, move, and run registered map controls.',
      search: 'Search',
      searchPlaceholder: 'Filter by id, title, kind, action…',
      empty: 'No matching controls',
      refresh: 'Refresh',
      open: 'Open',
      close: 'Close',
      movePopup: 'Move popup',
      toggleSidebar: 'Toggle sidebar side',
      actionType: 'Action type',
      runAction: 'Run action',
      actionDefault: '(default / single)',
      openState: 'open',
      closedState: 'closed',
    },
  },
};
