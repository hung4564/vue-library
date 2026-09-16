import { helpI18n, type DemoHelpSection } from '../menu/help';

const EN: DemoHelpSection[] = [
  {
    id: 'pointer-both',
    title: 'Pointer both (default)',
    body: 'Hover → paint only. Click → paint + MapLibre popup (`presentation.clickAction: \'popup\'`). Try both on the blue layer. Fill bound zooms to the layer.',
  },
  {
    id: 'pointer-hover',
    title: 'Pointer hover-only',
    body: '`pointer: { click: false, hover: true }`. Try: hover highlights (teal); click does not pick this layer.',
  },
  {
    id: 'pointer-click',
    title: 'Pointer click → detail',
    body: '`pointer: { click: true, hover: false }` + `clickAction: \'detail\'`. Try: click opens LayerDetail (coral); hover does not pick. Layer also has Fill bound.',
  },
  {
    id: 'presentation',
    title: 'Presentation onShow / onHide',
    body: '`presentation.onShow` / `onHide` with `popup: { kind: \'none\' }` and `clickAction: \'none\'`. Try: hover / click — check `demo:highlight` logs (no MapLibre popup).',
  },
  {
    id: 'replace-scope-all',
    title: 'Selection replaceScope all (multiple)',
    body: '`selection: { policy: \'multiple\', replaceScope: \'all\' }` — a new show clears every highlight source. Try: click several features and compare with other layers that use replaceScope source.',
  },
  {
    id: 'feature-state-group',
    title: 'Feature state + filterCreator "group"',
    body: 'Pulse highlight grouped by `group` (alpha / beta). Try: click one alpha feature — other alpha features highlight too.',
  },
  {
    id: 'feature-state',
    title: 'Feature state highlight',
    body: 'Pulse mode on local GeoJSON (`promoteId` on the source). Try: hover / click state features.',
  },
  {
    id: 'category',
    title: 'Default + filterCreator(feature)',
    body: 'filterCreator(feature) groups by clicked category. Try: click category A vs B — whole category lights up.',
  },
  {
    id: 'shadow-code',
    title: 'Shadow + filterCreator "code"',
    body: 'Outline style + property filter on `code`. Try: click — glow applies to matching code group.',
  },
  {
    id: 'product-code',
    title: 'Custom + filterCreator "productCode"',
    body: 'Groups by `productCode`. Try: click Product A/B/C features to see same-code siblings highlight.',
  },
  {
    id: 'default-fn',
    title: 'Default + filterCreator function',
    body: 'Default highlight + function filterCreator. Try: click — related features follow the function rule.',
  },
  {
    id: 'custom-fn',
    title: 'Custom + filterCreator function',
    body: 'Custom animate + function filterCreator. Try: click and compare which related features join the highlight set.',
  },
  {
    id: 'filter-id',
    title: 'Default + filterCreator "id"',
    body: 'filterCreator string field `id`. Try: click — only the matching id highlights.',
  },
  {
    id: 'filter-code',
    title: 'Default + filterCreator "code"',
    body: 'Highlights all features sharing the same `code` property. Try: click one feature — siblings with the same code highlight too.',
  },
  {
    id: 'custom',
    title: 'Custom animate highlight',
    body: 'Custom animated highlight (`mode: \'custom\'`). Try: hover / click to see the custom animation.',
  },
  {
    id: 'change-color',
    title: 'Change color highlight',
    body: 'Highlight by swapping feature color (`mode: \'changeColor\'`). Try: hover / click and watch fill/stroke color change.',
  },
  {
    id: 'shadow',
    title: 'Shadow highlight (static glow)',
    body: 'Outline / shadow highlight (`mode: \'outline\'`). Try: hover / click — compare to the blink default.',
  },
  {
    id: 'default',
    title: 'Default highlight (blink + id)',
    body: 'Default highlight — click opens a MapLibre popup; hover only paints. Each GeoJSON layer has a Fill bound button.',
  },
];

const VI: DemoHelpSection[] = [
  {
    id: 'pointer-both',
    title: 'Pointer cả hai (mặc định)',
    body: 'Hover → chỉ tô. Click → tô + popup MapLibre (`presentation.clickAction: \'popup\'`). Thử trên lớp xanh. Fill bound zoom lớp.',
  },
  {
    id: 'pointer-hover',
    title: 'Pointer chỉ hover',
    body: '`pointer: { click: false, hover: true }`. Thử: hover highlight (teal); click không chọn lớp này.',
  },
  {
    id: 'pointer-click',
    title: 'Pointer click → detail',
    body: '`pointer: { click: true, hover: false }` + `clickAction: \'detail\'`. Thử: click mở LayerDetail; hover không chọn. Có Fill bound.',
  },
  {
    id: 'presentation',
    title: 'Presentation onShow / onHide',
    body: '`presentation.onShow` / `onHide` với popup none. Thử: hover / click — xem log `demo:highlight` (không popup MapLibre).',
  },
  {
    id: 'replace-scope-all',
    title: 'Selection replaceScope all (multiple)',
    body: '`selection: { policy: \'multiple\', replaceScope: \'all\' }` — show mới xóa mọi nguồn highlight. Thử: click nhiều đối tượng và so với lớp replaceScope source.',
  },
  {
    id: 'feature-state-group',
    title: 'Feature state + filterCreator "group"',
    body: 'Pulse theo `group` (alpha / beta). Thử: click một alpha — các alpha khác cũng highlight.',
  },
  {
    id: 'feature-state',
    title: 'Highlight feature state',
    body: 'Chế độ pulse trên GeoJSON local (`promoteId`). Thử: hover / click.',
  },
  {
    id: 'category',
    title: 'Default + filterCreator(feature)',
    body: 'filterCreator(feature) nhóm theo category. Thử: click category A vs B — cả nhóm sáng.',
  },
  {
    id: 'shadow-code',
    title: 'Shadow + filterCreator "code"',
    body: 'Outline + lọc thuộc tính `code`. Thử: click — glow theo nhóm code.',
  },
  {
    id: 'product-code',
    title: 'Custom + filterCreator "productCode"',
    body: 'Nhóm theo `productCode`. Thử: click Product A/B/C để thấy anh em cùng mã.',
  },
  {
    id: 'default-fn',
    title: 'Default + filterCreator function',
    body: 'Highlight mặc định + filterCreator hàm. Thử: click — đối tượng liên quan theo hàm.',
  },
  {
    id: 'custom-fn',
    title: 'Custom + filterCreator function',
    body: 'Animate tùy chỉnh + filterCreator hàm. Thử: click và so tập highlight.',
  },
  {
    id: 'filter-id',
    title: 'Default + filterCreator "id"',
    body: 'filterCreator field `id`. Thử: click — chỉ id khớp highlight.',
  },
  {
    id: 'filter-code',
    title: 'Default + filterCreator "code"',
    body: 'Highlight mọi đối tượng cùng `code`. Thử: click một — anh em cùng code sáng theo.',
  },
  {
    id: 'custom',
    title: 'Highlight animate tùy chỉnh',
    body: '`mode: \'custom\'`. Thử: hover / click xem animation.',
  },
  {
    id: 'change-color',
    title: 'Highlight đổi màu',
    body: '`mode: \'changeColor\'`. Thử: hover / click — fill/stroke đổi màu.',
  },
  {
    id: 'shadow',
    title: 'Highlight shadow (glow tĩnh)',
    body: '`mode: \'outline\'`. Thử: hover / click — so với blink mặc định.',
  },
  {
    id: 'default',
    title: 'Highlight mặc định (blink + id)',
    body: 'Mặc định — click mở popup MapLibre; hover chỉ tô. Mỗi lớp GeoJSON có Fill bound.',
  },
];

export const HIGHLIGHT_DEMO_HELP = helpI18n(EN, VI);
/** @deprecated Prefer HIGHLIGHT_DEMO_HELP[lang] */
export const HIGHLIGHT_DEMO_HELP_SECTIONS = HIGHLIGHT_DEMO_HELP.en;
