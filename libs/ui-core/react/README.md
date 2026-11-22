# @hungpvq/react-ui-core

Generic React form fields and chrome (`InputText`, `BaseButton`, `Icon`, `Tabs`, `CopyButton`, …). Not map-specific.

`BaseButton` matches the former MapButton chrome: `variant` (`icon` | `plain` | `text` | `tonal` | `outlined` | `filled`, default `text`) and `size` (`small` | `medium` | `large` | px, default `medium`). Named `BaseButton` to stay in parity with Vue (HTML `button` is reserved there).

`CopyButton` is the shared clipboard control (icon `mdiContentCopy` → `mdiCheck`, ~1.5s, no toast). Defaults: `variant="plain"` `size="small"`. Set `labeled` to also show the title text.

```ts
import { BaseButton, CopyButton, Icon, InputText } from '@hungpvq/react-ui-core';
import '@hungpvq/react-ui-core/style.css';
```

Map-only fields (`InputCrs`, `MapRangeSlider`, `MapCard`, `MapImage`) stay on `@hungpvq/react-map-core/fields`.
