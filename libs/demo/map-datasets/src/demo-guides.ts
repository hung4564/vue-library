import type { DemoHelpSection } from './datasets/menu/help';
import { DATA_MANAGEMENT_DEMO_HELP } from './datasets/data-management/help';
import { GEO_EXPORT_DEMO_HELP } from './datasets/geo-export/help';
import { HIGHLIGHT_DEMO_HELP } from './datasets/highlight/help';
import { IDENTIFY_DEMO_HELP } from './datasets/identify/help';
import { IDENTIFY_PRESENT_DEMO_HELP } from './datasets/identify-present/help';
import { LIST_DEMO_HELP } from './datasets/list/help';
import { MENU_DEMO_HELP } from './datasets/menu/help';

export type DemoFramework = 'vue' | 'react';
export type DemoGuideLang = 'en' | 'vi';

export type DemoPageGuide = {
  intro?: string;
  sections: DemoHelpSection[];
};

export type BilingualDemoPageGuide = {
  en: DemoPageGuide;
  vi: DemoPageGuide;
};

export type GetDemoPageGuideOptions = {
  /** When set, routes marked react-only are omitted for vue (and vice versa if added later). */
  framework?: DemoFramework;
  /** UI language for guide copy. Default `vi`. */
  lang?: DemoGuideLang | string;
};

/** Build a bilingual guide. Both `en` and `vi` are required for new demos. */
export function guideI18n(
  en: DemoPageGuide,
  vi: DemoPageGuide,
): BilingualDemoPageGuide {
  return { en, vi };
}

function guide(
  intro: string,
  sections: Array<[string, string, string]>,
): DemoPageGuide {
  return {
    intro,
    sections: sections.map(([id, title, body]) => ({ id, title, body })),
  };
}

function resolveLang(lang?: string): DemoGuideLang {
  return lang === 'en' ? 'en' : 'vi';
}

function pickGuide(
  entry: BilingualDemoPageGuide,
  lang?: string,
): DemoPageGuide {
  const l = resolveLang(lang);
  return entry[l] ?? entry.vi ?? entry.en;
}

function pickSections(
  bilingual: { en: DemoHelpSection[]; vi: DemoHelpSection[] },
  lang?: string,
): DemoHelpSection[] {
  const l = resolveLang(lang);
  return bilingual[l] ?? bilingual.vi ?? bilingual.en;
}

/** Routes available in one framework only (hash path without trailing slash). */
const REACT_ONLY_ROUTES = new Set<string>();

/** Per-route bilingual guides (hash path without trailing slash). */
const DEMO_PAGE_GUIDES: Record<string, BilingualDemoPageGuide> = {
  '/': guideI18n(
    guide(
      'Kitchen-sink map. Open ☰ AsideControl (top-left) to jump to focused demos.',
      [
        [
          'explore',
          'Explore',
          'Toolbar, measurement, draw, identify, layers, registry, workers, print, and more are mounted together.',
        ],
        [
          'controls',
          'Key controls',
          'LayerControl, Identify, Draw, Inspect, Measurement, Basemap, Theme, CRS, Print, Registry, Workers.',
        ],
        [
          'aside',
          'Navigation',
          'Use AsideControl to open Minimal, Menu, Identify, Draw, Geo-export, etc.',
        ],
      ],
    ),
    guide(
      'Bản đồ tổng hợp. Mở ☰ AsideControl (góc trên-trái) để chuyển tới các demo chuyên sâu.',
      [
        [
          'explore',
          'Khám phá',
          'Toolbar, đo đạc, vẽ, identify, lớp, registry, worker, in ấn… được gắn cùng lúc.',
        ],
        [
          'controls',
          'Control chính',
          'LayerControl, Identify, Draw, Inspect, Measurement, Basemap, Theme, CRS, Print, Registry, Workers.',
        ],
        [
          'aside',
          'Điều hướng',
          'Dùng AsideControl để mở Minimal, Menu, Identify, Draw, Geo-export, v.v.',
        ],
      ],
    ),
  ),

  '/map-core': guideI18n(
    guide('Baseline map with core controls only (no dataset UI).', [
      [
        'controls',
        'Corner controls',
        'Try goto, info, worker, CRS, globe, settings, zoom, basemap, geolocate, coordinates, context menu.',
      ],
      [
        'workers',
        'Workers',
        'Open the Workers control to inspect tasks and logs.',
      ],
    ]),
    guide('Bản đồ nền chỉ với control cốt lõi (không UI dataset).', [
      [
        'controls',
        'Control góc',
        'Thử goto, info, worker, CRS, globe, settings, zoom, basemap, geolocate, tọa độ, menu chuột phải.',
      ],
      ['workers', 'Workers', 'Mở Workers để xem task và log.'],
    ]),
  ),

  '/minimal': guideI18n(
    guide('Minimal starter: Map + LayerControl + sample GeoJSON.', [
      [
        'layers',
        'Layers',
        'Open LayerControl (top-left) to toggle the auto-loaded sample layer.',
      ],
      ['basemap', 'Basemap', 'Switch basemap from the bottom-left control.'],
    ]),
    guide('Starter tối giản: Map + LayerControl + GeoJSON mẫu.', [
      [
        'layers',
        'Lớp',
        'Mở LayerControl (trên-trái) để bật/tắt lớp mẫu đã tải sẵn.',
      ],
      ['basemap', 'Basemap', 'Đổi nền bản đồ từ control góc dưới-trái.'],
    ]),
  ),

  '/language': guideI18n(
    guide(
      'LanguageControl: chips EN / VI / FR. FR is a partial custom pack (missing keys fall back to English).',
      [
        [
          'api-reload',
          'API + custom lang',
          'EN/VI packs + demo-i18n JSON. FR via locales.fr (partial). Use the reload checkbox to force refetch.',
        ],
      ],
    ),
    guide(
      'LanguageControl: chip EN / VI / FR. FR là pack tùy chỉnh một phần (thiếu key thì fallback English).',
      [
        [
          'api-reload',
          'API + ngôn ngữ tùy chỉnh',
          'Pack EN/VI + JSON demo-i18n. FR qua locales.fr (một phần). Dùng checkbox reload để buộc tải lại.',
        ],
      ],
    ),
  ),

  '/worker-sample': guideI18n(
    guide('Run a sample GIS worker task and watch progress.', [
      ['run', 'Run sum-range', 'Set From/To in the side panel, then Run.'],
      [
        'inspect',
        'Workers control',
        'Also open Workers on the map to watch progress and shared logs.',
      ],
      [
        'errors',
        'Parse errors',
        'Invalid GIS text with strict:true throws (see parseGisText / worker error path); use strict:false to get null geojson.',
      ],
    ]),
    guide('Chạy task GIS worker mẫu và theo dõi tiến độ.', [
      ['run', 'Chạy sum-range', 'Nhập From/To ở panel bên, rồi Run.'],
      [
        'inspect',
        'Workers',
        'Mở Workers trên bản đồ để xem tiến độ và log dùng chung.',
      ],
      [
        'errors',
        'Lỗi parse',
        'Chuỗi GIS sai với strict:true sẽ throw (parseGisText / đường lỗi worker); strict:false trả geojson null.',
      ],
    ]),
  ),

  '/toolbar': guideI18n(
    guide('Controls slotted into ToolbarControl.', [
      [
        'toolbar',
        'Toolbar',
        'Measurement, legend, print, zoom, home, goto live in the toolbar host.',
      ],
      [
        'try',
        'Try',
        'Run measurement and print / advanced-print from the toolbar.',
      ],
    ]),
    guide('Các control nằm trong ToolbarControl.', [
      [
        'toolbar',
        'Toolbar',
        'Đo đạc, chú giải, in, zoom, home, goto nằm trong toolbar.',
      ],
      ['try', 'Thử', 'Chạy đo đạc và in / in nâng cao từ toolbar.'],
    ]),
  ),

  '/mobile-menu': guideI18n(
    guide('How buttonInMobile changes control layout ≤640px.', [
      [
        'modes',
        'Modes',
        'Top bar: switch buttonInMobile between button / toolbar / menu.',
      ],
      [
        'resize',
        'Resize',
        'Use width ≤640px (or DevTools mobile) to see promote / corner menu behavior.',
      ],
    ]),
    guide('Cách buttonInMobile đổi layout control khi ≤640px.', [
      [
        'modes',
        'Chế độ',
        'Thanh trên: đổi buttonInMobile giữa button / toolbar / menu.',
      ],
      [
        'resize',
        'Thu nhỏ',
        'Đặt rộng ≤640px (hoặc DevTools mobile) để thấy promote / menu góc.',
      ],
    ]),
  ),

  '/legend': guideI18n(
    guide('Legend swatches for sample line / fill / symbol layers.', [
      [
        'inspect',
        'Inspect',
        'On load, layers and legend entries are built — check patterns, dashes, icons, labels.',
      ],
    ]),
    guide('Chú giải mẫu cho lớp line / fill / symbol.', [
      [
        'inspect',
        'Xem',
        'Khi tải, lớp và mục chú giải được tạo — kiểm tra pattern, nét đứt, icon, nhãn.',
      ],
    ]),
  ),

  '/draw': guideI18n(
    guide('DrawControl: create and edit draft features.', [
      [
        'draw',
        'Draw',
        'Open DrawControl (top-right); draw point, line, or polygon.',
      ],
      [
        'edit',
        'Edit',
        'Finished shapes stay on the map; click them to select / edit.',
      ],
    ]),
    guide('DrawControl: tạo và sửa đối tượng nháp.', [
      ['draw', 'Vẽ', 'Mở DrawControl (trên-phải); vẽ điểm, đường hoặc vùng.'],
      ['edit', 'Sửa', 'Hình đã vẽ giữ trên bản đồ; bấm để chọn / sửa.'],
    ]),
  ),

  '/basemap': guideI18n(
    guide('Basemap switching and preview cards.', [
      [
        'switch',
        'Switch',
        'Use BaseMapControl (bottom-left) and BaseMapTagControl to change basemaps.',
      ],
      [
        'card',
        'Preview',
        'Check BaseMapCard preview after load (top-right / list slot).',
      ],
    ]),
    guide('Đổi nền bản đồ và thẻ xem trước.', [
      [
        'switch',
        'Đổi',
        'Dùng BaseMapControl (dưới-trái) và BaseMapTagControl để đổi nền.',
      ],
      [
        'card',
        'Xem trước',
        'Xem BaseMapCard sau khi tải (trên-phải / slot danh sách).',
      ],
    ]),
  ),

  '/basemap-error': guideI18n(
    guide(
      'Forces a bad MapLibre style URL so errors go through errorHandler → MapErrorToast.',
      [
        [
          'toast',
          'Toast',
          'Watch the bottom-center MapErrorToast after load (invalid style / tiles).',
        ],
        [
          'handler',
          'errorHandler',
          'Map shell already calls errorHandler.handle on map errors; open Devtools Errors tab if installed.',
        ],
      ],
    ),
    guide(
      'Ép URL style MapLibre sai để lỗi đi qua errorHandler → MapErrorToast.',
      [
        [
          'toast',
          'Toast',
          'Xem MapErrorToast giữa đáy sau khi tải (style / tile lỗi).',
        ],
        [
          'handler',
          'errorHandler',
          'Shell Map đã gọi errorHandler.handle khi lỗi; mở tab Errors trong Devtools nếu có.',
        ],
      ],
    ),
  ),

  '/multi-map': guideI18n(
    guide('Two Map instances with different mapIds on one page.', [
      [
        'ids',
        'mapIds',
        'Left = demo-map-a, right = demo-map-b — stores and controls are scoped per id.',
      ],
      [
        'teardown',
        'Teardown',
        'Leaving the route unmounts both Maps; each Map removes its instance from the map store (removeMap / destroy). Prefer explicit mapId when hosting multiple maps.',
      ],
    ]),
    guide('Hai instance Map với mapId khác nhau trên một trang.', [
      [
        'ids',
        'mapIds',
        'Trái = demo-map-a, phải = demo-map-b — store và control theo từng id.',
      ],
      [
        'teardown',
        'Gỡ',
        'Rời route sẽ unmount cả hai Map; mỗi Map gỡ instance khỏi map store (removeMap / destroy). Nên truyền mapId rõ khi có nhiều bản đồ.',
      ],
    ]),
  ),

  '/measurement': guideI18n(
    guide('Measure distance / area / point on the map.', [
      ['measure', 'Measure', 'Open MeasurementControl and draw measurements.'],
      [
        'vue-add',
        'Vue: add to layer',
        'Vue demo can push measurement geometry into LayerControl via “add to layer”.',
      ],
    ]),
    guide('Đo khoảng cách / diện tích / điểm trên bản đồ.', [
      ['measure', 'Đo', 'Mở MeasurementControl và vẽ phép đo.'],
      [
        'vue-add',
        'Vue: thêm lớp',
        'Demo Vue có thể đẩy hình đo vào LayerControl qua “add to layer”.',
      ],
    ]),
  ),

  '/registry-control': guideI18n(
    guide('Many controls registered; RegistryControl toggles them.', [
      [
        'mount',
        'Mounted together',
        'Measurement, identify, draw, print, and more are registered at once.',
      ],
      [
        'registry',
        'RegistryControl',
        'Open RegistryControl (top-right) to show / hide registered controls.',
      ],
    ]),
    guide('Nhiều control đã đăng ký; RegistryControl bật/tắt chúng.', [
      [
        'mount',
        'Gắn cùng lúc',
        'Đo đạc, identify, vẽ, in… được đăng ký một lần.',
      ],
      [
        'registry',
        'RegistryControl',
        'Mở RegistryControl (trên-phải) để hiện / ẩn control đã đăng ký.',
      ],
    ]),
  ),

  '/story-telling': guideI18n(
    guide(
      'Chapter playback on the map — Vue and React share the same chapter action engine.',
      [
        [
          'both',
          'Play / Pause / Prev / Next',
          'Chapters zoom, pan, rotate, draw route, orbit, and highlight DOM.',
        ],
      ],
    ),
    guide(
      'Phát chương trên bản đồ — Vue và React dùng chung chapter action engine.',
      [
        [
          'both',
          'Play / Pause / Prev / Next',
          'Chương zoom, pan, xoay, vẽ tuyến, orbit và highlight DOM.',
        ],
      ],
    ),
  ),

  '/story-telling-gps': guideI18n(
    guide(
      'GPS track playback with a moving marker — same chapter engine on Vue and React.',
      [
        [
          'both',
          'Play / Pause / Prev / Next',
          'Red marker animates along the GPS track with a trail.',
        ],
      ],
    ),
    guide(
      'Phát quỹ đạo GPS với marker chuyển động — cùng chapter engine trên Vue và React.',
      [
        [
          'both',
          'Play / Pause / Prev / Next',
          'Marker đỏ chạy theo track GPS kèm đường vệt.',
        ],
      ],
    ),
  ),

  '/map-dataset': guideI18n(
    guide('Loads all demo datasets on map load (Vue + React).', [
      [
        'explore',
        'Explore',
        'Use LayerControl, DatasetControl, Identify, measurement, and event controls.',
      ],
    ]),
    guide('Tải mọi dataset demo khi map load (Vue + React).', [
      [
        'explore',
        'Khám phá',
        'Dùng LayerControl, DatasetControl, Identify, đo đạc và event controls.',
      ],
    ]),
  ),

  '/print': guideI18n(
    guide('Focused PrintControl demo with a sample GeoJSON layer.', [
      [
        'print',
        'Print',
        'Open PrintControl (default corner) and export / print the current map view.',
      ],
      [
        'layer',
        'Sample layer',
        'LayerControl lists a small point dataset loaded on map ready.',
      ],
    ]),
    guide('Demo PrintControl với lớp GeoJSON mẫu.', [
      [
        'print',
        'In',
        'Mở PrintControl (góc mặc định) và xuất / in khung bản đồ hiện tại.',
      ],
      [
        'layer',
        'Lớp mẫu',
        'LayerControl liệt kê lớp điểm nhỏ được tải khi map sẵn sàng.',
      ],
    ]),
  ),

  '/crs': guideI18n(
    guide(
      'Focused CrsControl demo — switch display CRS / EPSG for coordinates.',
      [
        [
          'crs',
          'CRS',
          'Open CrsControl and pick a display CRS. Mouse / goto coordinates follow the selection.',
        ],
      ],
    ),
    guide('Demo CrsControl — đổi CRS / EPSG hiển thị tọa độ.', [
      [
        'crs',
        'CRS',
        'Mở CrsControl và chọn CRS hiển thị. Tọa độ chuột / goto theo lựa chọn.',
      ],
    ]),
  ),

  '/devtools': guideI18n(
    guide(
      'Devtools is installed at the app root; each map mounts a Map Devtools control.',
      [
        [
          'open',
          'Open',
          'Click the Map Devtools control on the map (tools icon) to open the popup panel.',
        ],
        [
          'install',
          'Install pattern',
          'App shell calls installDevtools() once; each <Map> mounts <Devtools /> / <DevtoolsControl />.',
        ],
        [
          'multi',
          'Multi-map',
          'See also #/multi-map — each mapId has its own store; Devtools lists maps in the process.',
        ],
      ],
    ),
    guide(
      'Devtools được cài ở app root; mỗi bản đồ gắn control Map Devtools.',
      [
        [
          'open',
          'Mở',
          'Bấm control Map Devtools trên bản đồ (icon tools) để mở panel popup.',
        ],
        [
          'install',
          'Cách cài',
          'App shell gọi installDevtools() một lần; mỗi <Map> mount <Devtools /> / <DevtoolsControl />.',
        ],
        [
          'multi',
          'Multi-map',
          'Xem thêm #/multi-map — mỗi mapId có store riêng; Devtools liệt kê các map trong process.',
        ],
      ],
    ),
  ),

  '/logging-cookbook': guideI18n(
    guide(
      'Action Flow cookbook — exercise ensureActionContext, nested spans, trackRequest, mitt, abort, and orphans. Open Devtools → Logs → Flow after each button.',
      [
        [
          'flow',
          'Flow fields',
          'Expect actionId on the gesture; spanId / parentSpanId on nested frames; HTTP requestId only on trackRequest.',
        ],
        [
          'menu',
          'Menu / identify / UI',
          'Also use LayerControl menus, Identify click, and open/close LayerDetail or Attribute Table on this map for scenarios 5–7.',
        ],
        [
          'sticky',
          'Concurrent',
          'Browser sticky zone may merge overlapping clicks; Node ALS isolates (see share-log tests).',
        ],
      ],
    ),
    guide(
      'Cookbook Action Flow — chạy ensureActionContext, span lồng nhau, trackRequest, mitt, abort, orphan. Mở Devtools → Logs → Flow sau mỗi nút.',
      [
        [
          'flow',
          'Trường Flow',
          'actionId cho gesture; spanId / parentSpanId cho frame lồng; requestId HTTP chỉ từ trackRequest.',
        ],
        [
          'menu',
          'Menu / identify / UI',
          'Dùng thêm menu LayerControl, Identify, mở/đóng LayerDetail hoặc Attribute Table cho scenario 5–7.',
        ],
        [
          'sticky',
          'Đồng thời',
          'Browser sticky có thể gộp click chồng; Node ALS tách (xem test share-log).',
        ],
      ],
    ),
  ),

  '/shared-log': guideI18n(
    guide(
      'Pure @hungpvq/shared-log demo — no MapLibre. Buffer panel + browser console.',
      [
        [
          'run',
          'Run scenarios',
          'Click each button; buffered records show actionId / spanId / parentSpanId / HTTP requestId.',
        ],
        [
          'map',
          'With map',
          'For mitt / menu / identify Flow trees, use #/logging-cookbook.',
        ],
      ],
    ),
    guide(
      'Demo thuần @hungpvq/shared-log — không MapLibre. Panel buffer + console.',
      [
        [
          'run',
          'Chạy scenario',
          'Bấm từng nút; buffer hiện actionId / spanId / parentSpanId / HTTP requestId.',
        ],
        [
          'map',
          'Có map',
          'Mitt / menu / identify Flow: dùng #/logging-cookbook.',
        ],
      ],
    ),
  ),

  '/theme': guideI18n(
    guide('ThemeControl plus a live panel of computed CSS theme tokens.', [
      [
        'switch',
        'Switch theme',
        'Use ThemeControl to pick auto / light / dark (and other modes). Class lands on html as map-theme-*.',
      ],
      [
        'tokens',
        'CSS vars',
        'The side panel reads getComputedStyle(document.documentElement) for --map-primary-color and --map-background-color.',
      ],
    ]),
    guide('ThemeControl kèm panel token CSS theo theme hiện tại.', [
      [
        'switch',
        'Đổi theme',
        'Dùng ThemeControl chọn auto / sáng / tối (và các mode khác). Class trên html là map-theme-*.',
      ],
      [
        'tokens',
        'Biến CSS',
        'Panel bên đọc getComputedStyle(document.documentElement) cho --map-primary-color và --map-background-color.',
      ],
    ]),
  ),
};

function datasetGuide(
  introEn: string,
  introVi: string,
  help: { en: DemoHelpSection[]; vi: DemoHelpSection[] },
  extraEn?: DemoHelpSection[],
  extraVi?: DemoHelpSection[],
): BilingualDemoPageGuide {
  return guideI18n(
    { intro: introEn, sections: [...help.en, ...(extraEn ?? [])] },
    { intro: introVi, sections: [...help.vi, ...(extraVi ?? [])] },
  );
}

const DATASET_GUIDES: Record<string, BilingualDemoPageGuide> = {
  '/dataset-highlight': datasetGuide(
    'Each LayerControl row is a different highlight strategy. Open Identify (on by default): click paints via setGlobalHighlightResolver (demo paints first hit even when multi). Hover still uses pointer bind.',
    'Mỗi dòng LayerControl là một chiến lược highlight. Identify bật sẵn: click tô qua setGlobalHighlightResolver (demo tô feature đầu kể cả multi). Hover vẫn dùng pointer bind.',
    HIGHLIGHT_DEMO_HELP,
  ),
  '/dataset-identify': datasetGuide(
    'Open LayerControl and IdentifyControl. Each row below is a layer (or group) on the map — try the steps for that demo.',
    'Mở LayerControl và IdentifyControl. Mỗi dòng dưới là một lớp (hoặc nhóm) trên bản đồ — làm theo bước của demo đó.',
    IDENTIFY_DEMO_HELP,
  ),
  '/dataset-identify-present': datasetGuide(
    'Zones with present menus, onSingle/onMultiple policies, and a layer that toggles setGlobalIdentifyResolver. Open Identify, click features; use the Resolver layer ⋮ menu to switch custom ↔ default.',
    'Các vùng với menu present, policy onSingle/onMultiple, và lớp bật/tắt setGlobalIdentifyResolver. Mở Identify, click đối tượng; dùng menu ⋮ lớp Resolver để đổi custom ↔ mặc định.',
    IDENTIFY_PRESENT_DEMO_HELP,
  ),
  '/dataset-menu': datasetGuide(
    'Each LayerControl row is one menu pattern. Open the layer, try the menus noted below; use Identify / Detail where called out.',
    'Mỗi dòng LayerControl là một kiểu menu. Mở lớp, thử menu bên dưới; dùng Identify / Detail khi được nhắc.',
    MENU_DEMO_HELP,
  ),
  '/dataset-list': datasetGuide(
    'Each LayerControl row demos list UI / menus. Use the header admin / pen checkboxes for the conditions row.',
    'Mỗi dòng LayerControl demo UI / menu danh sách. Dùng checkbox admin / pen trên header cho dòng điều kiện.',
    LIST_DEMO_HELP,
  ),
  '/dataset-data-management': datasetGuide(
    'Bottom pagers drive HTTP lists; LayerControl lists the loaded data-management demos.',
    'Pager dưới cùng điều khiển danh sách HTTP; LayerControl liệt kê các demo data-management đã tải.',
    DATA_MANAGEMENT_DEMO_HELP,
  ),
  '/dataset-attribute-table': datasetGuide(
    'Same data-management layers as the DM demo. Bottom panel opens AttributeTable with UI / column overrides; use LayerControl to pick a layer first.',
    'Cùng lớp data-management như demo DM. Panel dưới mở AttributeTable với override UI / cột; chọn lớp bằng LayerControl trước.',
    DATA_MANAGEMENT_DEMO_HELP,
    [
      {
        id: 'open-table',
        title: 'Open table (bottom panel)',
        body: 'Pick layer + override, then Open / Open+columns / Open+ui / Open+cell-header. Try queueSelectRows, actionSelectRows, and toggleShow. Column text filter: toolbar column + Contains, or per-column inputs under headers.',
      },
    ],
    [
      {
        id: 'open-table',
        title: 'Mở bảng (panel dưới)',
        body: 'Chọn lớp + override, rồi Open / Open+columns / Open+ui / Open+cell-header. Thử queueSelectRows, actionSelectRows và toggleShow. Lọc cột (contains): toolbar chọn cột + Contains, hoặc ô lọc dưới header từng cột.',
      },
    ],
  ),
  '/dataset-geo-export': datasetGuide(
    'Each LayerControl row is an export pattern (see also the header legend). All rows include Attribute table in ⋮.',
    'Mỗi dòng LayerControl là một kiểu export (xem thêm chú giải header). Mọi dòng có Attribute table trong ⋮.',
    GEO_EXPORT_DEMO_HELP,
  ),
};

Object.assign(DEMO_PAGE_GUIDES, DATASET_GUIDES);

export function getDemoPageGuide(
  pathname: string,
  options?: GetDemoPageGuideOptions,
): DemoPageGuide | undefined {
  const key = pathname.replace(/\/+$/, '') || '/';
  if (options?.framework === 'vue' && REACT_ONLY_ROUTES.has(key)) {
    return undefined;
  }
  const entry =
    DEMO_PAGE_GUIDES[key] ?? DEMO_PAGE_GUIDES[`/${key.replace(/^\//, '')}`];
  if (!entry) return undefined;
  return pickGuide(entry, options?.lang);
}

/** Chrome strings for DemoHelpPanel. */
export const DEMO_HELP_CHROME: Record<
  DemoGuideLang,
  { title: string; hide: string; show: string; dragHint: string }
> = {
  en: {
    title: 'Demo guide',
    hide: 'Hide guide',
    show: 'Demo guide',
    dragHint: 'Drag to move · click to show/hide',
  },
  vi: {
    title: 'Hướng dẫn',
    hide: 'Ẩn hướng dẫn',
    show: 'Hướng dẫn',
    dragHint: 'Kéo để di chuyển · bấm để hiện/ẩn',
  },
};

export function getDemoHelpChrome(lang?: string) {
  return DEMO_HELP_CHROME[resolveLang(lang)];
}

export { pickSections, resolveLang };
