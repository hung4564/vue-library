import { helpI18n, type DemoHelpSection } from '../menu/help';

/**
 * One section per LayerControl row on Dataset → List.
 * Order = LayerControl top→bottom (last loaded first).
 */
export const LIST_DEMO_HELP = helpI18n(
  [
    {
      id: 'sublist-menus',
      title: 'Group list with sublist menus',
      body: 'Same structure, but each sublist has its own ToggleShow. Try: toggle parent vs Sub list point / Sub list line separately.',
    },
    {
      id: 'sublist',
      title: 'Group list with sublists',
      body: 'Parent group list with child sublists (point / line) without per-sublist menus. Try: expand children; parent bottom ToggleShow.',
    },
    {
      id: 'raster',
      title: 'Raster list (World Imagery)',
      body: 'Raster source + Fill bound. Try: ToggleShow; Fill bound to fly to the imagery extent.',
    },
    {
      id: 'vector-line',
      title: 'Vector line list',
      body: 'GeoJSON line with ToggleShow + Info. Try: toggle visibility; open Info.',
    },
    {
      id: 'vector-point',
      title: 'Vector point list',
      body: 'GeoJSON point with ToggleShow + Info. Try: toggle visibility; open Info.',
    },
    {
      id: 'grouped',
      title: 'Grouped area / Grouped point',
      body: 'Two lists share list.group → one “Grouped layers” folder. Try: expand the group; toggle area vs point independently.',
    },
    {
      id: 'conditions',
      title: 'Hidden / disabled from menuContext',
      body: 'Admin only / Pen action react to header checkboxes. Try: toggle admin and pen in the LayerControl header, then reopen ⋮ / extra icons.',
    },
    {
      id: 'component-key',
      title: 'Menu with setComponentMenuKey',
      body: '⋮ item uses a custom registry menu component. Try: open ⋮ → Sample custom menu (demo sample UI).',
    },
    {
      id: 'custom-menu',
      title: 'Custom menu list',
      body: 'Menus in every slot: extra, bottom, menu (⋮), prebottom (+ dividers). Try: click icons on the row and open ⋮ to see each location.',
    },
    {
      id: 'legend',
      title: 'List with legend',
      body: 'Legend opens on load (color, text, linear items). Try: expand the row legend in LayerControl.',
    },
    {
      id: 'custom-simple',
      title: 'Custom simple list',
      body: 'List-only row with custom color and opacity. Try: compare swatch / opacity with Default list.',
    },
    {
      id: 'default-list',
      title: 'Default list',
      body: 'Bare list row with no menus or map layer. Try: confirm it appears in LayerControl as a simple entry.',
    },
  ],
  [
    {
      id: 'sublist-menus',
      title: 'Group list có menu sublist',
      body: 'Cùng cấu trúc, nhưng mỗi sublist có ToggleShow riêng. Thử: bật/tắt parent vs Sub list point / Sub list line riêng.',
    },
    {
      id: 'sublist',
      title: 'Group list có sublist',
      body: 'Group list cha với sublist con (point / line) không có menu từng sublist. Thử: mở rộng con; ToggleShow dưới của parent.',
    },
    {
      id: 'raster',
      title: 'List raster (World Imagery)',
      body: 'Nguồn raster + Fill bound. Thử: ToggleShow; Fill bound để bay tới extent ảnh.',
    },
    {
      id: 'vector-line',
      title: 'List vector line',
      body: 'GeoJSON line với ToggleShow + Info. Thử: bật/tắt hiển thị; mở Info.',
    },
    {
      id: 'vector-point',
      title: 'List vector point',
      body: 'GeoJSON point với ToggleShow + Info. Thử: bật/tắt hiển thị; mở Info.',
    },
    {
      id: 'grouped',
      title: 'Grouped area / Grouped point',
      body: 'Hai list dùng chung list.group → một thư mục “Grouped layers”. Thử: mở rộng group; bật/tắt area vs point độc lập.',
    },
    {
      id: 'conditions',
      title: 'Ẩn / tắt từ menuContext',
      body: 'Admin only / Pen action phản ứng checkbox trên header. Thử: bật/tắt admin và pen trên header LayerControl, rồi mở lại ⋮ / icon phụ.',
    },
    {
      id: 'component-key',
      title: 'Menu với setComponentMenuKey',
      body: 'Mục ⋮ dùng component menu registry tùy chỉnh. Thử: mở ⋮ → Sample custom menu (UI mẫu demo).',
    },
    {
      id: 'custom-menu',
      title: 'List menu tùy chỉnh',
      body: 'Menu ở mọi slot: extra, bottom, menu (⋮), prebottom (+ divider). Thử: bấm icon trên dòng và mở ⋮ để xem từng vị trí.',
    },
    {
      id: 'legend',
      title: 'List có legend',
      body: 'Legend mở khi tải (mục color, text, linear). Thử: mở rộng legend dòng trong LayerControl.',
    },
    {
      id: 'custom-simple',
      title: 'List đơn giản tùy chỉnh',
      body: 'Dòng chỉ list với màu và độ mờ tùy chỉnh. Thử: so swatch / opacity với Default list.',
    },
    {
      id: 'default-list',
      title: 'List mặc định',
      body: 'Dòng list trần không menu hay lớp bản đồ. Thử: xác nhận nó hiện trong LayerControl như một mục đơn giản.',
    },
  ],
);

