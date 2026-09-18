/**
 * Shell Vietnamese locale slices — same keys as `./shell.en` EN constants.
 * Aggregated by `locale/locale.vi.ts`.
 */
export const MAP_ACTION_LOCALE_VI = {
  map: {
    action: {
      'navigation-control-zoom-in': 'Phóng to',
      'navigation-control-zoom-out': 'Thu nhỏ',
      'navigation-control-reset-bearing': 'Đặt hướng về Bắc',
      'geolocate-control-find-my-location': 'Tìm vị trí của tôi',
      'geolocate-control-location-not-available': 'Không có vị trí',
      'geolocate-control-permission-denied': 'Bị từ chối quyền vị trí',
      'geolocate-control-timeout': 'Hết thời gian lấy vị trí',
      'geolocate-control-tracking-background':
        'Theo dõi vị trí (bản đồ chưa khóa)',
      'fullscreen-control-enter': 'Toàn màn hình',
      'fullscreen-control-exit': 'Thoát toàn màn hình',
    },
  },
};

export const HOME_CONTROL_LOCALE_VI = {
  map: {
    home: {
      title: 'Về mặc định',
    },
  },
};

export const GLOBE_CONTROL_LOCALE_VI = {
  map: {
    'global-control': {
      title: 'Đổi phép chiếu',
    },
  },
};

export const INFO_CONTROL_LOCALE_VI = {
  map: {
    'info-control': {
      title: 'THÔNG TIN',
      screenshot: 'Chụp màn hình',
      'copy-image': 'Sao chép ảnh',
      center: 'Tâm',
      zoom: 'Zoom',
      pitch: 'Độ nghiêng',
      bearing: 'Hướng',
      projection: 'Phép chiếu',
      bounds: 'Phạm vi',
      copy: 'Sao chép',
      copied: 'Đã sao chép',
      paste: 'Dán và đi tới',
      dms: 'DMS',
      decimal: 'Thập phân',
    },
  },
};

export const GOTO_CONTROL_LOCALE_VI = {
  map: {
    'goto-control': {
      title: 'Đi tới',
      field: {
        zoom: 'Zoom',
        center: 'Tâm',
      },
      btn: {
        apply: 'Đi tới',
        paste: 'Dán tọa độ',
      },
    },
  },
};

export const SETTING_CONTROL_LOCALE_VI = {
  map: {
    'setting-control': {
      title: 'Cài đặt',
      field: {
        zoom: 'Zoom',
        center: 'Tâm',
        sprite: 'URL sprite',
        glyphs: 'URL glyphs',
      },
      btn: {
        apply: 'Áp dụng',
      },
    },
  },
};

export const WORKER_CONTROL_LOCALE_VI = {
  map: {
    'worker-control': {
      title: 'Worker',
      empty: 'Chưa có worker',
      emptyMatch: 'Không có worker khớp',
      hint: 'Worker hiện khi có tác vụ (parse GeoJSON, CRS, …).',
      search: 'Tìm kiếm',
      searchPlaceholder: 'Lọc theo tên, id, tác vụ…',
      count: '{n} worker',
      busyCount: '{n} đang bận',
      pending: '{n} đang chạy',
      noRunning: 'Không có tác vụ đang chạy',
      status: {
        'not-started': 'Chưa chạy',
        idle: 'Nhàn rỗi',
        busy: 'Đang bận',
        unavailable: 'Không khả dụng',
        terminated: 'Đã dừng',
      },
      engine: {
        worker: 'Worker',
        main: 'Luồng chính',
      },
      field: {
        status: 'Trạng thái',
        task: 'Tác vụ',
        progress: 'Tiến độ',
        elapsed: 'Thời gian',
        error: 'Lỗi',
        history: 'Tác vụ gần đây',
        logs: 'Nhật ký worker',
        taskLogs: 'Nhật ký tác vụ',
      },
      stats: {
        ok: 'OK',
        error: 'Lỗi',
        fallback: 'Fallback',
      },
      action: {
        clear: 'Xóa worker này',
        clearAll: 'Xóa mọi worker',
        cancel: 'Hủy',
      },
    },
  },
};

export const REGISTRY_CONTROL_LOCALE_VI = {
  map: {
    'registry-control': {
      title: 'Registry',
      hint: 'Liệt kê, mở, đóng, di chuyển và chạy control đã đăng ký.',
      search: 'Tìm kiếm',
      searchPlaceholder: 'Lọc theo id, tiêu đề, loại, action…',
      empty: 'Không có control khớp',
      refresh: 'Làm mới',
      open: 'Mở',
      close: 'Đóng',
      movePopup: 'Di chuyển popup',
      toggleSidebar: 'Đổi cạnh sidebar',
      actionType: 'Loại action',
      runAction: 'Chạy action',
      actionDefault: '(mặc định / đơn)',
      openState: 'mở',
      closedState: 'đóng',
    },
  },
};

export const LANGUAGE_CONTROL_LOCALE_VI = {
  map: {
    'language-control': {
      title: 'Ngôn ngữ',
      en: 'English',
      vi: 'Tiếng Việt',
    },
  },
};
