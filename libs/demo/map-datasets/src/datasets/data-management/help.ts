import { helpI18n, type DemoHelpSection } from '../menu/help';

/**
 * Order = LayerControl top→bottom (last loaded first).
 * Titles match list / root names where possible.
 */
export const DATA_MANAGEMENT_DEMO_HELP = helpI18n(
  [
    {
      id: 'memory',
      title: 'Custom DataStore',
      body: 'In-memory DataStore demo. Try: open the layer; confirm features come from the custom store (see also View source).',
    },
    {
      id: 'http-custom',
      title: 'HTTP custom parseList',
      body: 'HTTP source with custom parseList. Try: page with the second bottom panel; compare parsing vs the standard HTTP list.',
    },
    {
      id: 'http',
      title: 'HTTP paged list',
      body: 'Standard HTTP data-management pager. Try: use the bottom pager (Prev / Next) and watch LayerControl / Identify update.',
    },
    {
      id: 'list-geom',
      title: 'List with geom',
      body: 'Local list items that carry geometry. Try: inspect features on the map and in the list UI.',
    },
    {
      id: 'geojson',
      title: 'GeoJSON features',
      body: 'Local GeoJSON-backed list. Try: browse rows in LayerControl; open Attribute table / Identify where menus allow.',
    },
  ],
  [
    {
      id: 'memory',
      title: 'DataStore tùy chỉnh',
      body: 'Demo DataStore trong bộ nhớ. Thử: mở lớp; xác nhận feature đến từ store tùy chỉnh (xem thêm View source).',
    },
    {
      id: 'http-custom',
      title: 'HTTP parseList tùy chỉnh',
      body: 'Nguồn HTTP với parseList tùy chỉnh. Thử: phân trang bằng panel dưới thứ hai; so parsing với list HTTP chuẩn.',
    },
    {
      id: 'http',
      title: 'List HTTP phân trang',
      body: 'Pager data-management HTTP chuẩn. Thử: dùng pager dưới (Prev / Next) và xem LayerControl / Identify cập nhật.',
    },
    {
      id: 'list-geom',
      title: 'List có geom',
      body: 'Mục list cục bộ mang geometry. Thử: xem feature trên bản đồ và trong UI list.',
    },
    {
      id: 'geojson',
      title: 'Feature GeoJSON',
      body: 'List dựa trên GeoJSON cục bộ. Thử: duyệt dòng trong LayerControl; mở Attribute table / Identify khi menu cho phép.',
    },
  ],
);
