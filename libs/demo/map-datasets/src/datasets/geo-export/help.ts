import { helpI18n, type DemoHelpSection } from '../menu/help';

/** Order = LayerControl top→bottom (last loaded first; layer 6 override added last). */
export const GEO_EXPORT_DEMO_HELP = helpI18n(
  [
    {
      id: 'override',
      title: '6 · Override · formComponent',
      body: 'Custom formComponent / loadingComponent on the dataset part (~1.2s). Try: Export and watch the override form + loading banners.',
    },
    {
      id: 'at-scopes',
      title: '5 · AT · scopes + Export',
      body: 'Attribute table scopes + toolbar Export. Try: open Attribute table → select / search rows → Export from the table toolbar.',
    },
    {
      id: 'onexport',
      title: '4 · onExport · mock API',
      body: 'onExport mock API (~0.6s) then saves JSON. Try: Export → Download and wait for the mock response blob.',
    },
    {
      id: 'click',
      title: '3 · Click · one-shot',
      body: 'One-shot export (formats[0]=geojson) with no format picker. Try: ⋮ → Export — file downloads immediately.',
    },
    {
      id: 'submenu',
      title: '2 · Menu · format submenu',
      body: 'Export expands a format submenu instead of a full modal first. Try: ⋮ → Export → choose a format.',
    },
    {
      id: 'modal',
      title: '1 · Modal · local download',
      body: 'Export opens a modal; Download writes a local file. Try: ⋮ → Export → pick format / CRS → Download. Attribute table is also in ⋮.',
    },
  ],
  [
    {
      id: 'override',
      title: '6 · Override · formComponent',
      body: 'formComponent / loadingComponent tùy chỉnh trên dataset part (~1.2s). Thử: Export và xem form override + banner loading.',
    },
    {
      id: 'at-scopes',
      title: '5 · AT · scopes + Export',
      body: 'Scope Attribute table + Export trên toolbar. Thử: mở Attribute table → chọn / tìm dòng → Export từ toolbar bảng.',
    },
    {
      id: 'onexport',
      title: '4 · onExport · mock API',
      body: 'onExport mock API (~0.6s) rồi lưu JSON. Thử: Export → Download và chờ blob phản hồi mock.',
    },
    {
      id: 'click',
      title: '3 · Click · one-shot',
      body: 'Export một phát (formats[0]=geojson) không chọn định dạng. Thử: ⋮ → Export — file tải ngay.',
    },
    {
      id: 'submenu',
      title: '2 · Menu · submenu định dạng',
      body: 'Export mở submenu định dạng thay vì modal đầy đủ trước. Thử: ⋮ → Export → chọn định dạng.',
    },
    {
      id: 'modal',
      title: '1 · Modal · tải cục bộ',
      body: 'Export mở modal; Download ghi file cục bộ. Thử: ⋮ → Export → chọn format / CRS → Download. Attribute table cũng có trong ⋮.',
    },
  ],
);
