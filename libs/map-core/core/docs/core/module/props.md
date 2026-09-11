| Prop             | Description | Type                                                           | Required | Default Value    |
| ---------------- | ----------- | -------------------------------------------------------------- | -------- | ---------------- |
| `mapId`          |             | `string`                                                       | `false`  | --               |
| `dragId`         |             | `string`                                                       | `false`  | --               |
| `btnWidth`       |             | `number`                                                       | `false`  | 40               |
| `controlOrder`   | CSS flex `order` for the standalone button     | `number`                                                       | `false`  | 0                |
| `position`       |             | `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'` | `false`  | `'bottom-right'` |
| `controlLayout`   | `'standalone'` (corner), `'toolbar'` (always in toolbar), `'button'` (always corner; not auto-promoted on mobile) | `'standalone' \| 'toolbar' \| 'button'` | `false` | `'standalone'` |
| `controlVisible` |             | `boolean`                                                      | `false`  | `true`           |

`Map` also accepts `buttonInMobile` (`'button'` | `'toolbar'` | `'menu'`, default `'button'`). On viewports **≤640px**:

- `'button'` — leave corner buttons unchanged
- `'toolbar'` — move declared control buttons into a single `ToolbarControl` host (except `controlLayout="button"`). Mount one `ToolbarControl` in the map slot
- `'menu'` — hide per-control corner buttons; fan out intact clusters by `position` into corner stacks with outside-in More. Mount one `ToolbarControl`.

See [ToolbarControl](./ToolbarControl.md).
