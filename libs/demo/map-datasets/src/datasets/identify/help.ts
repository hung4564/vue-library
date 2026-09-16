import { helpI18n, type DemoHelpSection } from '../menu/help';

/** Order = LayerControl top→bottom (last loaded first). */
export const IDENTIFY_DEMO_HELP = helpI18n(
  [
    {
      id: 'api-merge',
      title: 'Identify API merge',
      body: 'getMergedFeatures enriches multi-hit rows (delayed mock). Try: click where multiple hits resolve; wait for merge fields (status / fetchedAt).',
    },
    {
      id: 'api-detail',
      title: 'Identify API detail',
      body: 'Custom getDetail / API-style enrichment on identify. Try: click a feature and watch the detail payload / console timing.',
    },
    {
      id: 'group-2',
      title: 'Group Identify 2',
      body: 'Second layer in the same identify group (added after 1 → usually above it). Try: multi-hit identify with Group Identify 1.',
    },
    {
      id: 'group-1',
      title: 'Group Identify 1',
      body: 'First layer in a multi-layer identify group. Try: IdentifyControl on overlapping / nearby features with Group Identify 2.',
    },
    {
      id: 'other-same-group',
      title: 'Other Dataset but same group',
      body: 'Separate root dataset that joins the same identify group as Group Identify. Try: click features from both — results can merge under one group flow.',
    },
    {
      id: 'no-group',
      title: 'No group identify',
      body: 'Identify without sharing an identify group. Try: click features — results stay scoped to this dataset’s identify part.',
    },
    {
      id: 'with-menu',
      title: 'Identify with menu',
      body: 'Layer menus + identify item menus (Fly to / Detail). Try: Identify the feature, then use result menus; also try Style / Info on the layer row.',
    },
    {
      id: 'simple',
      title: 'Simple identify',
      body: 'Basic identify part on one polygon. Try: enable IdentifyControl → click the polygon; results open without extra item menus.',
    },
  ],
  [
    {
      id: 'api-merge',
      title: 'Identify API merge',
      body: 'getMergedFeatures bổ sung các dòng multi-hit (mock có độ trễ). Thử: click chỗ nhiều hit cùng resolve; chờ các trường merge (status / fetchedAt).',
    },
    {
      id: 'api-detail',
      title: 'Identify API detail',
      body: 'getDetail tùy chỉnh / làm giàu kiểu API khi identify. Thử: click một feature và xem payload detail / thời gian trên console.',
    },
    {
      id: 'group-2',
      title: 'Group Identify 2',
      body: 'Lớp thứ hai trong cùng identify group (thêm sau 1 → thường nằm trên). Thử: identify multi-hit cùng Group Identify 1.',
    },
    {
      id: 'group-1',
      title: 'Group Identify 1',
      body: 'Lớp đầu trong identify group nhiều lớp. Thử: IdentifyControl trên feature chồng / gần với Group Identify 2.',
    },
    {
      id: 'other-same-group',
      title: 'Dataset khác nhưng cùng group',
      body: 'Root dataset riêng nhưng cùng identify group với Group Identify. Thử: click feature từ cả hai — kết quả có thể gộp trong một luồng group.',
    },
    {
      id: 'no-group',
      title: 'Identify không group',
      body: 'Identify không chia sẻ identify group. Thử: click feature — kết quả chỉ thuộc identify part của dataset này.',
    },
    {
      id: 'with-menu',
      title: 'Identify kèm menu',
      body: 'Menu lớp + menu item identify (Fly to / Detail). Thử: Identify feature rồi dùng menu kết quả; thêm Style / Info trên dòng lớp.',
    },
    {
      id: 'simple',
      title: 'Identify đơn giản',
      body: 'Identify part cơ bản trên một polygon. Thử: bật IdentifyControl → click polygon; kết quả mở không có menu item phụ.',
    },
  ],
);

