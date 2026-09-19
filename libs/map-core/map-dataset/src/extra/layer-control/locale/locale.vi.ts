import { LAYER_DETAIL_FIELD_LOCALE_VI } from '../../detail/locale/locale.vi';

export const CREATE_CONTROL_SAMPLE_NONE_VI = '— Chọn mẫu —';

export const LAYER_CONTROL_FIELD_LOCALE_VI = {
  ...LAYER_DETAIL_FIELD_LOCALE_VI,
  file: 'Tệp',
  'layer-type': 'Kiểu lớp',
  'layer-name': 'Tên lớp',
  'style-type': 'Kiểu style',
  'style-type-auto': 'Tự động (theo dữ liệu)',
  crs: 'Hệ tọa độ',
  'crs-placeholder': 'Tìm hoặc nhập mã EPSG',
  'crs-hint': 'EPSG:4326 — WGS 84',
};

export const LAYER_CONTROL_CREATE_LOCALE_VI = {
  title: 'Lớp mới',
  sample: 'Mẫu',
  'url-error': 'Không tải được từ URL',
  'loading-url': 'Đang tải…',
  load: 'Tải',
  cancel: 'Hủy',
  'layer-setting': 'Cài đặt lớp',
  'data-source': 'Nguồn dữ liệu',
  'tab-file': 'Tệp',
  'tab-raw': 'Thô',
  'tab-url': 'URL',
  'paste-geojson': 'Dán dữ liệu GIS',
  'paste-geojson-hint': 'GeoJSON, TopoJSON, KML, GPX, CSV hoặc WKT',
  'file-hint':
    'GeoJSON, KML, KMZ, GPX, TopoJSON, CSV, WKT, Shapefile hoặc .zip — thả tệp/thư mục, hoặc dán văn bản/tệp GIS (Ctrl+V)',
  'file-drop': 'Thả tệp vào đây hoặc bấm để chọn',
  parsing: 'Đang đọc tệp…',
  'parse-error': 'Không đọc được tệp này',
  'crs-mismatch':
    'CRS tệp khác CRS đã chọn; dữ liệu sẽ được chuyển hệ.',
  'multi-file-error':
    'Thả một tệp GIS, bộ shapefile (.shp + sidecar / .zip), hoặc nhiều GeoJSON/KML/GPX.',
  creating: 'Đang tạo lớp…',
  'create-error': 'Không tạo được lớp',
  'create-error-data-too-large':
    'Dữ liệu có thể quá lớn, lồng quá sâu hoặc vòng. Thử tệp nhỏ hơn hoặc EPSG:4326.',
  'loaded-title': 'Dữ liệu đã tải',
  'loaded-from-file': 'Từ tệp',
  'loaded-from-url': 'Từ URL',
  'loaded-from-paste': 'Từ dán',
  'clear-data': 'Xóa',
  'replace-file': 'Đổi tệp',
  'features-count': 'Đối tượng',
  'geometry-types': 'Hình học',
  'validation-name': 'Nhập tên lớp.',
  'validation-data': 'Hãy tải hoặc dán dữ liệu GIS trước.',
  'validation-type': 'Chọn kiểu style.',
  'validation-url': 'Nhập URL tile.',
};

export const LAYER_CONTROL_TOGGLE_LOCALE_VI = {
  hide: 'Ẩn lớp',
  show: 'Hiện lớp',
  'hide-all': 'Ẩn tất cả lớp',
  'show-all': 'Hiện tất cả lớp',
};

export const LAYER_CONTROL_LOCALE_VI = {
  map: {
    'layer-control': {
      title: 'Lớp dữ liệu',
      search: 'Tìm lớp',
      'search-empty': 'Không có lớp khớp',
      empty: 'Chưa có lớp',
      'empty-hint': 'Tạo lớp để bắt đầu',
      'create-btn': 'Tạo lớp',
      toggle: LAYER_CONTROL_TOGGLE_LOCALE_VI,
      create: LAYER_CONTROL_CREATE_LOCALE_VI,
      field: LAYER_CONTROL_FIELD_LOCALE_VI,
      info: { title: 'Thông tin' },
    },
  },
};

export const CREATE_CONTROL_LOCALE_VI = LAYER_CONTROL_LOCALE_VI;
