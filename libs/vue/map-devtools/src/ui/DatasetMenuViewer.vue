<template>
  <div class="dataset-viewer">
    <p v-if="!ready" class="dataset-viewer__empty">
      Cần <code>@hungpvq/map-dataset</code> + <code>installDevtools()</code>.
      F12: <code>__hungpvqDatasetDebug.help()</code>
    </p>
    <template v-else>
      <div class="dataset-viewer__toolbar">
        <div v-if="showMapSelect" class="dataset-viewer__field">
          <InputSelect
            label="map"
            :model-value="mapId"
            :items="mapSelectItems"
            :title="mapId"
            @update:model-value="onMapSelect"
          />
        </div>
        <div
          v-if="snapshot"
          class="dataset-viewer__current"
          :title="snapshot.identity.id"
        >
          <span
            class="dataset-viewer__kind"
            :data-kind="snapshot.identity.kind"
            >{{ snapshot.identity.kind }}</span
          >
          <span class="dataset-viewer__muted">{{ snapshot.identity.type }}</span>
          <strong>{{ snapshot.identity.name }}</strong>
        </div>
        <p v-else class="dataset-viewer__current dataset-viewer__muted">
          No dataset selected
        </p>
        <div class="dataset-viewer__actions">
          <MapControlButton
            v-if="hasDatasetSelection"
            variant="text"
            size="small"
            title="Clear dataset selection"
            @click="clearSelection"
          >
            Clear
          </MapControlButton>
          <MapControlButton
            v-if="hasDatasetSelection"
            variant="text"
            size="small"
            :title="actionLabel('dataset', 'Pin dataset to vars.dataset')"
            :disabled="actionPhase === 'loading' && actionKey === 'dataset'"
            @click="pinDataset"
          >
            {{ actionLabel('dataset', 'Pin') }}
          </MapControlButton>
        </div>
      </div>

      <div class="dataset-viewer__panes" role="tablist">
        <div class="dataset-viewer__panes-tabs">
          <MapControlButton
            v-for="p in visiblePanes"
            :key="p.id"
            variant="text"
            size="small"
            :active="pane === p.id"
            role="tab"
            :aria-selected="pane === p.id"
            @click="setPane(p.id)"
          >
            {{ p.label }}
          </MapControlButton>
        </div>
        <MapControlButton
          v-if="pane === 'roots'"
          class="dataset-viewer__panes-refresh"
          variant="text"
          size="small"
          title="Refresh root dataset list"
          @click="refreshRoots"
        >
          Refresh
        </MapControlButton>
      </div>

      <div class="dataset-viewer__body">
        <template v-if="pane === 'roots'">
          <div class="dataset-viewer__roots" aria-label="Root datasets">
            <p v-if="!rootOptions.length" class="dataset-viewer__empty">
              No root datasets on this map.
            </p>
            <ul v-else class="dataset-viewer__root-list">
              <li
                v-for="r in rootOptions"
                :key="r.id"
                class="dataset-viewer__root-item"
                :class="{ 'is-selected': r.id === activeRootId }"
                :aria-selected="r.id === activeRootId"
                role="button"
                tabindex="0"
                :title="`Inspect ${r.name}`"
                @click="debugRoot(r.id)"
                @keydown.enter.prevent="debugRoot(r.id)"
                @keydown.space.prevent="debugRoot(r.id)"
              >
                <div class="dataset-viewer__root-meta" :title="r.id">
                  <strong>{{ r.name }}</strong>
                  <span class="dataset-viewer__muted">{{ r.type }}</span>
                </div>
                <div class="dataset-viewer__root-actions" @click.stop>
                  <MapControlButton
                    variant="text"
                    size="small"
                    :title="actionLabel('dataset', 'Pin dataset to vars.dataset')"
                    :disabled="
                      actionPhase === 'loading' && actionKey === 'dataset'
                    "
                    @click="pinRoot(r.id)"
                  >
                    {{ actionLabel('dataset', 'Pin') }}
                  </MapControlButton>
                </div>
              </li>
            </ul>
          </div>
        </template>

        <template v-else-if="pane === 'inspect'">
          <div class="dataset-viewer__inspect">
            <div class="dataset-viewer__inspect-layout">
              <div class="dataset-viewer__find" aria-label="Find part by type">
                <InputActionRow
                  flush
                  class="dataset-viewer__find-type"
                  :data-special="isSpecialFindType ? 'true' : undefined"
                >
                  <div class="form-group">
                    <label>type</label>
                    <div class="input-container">
                      <select
                        class="input-select"
                        :class="{
                          'dataset-viewer__find-select--special':
                            isSpecialFindType,
                        }"
                        v-model="findType"
                      >
                        <optgroup
                          v-if="specialFindItems.length"
                          label="Hierarchy · special"
                        >
                          <option
                            v-for="item in specialFindItems"
                            :key="item.value"
                            :value="item.value"
                            class="dataset-viewer__find-option--special"
                          >
                            {{ item.text }}
                          </option>
                        </optgroup>
                        <optgroup
                          v-if="partTypeItems.length"
                          label="Part type"
                        >
                          <option
                            v-for="item in partTypeItems"
                            :key="item.value"
                            :value="item.value"
                          >
                            {{ item.text }}
                          </option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  <template #action>
                    <MapControlButton
                      variant="tonal"
                      :title="actionLabel('find', 'Find part by type')"
                      :disabled="
                        (actionPhase === 'loading' && actionKey === 'find') ||
                        !findType
                      "
                      @click="runFindPart"
                    >
                      {{ actionLabel('find', 'Find') }}
                    </MapControlButton>
                  </template>
                </InputActionRow>
                <p v-if="findMiss" class="dataset-viewer__find-miss">
                  Not found.
                </p>
              </div>

              <aside
                class="dataset-viewer__aside"
                aria-label="Root dataset tree"
              >
                <DatasetTreeNav
                  :nodes="currentRootNodes"
                  :selected-id="datasetId"
                  :highlighted-ids="highlightIds"
                  :force-expand-ids="treeExpandIds"
                  aria-label="Current root dataset tree"
                  @select="selectDataset"
                />
              </aside>

              <section
                class="dataset-viewer__detail"
                aria-label="Dataset details"
              >
              <template v-if="snapshot">
                <section class="dataset-viewer__section">
                  <h3 class="dataset-viewer__section-h">Identity</h3>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Name</span>
                    <div class="dataset-viewer__row-value">
                      <span>{{ snapshot.identity.name }}</span>
                    </div>
                    <div class="dataset-viewer__row-copy">
                      <MapCopyButton
                        title="Copy Name"
                        :value="snapshot.identity.name"
                      />
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">ID</span>
                    <div class="dataset-viewer__row-value">
                      <code class="dataset-viewer__mono">{{
                        snapshot.identity.id
                      }}</code>
                    </div>
                    <div class="dataset-viewer__row-copy">
                      <MapCopyButton
                        title="Copy ID"
                        :value="snapshot.identity.id"
                      />
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Type</span>
                    <div class="dataset-viewer__row-value">
                      <span>{{ snapshot.identity.type }}</span>
                    </div>
                    <div class="dataset-viewer__row-copy">
                      <MapCopyButton
                        title="Copy Type"
                        :value="snapshot.identity.type"
                      />
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Kind</span>
                    <div class="dataset-viewer__row-value">
                      <span
                        class="dataset-viewer__kind"
                        :data-kind="snapshot.identity.kind"
                        >{{ snapshot.identity.kind }}</span
                      >
                    </div>
                  </div>
                </section>

                <section class="dataset-viewer__section">
                  <h3 class="dataset-viewer__section-h">Hierarchy</h3>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Root</span>
                    <div class="dataset-viewer__row-value">
                      <MapControlButton
                        variant="text"
                        size="small"
                        :title="snapshot.hierarchy.rootId"
                        @click="selectDataset(snapshot.hierarchy.rootId)"
                      >
                        {{ snapshot.hierarchy.rootName }}
                      </MapControlButton>
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Parent</span>
                    <div class="dataset-viewer__row-value">
                      <MapControlButton
                        v-if="snapshot.hierarchy.parentId"
                        variant="text"
                        size="small"
                        :title="snapshot.hierarchy.parentId"
                        @click="selectDataset(snapshot.hierarchy.parentId!)"
                      >
                        {{ snapshot.hierarchy.parentName || '—' }}
                      </MapControlButton>
                      <span v-else>(none — this is a root)</span>
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Children</span>
                    <div class="dataset-viewer__row-value">
                      {{ snapshot.hierarchy.childCount }}
                    </div>
                  </div>
                  <ul
                    v-if="snapshot.hierarchy.children.length"
                    class="dataset-viewer__child-list"
                  >
                    <li
                      v-for="c in snapshot.hierarchy.children"
                      :key="c.id"
                    >
                      <MapControlButton
                        variant="text"
                        size="small"
                        @click="selectDataset(c.id)"
                      >
                        {{ c.name }}
                        <span class="dataset-viewer__muted">{{ c.type }}</span>
                      </MapControlButton>
                    </li>
                  </ul>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Depth</span>
                    <div class="dataset-viewer__row-value">
                      {{ snapshot.hierarchy.depth }}
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Path</span>
                    <div class="dataset-viewer__row-value">
                      <code class="dataset-viewer__mono">{{
                        snapshot.hierarchy.pathLabel
                      }}</code>
                    </div>
                    <div class="dataset-viewer__row-copy">
                      <MapCopyButton
                        title="Copy Path"
                        :value="snapshot.hierarchy.pathLabel"
                      />
                    </div>
                  </div>
                </section>

                <section class="dataset-viewer__section">
                  <h3 class="dataset-viewer__section-h">Runtime</h3>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">isComposite</span>
                    <div class="dataset-viewer__row-value">
                      {{ snapshot.runtime.isComposite }}
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">addToMap</span>
                    <div class="dataset-viewer__row-value">
                      {{ flag(snapshot.runtime.hasAddToMap) }}
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">removeFromMap</span>
                    <div class="dataset-viewer__row-value">
                      {{ flag(snapshot.runtime.hasRemoveFromMap) }}
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">getData</span>
                    <div class="dataset-viewer__row-value">
                      {{ flag(snapshot.runtime.hasGetData) }}
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">getMenus</span>
                    <div class="dataset-viewer__row-value">
                      {{ flag(snapshot.runtime.hasGetMenus) }}
                    </div>
                  </div>
                  <div
                    v-if="snapshot.runtime.show !== undefined"
                    class="dataset-viewer__row"
                  >
                    <span class="dataset-viewer__row-label">show</span>
                    <div class="dataset-viewer__row-value">
                      {{ snapshot.runtime.show }}
                    </div>
                  </div>
                  <div
                    v-if="snapshot.runtime.opacity !== undefined"
                    class="dataset-viewer__row"
                  >
                    <span class="dataset-viewer__row-label">opacity</span>
                    <div class="dataset-viewer__row-value">
                      {{ snapshot.runtime.opacity }}
                    </div>
                  </div>
                  <div
                    v-if="snapshot.runtime.selected !== undefined"
                    class="dataset-viewer__row"
                  >
                    <span class="dataset-viewer__row-label">selected</span>
                    <div class="dataset-viewer__row-value">
                      {{ snapshot.runtime.selected }}
                    </div>
                  </div>
                </section>

                <section
                  v-if="snapshot.dependsOn?.length"
                  class="dataset-viewer__section"
                >
                  <h3 class="dataset-viewer__section-h">dependsOn</h3>
                  <code class="dataset-viewer__mono">{{
                    snapshot.dependsOn.join(', ')
                  }}</code>
                </section>

                <section
                  v-if="snapshot.dataPreview !== undefined"
                  class="dataset-viewer__section"
                >
                  <h3 class="dataset-viewer__section-h">Data preview</h3>
                  <TreeItem :data="snapshot.dataPreview" />
                </section>

                <section class="dataset-viewer__section">
                  <h3 class="dataset-viewer__section-h">Methods (generic)</h3>
                  <code
                    class="dataset-viewer__mono dataset-viewer__methods"
                    >{{
                      snapshot.identity.methodNames.join(', ') || '—'
                    }}</code
                  >
                </section>
              </template>
              <p v-else class="dataset-viewer__empty">
                Chọn dataset từ tree hoặc search.
              </p>
            </section>
            </div>
          </div>
        </template>

        <template v-else-if="pane === 'menus'">
          <div class="dataset-viewer__menus" ref="menusPaneRef">
            <div class="dataset-viewer__menus-toolbar">
              <div class="dataset-viewer__field dataset-viewer__menus-target">
                <InputSelect
                  label="target"
                  v-model="target"
                  :items="targetItems"
                  @update:model-value="onMenusFilterChange"
                />
              </div>
              <div class="dataset-viewer__field dataset-viewer__field--grow">
                <InputSelect
                  label="control"
                  v-model="control"
                  :items="controlItems"
                  @update:model-value="onMenusFilterChange"
                />
              </div>
            </div>

            <div class="dataset-viewer__menus-layout">
              <div class="dataset-viewer__buckets" aria-label="Menu buckets">
                <p v-if="!visibleBuckets.length" class="dataset-viewer__empty">
                  No menus for this target / control.
                </p>
                <div
                  v-for="bucket in visibleBuckets"
                  :key="bucket"
                  class="dataset-viewer__bucket"
                >
                  <div class="dataset-viewer__bucket-h">
                    <span>{{ bucket }}</span>
                    <span class="dataset-viewer__count">{{
                      (menuBuckets[bucket] || []).length
                    }}</span>
                  </div>
                  <ul>
                    <li
                      v-for="m in menuBuckets[bucket]"
                      :key="m.id || m.key || `${bucket}-${m.type}-${m.name || ''}`"
                      class="dataset-viewer__menu-item"
                      :class="{
                        'is-muted': m.hidden || m.disabled,
                        'is-selected':
                          (m.id || m.key || m.name || m.type) === selectedMenuId,
                      }"
                      role="button"
                      tabindex="0"
                      :title="m.name || m.id || bucket"
                      @click="selectMenu(m)"
                      @keydown.enter.prevent="selectMenu(m)"
                      @keydown.space.prevent="selectMenu(m)"
                    >
                      <span class="dataset-viewer__menu-name">{{
                        m.name || m.id || `(${m.type || 'unnamed'})`
                      }}</span>
                      <span
                        v-if="m.id && (m.name || m.idGenerated)"
                        class="dataset-viewer__menu-id"
                        >{{ m.id }}</span
                      >
                      <span class="dataset-viewer__flags">
                        <span
                          class="dataset-viewer__chip"
                          :data-source="m.source"
                          >{{ m.source }}</span
                        >
                        <span
                          v-if="m.idGenerated"
                          class="dataset-viewer__chip"
                          data-source="generated"
                          >anon</span
                        >
                        <span v-if="m.hidden" class="dataset-viewer__chip"
                          >hidden</span
                        >
                        <span v-if="m.disabled" class="dataset-viewer__chip"
                          >disabled</span
                        >
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <aside
                ref="menuDetailRef"
                class="dataset-viewer__menu-detail"
                aria-label="Menu details"
              >
                <template v-if="menuDetail">
                  <div class="dataset-viewer__menu-detail-h">
                    <strong>{{ menuDetail.name || menuDetail.id || 'Menu' }}</strong>
                    <MapCopyButton
                      title="Copy menu JSON"
                      :value="menuDetailJson"
                    />
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Name</span>
                    <div class="dataset-viewer__row-value">
                      {{ menuDetail.name || '—' }}
                    </div>
                    <div class="dataset-viewer__row-copy">
                      <MapCopyButton
                        title="Copy name"
                        :value="menuDetail.name || ''"
                      />
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">ID</span>
                    <div class="dataset-viewer__row-value">
                      <code class="dataset-viewer__mono">{{
                        menuDetail.id || '—'
                      }}</code>
                      <span
                        v-if="menuDetail.idGenerated"
                        class="dataset-viewer__chip"
                        data-source="generated"
                        >anon</span
                      >
                    </div>
                    <div class="dataset-viewer__row-copy">
                      <MapCopyButton
                        title="Copy id"
                        :value="menuDetail.id || ''"
                      />
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Type</span>
                    <div class="dataset-viewer__row-value">
                      {{ menuDetail.type }}
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Source</span>
                    <div class="dataset-viewer__row-value">
                      <span
                        class="dataset-viewer__chip"
                        :data-source="menuDetail.source"
                        >{{ menuDetail.source }}</span
                      >
                      <span class="dataset-viewer__muted">{{
                        menuDetail.sourceLabel
                      }}</span>
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Host</span>
                    <div class="dataset-viewer__row-value">
                      {{ menuDetail.hostType || '—' }}
                      <code
                        v-if="menuDetail.hostId"
                        class="dataset-viewer__mono"
                        >{{ menuDetail.hostId }}</code
                      >
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Dataset</span>
                    <div class="dataset-viewer__row-value">
                      {{ menuDetail.datasetName || '—' }}
                      <span class="dataset-viewer__muted">{{
                        menuDetail.datasetType
                      }}</span>
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Target</span>
                    <div class="dataset-viewer__row-value">
                      {{ menuDetail.target || target }}
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Control</span>
                    <div class="dataset-viewer__row-value">
                      <code class="dataset-viewer__mono">{{
                        menuDetail.control || control
                      }}</code>
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Location</span>
                    <div class="dataset-viewer__row-value">
                      {{ menuDetail.location || '—' }}
                      <span class="dataset-viewer__muted"
                        >→ {{ menuDetail.effectiveLocation }}</span
                      >
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">byControl</span>
                    <div class="dataset-viewer__row-value">
                      {{
                        menuDetail.byControlKeys.length
                          ? menuDetail.byControlKeys.join(', ')
                          : '—'
                      }}
                    </div>
                  </div>
                  <div class="dataset-viewer__row">
                    <span class="dataset-viewer__row-label">Flags</span>
                    <div class="dataset-viewer__row-value">
                      <span
                        v-if="menuDetail.summary.hidden"
                        class="dataset-viewer__chip"
                        >hidden</span
                      >
                      <span
                        v-if="menuDetail.summary.disabled"
                        class="dataset-viewer__chip"
                        >disabled</span
                      >
                      <span
                        v-if="menuDetail.hasClick"
                        class="dataset-viewer__chip"
                        >click</span
                      >
                      <span
                        v-if="menuDetail.componentKey"
                        class="dataset-viewer__chip"
                        >{{ menuDetail.componentKey }}</span
                      >
                      <span v-if="menuDetail.icon" class="dataset-viewer__muted">{{
                        menuDetail.icon
                      }}</span>
                      <span
                        v-if="
                          !menuDetail.summary.hidden &&
                          !menuDetail.summary.disabled &&
                          !menuDetail.hasClick &&
                          !menuDetail.componentKey
                        "
                        >—</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="menuDetail.byControl"
                    class="dataset-viewer__menu-raw"
                  >
                    <h4 class="dataset-viewer__section-h">byControl map</h4>
                    <TreeItem :data="menuDetail.byControl" />
                  </div>
                </template>
                <p v-else class="dataset-viewer__empty">
                  Click a menu in a bucket to inspect name, id, registration
                  source, host, control placement, …
                </p>
              </aside>
            </div>
          </div>
        </template>
      </div>

      <p class="dataset-viewer__foot">
        F12 · <code>__hungpvqDatasetDebug.help()</code>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  createActionFeedback,
  type ActionFeedbackPhase,
} from '@hungpvq/map-core';
import { MapControlButton, MapCopyButton } from '@hungpvq/vue-map-core';
import { InputActionRow, InputSelect } from '@hungpvq/vue-map-core/fields';
import {
  type DatasetDebugApi,
  type DatasetInspectSnapshot,
  type DatasetNodeSummary,
  type DatasetSearchHit,
  type DatasetTreeNode,
  type MenuInspectDetail,
  type MenuSummary,
  type PartitionedMenuSummary,
} from '@hungpvq/map-debug/dataset';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import DatasetTreeNav from './DatasetTreeNav.vue';
import TreeItem from './TreeItem.vue';

type PaneId = 'roots' | 'inspect' | 'menus';
type SelectItem = { value: string; text: string };

/** Special find targets (not IDataset.type). Hidden when current node is root. */
const FIND_PARENT = '__find:parent';
const FIND_ROOT = '__find:root';
const FIND_COMPOSITE = '__find:composite';

const SPECIAL_FIND_ITEMS: SelectItem[] = [
  { value: FIND_PARENT, text: 'parent' },
  { value: FIND_ROOT, text: 'root' },
  {
    value: FIND_COMPOSITE,
    text: 'composite · nearest group',
  },
];

/** Keep blink + primary text for ~4 pulses (0.7s × 4). */
const FIND_HIGHLIGHT_MS = 2800;

const ALL_PANES: { id: PaneId; label: string }[] = [
  { id: 'roots', label: 'Roots' },
  { id: 'inspect', label: 'Inspect' },
  { id: 'menus', label: 'Menus' },
];

const targetItems: SelectItem[] = [
  { value: 'layer', text: 'layer' },
  { value: 'item', text: 'item' },
];

const ready = ref(false);
const api = shallowRef<DatasetDebugApi | null>(null);
const pane = ref<PaneId>('roots');
const mapId = ref('');
const datasetId = ref('');
const target = ref<'layer' | 'item'>('layer');
const control = ref('layer-control');
const controlIds = ref<Record<string, string>>({});
const mapIds = ref<string[]>([]);
const forest = shallowRef<DatasetTreeNode[]>([]);
const searchable = shallowRef<DatasetSearchHit[]>([]);
const rootOptions = ref<DatasetNodeSummary[]>([]);
const snapshot = shallowRef<DatasetInspectSnapshot | null>(null);
const rootTypes = ref<string[]>([]);
const findType = ref('');
const findMiss = ref(false);
const highlightIds = ref<string[]>([]);
const findExpandIds = ref<string[]>([]);
const highlightClearTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const menuBuckets = ref<PartitionedMenuSummary>({
  extra: [],
  menu: [],
  bottom: [],
  prebottom: [],
  title: [],
});
const bucketNames = ['title', 'extra', 'menu', 'bottom', 'prebottom'] as const;
const selectedMenuId = ref('');
const menuDetail = shallowRef<MenuInspectDetail | null>(null);
const menusPaneRef = ref<HTMLElement | null>(null);
const menuDetailRef = ref<HTMLElement | null>(null);

const menuDetailJson = computed(() =>
  menuDetail.value ? JSON.stringify(menuDetail.value, null, 2) : '',
);

const visibleBuckets = computed(() =>
  bucketNames.filter((bucket) => (menuBuckets.value[bucket] || []).length > 0),
);

const actionPhase = ref<ActionFeedbackPhase>('idle');
const actionKey = ref<string | null>(null);
const actionFeedback = createActionFeedback({
  onChange: (phase, key) => {
    actionPhase.value = phase;
    actionKey.value = key;
  },
});

onBeforeUnmount(() => actionFeedback.dispose());

const showMapSelect = computed(() => mapIds.value.length > 1);

const hasDatasetSelection = computed(() => Boolean(datasetId.value));

const activeRootId = computed(
  () =>
    snapshot.value?.hierarchy.rootId ||
    (rootOptions.value.some((r) => r.id === datasetId.value)
      ? datasetId.value
      : ''),
);

const visiblePanes = computed(() =>
  hasDatasetSelection.value
    ? ALL_PANES
    : ALL_PANES.filter((p) => p.id === 'roots'),
);

const pathIds = computed(() => snapshot.value?.hierarchy.pathIds ?? []);

const treeExpandIds = computed(() => {
  const seen = new Set<string>(pathIds.value);
  for (const id of findExpandIds.value) seen.add(id);
  return [...seen];
});

const currentRootNodes = computed<DatasetTreeNode[]>(() => {
  const rootId = snapshot.value?.hierarchy.rootId;
  if (!rootId) return forest.value.slice(0, 1);
  const match = forest.value.find((n) => n.id === rootId);
  return match ? [match] : forest.value.slice(0, 1);
});

const mapSelectItems = computed<SelectItem[]>(() =>
  mapIds.value.map((id) => ({ value: id, text: shortId(id) })),
);

const isCurrentRoot = computed(
  () => snapshot.value?.identity.kind === 'root',
);

const specialFindItems = computed<SelectItem[]>(() =>
  isCurrentRoot.value ? [] : SPECIAL_FIND_ITEMS,
);

const partTypeItems = computed<SelectItem[]>(() =>
  rootTypes.value
    .filter((t) => t !== 'composite')
    .map((t) => ({ value: t, text: t })),
);

const rootTypeItems = computed<SelectItem[]>(() => [
  ...specialFindItems.value,
  ...partTypeItems.value,
]);

const isSpecialFindType = computed(
  () =>
    findType.value === FIND_PARENT ||
    findType.value === FIND_ROOT ||
    findType.value === FIND_COMPOSITE,
);

const controlItems = computed<SelectItem[]>(() =>
  Object.entries(controlIds.value).map(([key, val]) => ({
    value: val,
    text: key,
  })),
);

function flag(v: boolean) {
  return v ? 'yes' : 'no';
}

function actionLabel(key: string, idle: string, done = 'Done') {
  if (actionKey.value !== key) return idle;
  if (actionPhase.value === 'loading') return '…';
  if (actionPhase.value === 'success') {
    if (key === 'dataset') return 'Pinned';
    if (key === 'find') return 'Found';
    return done;
  }
  if (actionPhase.value === 'error') return 'Failed';
  return idle;
}

function shortId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function getApi(): DatasetDebugApi | null {
  if (typeof window === 'undefined') return null;
  return window.__hungpvqDatasetDebug ?? api.value;
}

function highlightNode(id: string, expandIds: string[]) {
  if (highlightClearTimer.value) {
    clearTimeout(highlightClearTimer.value);
    highlightClearTimer.value = null;
  }
  highlightIds.value = [id];
  findExpandIds.value = expandIds;
  scrollToDataset(id);
  highlightClearTimer.value = setTimeout(() => {
    highlightIds.value = [];
    highlightClearTimer.value = null;
  }, FIND_HIGHLIGHT_MS);
}

function findNearestCompositeId(): string | undefined {
  const d = getApi();
  let node = d?.dataset?.getParent();
  while (node) {
    if (node.type === 'composite') return node.id;
    node = node.getParent();
  }
  return undefined;
}

function syncFindTypeOptions() {
  const allowed = new Set(rootTypeItems.value.map((i) => i.value));
  if (!findType.value || !allowed.has(findType.value)) {
    findType.value = rootTypeItems.value[0]?.value || '';
  }
}

function refreshLists() {
  const d = getApi();
  if (!d) return;
  mapIds.value = d.listMapIds();
  controlIds.value = { ...d.MENU_CONTROL_ID };
  if (!control.value && controlIds.value.layerControl) {
    control.value = controlIds.value.layerControl;
  }
  if (!mapId.value) {
    forest.value = [];
    searchable.value = [];
    rootOptions.value = [];
    rootTypes.value = [];
    return;
  }
  forest.value = d.listForest(mapId.value);
  searchable.value = d.listSearchable(mapId.value);
  rootOptions.value = d.listDatasets(mapId.value);
}

function refreshSnapshot() {
  const d = getApi();
  if (!d) {
    snapshot.value = null;
    rootTypes.value = [];
    return;
  }
  snapshot.value = d.inspect() ?? null;
  const root = d.root();
  rootTypes.value = root ? d.listTypes(root) : d.listTypes();
  syncFindTypeOptions();
}

function scrollToDataset(id: string) {
  void nextTick(() => {
    requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-dataset-id="${CSS.escape(id)}"]`,
      ) as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });
}

function runFindPart() {
  findMiss.value = false;
  if (highlightClearTimer.value) {
    clearTimeout(highlightClearTimer.value);
    highlightClearTimer.value = null;
  }
  highlightIds.value = [];
  findExpandIds.value = [];
  void actionFeedback.run('find', () => {
    const d = getApi();
    const snap = snapshot.value;
    if (!d || !findType.value || !snap) {
      findMiss.value = true;
      throw new Error('missing');
    }

    if (findType.value === FIND_PARENT) {
      const id = snap.hierarchy.parentId;
      if (!id) {
        findMiss.value = true;
        throw new Error('not found');
      }
      const node = d.getDataset(undefined, id);
      highlightNode(id, node ? d.pathIds(node) : [id]);
      return;
    }

    if (findType.value === FIND_ROOT) {
      const id = snap.hierarchy.rootId;
      if (!id || id === snap.identity.id) {
        findMiss.value = true;
        throw new Error('not found');
      }
      highlightNode(id, [id]);
      return;
    }

    if (findType.value === FIND_COMPOSITE) {
      const id = findNearestCompositeId();
      if (!id) {
        findMiss.value = true;
        throw new Error('not found');
      }
      const node = d.getDataset(undefined, id);
      highlightNode(id, node ? d.pathIds(node) : [id]);
      return;
    }

    const from = d.root() ?? d.dataset;
    const part = from ? d.findPartByType(findType.value, from) : undefined;
    if (!part) {
      findMiss.value = true;
      throw new Error('not found');
    }
    highlightNode(part.id, d.pathIds(part));
  });
}

function syncSession() {
  const d = getApi();
  if (!d) return;
  d.setSession({
    mapId: mapId.value || undefined,
    datasetId: datasetId.value || undefined,
    control: control.value,
    target: target.value,
    pane: pane.value,
  });
  refreshSnapshot();
  previewMenus();
}

function hydrateFromSession() {
  const d = getApi();
  if (!d) return;
  refreshLists();
  const s = d.session;
  mapId.value =
    s.mapId && mapIds.value.includes(s.mapId) ? s.mapId : mapIds.value[0] || '';
  refreshLists();
  const stillThere = searchable.value.some((x) => x.id === s.datasetId);
  datasetId.value = stillThere && s.datasetId ? s.datasetId : '';
  if (s.control) control.value = String(s.control);
  if (s.target === 'layer' || s.target === 'item') target.value = s.target;
  if (!datasetId.value) {
    pane.value = 'roots';
  } else if (s.pane === 'roots' || s.pane === 'inspect' || s.pane === 'menus') {
    pane.value = s.pane;
  } else if (s.pane === 'tree' || s.pane === 'find') {
    pane.value = 'inspect';
  } else {
    pane.value = 'inspect';
  }
  syncSession();
}

function setPane(next: PaneId) {
  if (!datasetId.value && next !== 'roots') return;
  pane.value = next;
  syncSession();
}

function selectDataset(id: string) {
  datasetId.value = id;
  findMiss.value = false;
  syncSession();
  syncFindTypeOptions();
}

function refreshRoots() {
  refreshLists();
  refreshSnapshot();
}

function pinRoot(id: string) {
  void actionFeedback.run('dataset', () => {
    const d = getApi();
    if (!d) throw new Error('missing');
    const node = d.getDataset(mapId.value || undefined, id);
    if (!node) throw new Error('not found');
    d.pin('dataset', node);
  });
}

function debugRoot(id: string) {
  selectDataset(id);
  setPane('inspect');
}

function clearSelection() {
  if (highlightClearTimer.value) {
    clearTimeout(highlightClearTimer.value);
    highlightClearTimer.value = null;
  }
  datasetId.value = '';
  findMiss.value = false;
  highlightIds.value = [];
  findExpandIds.value = [];
  pane.value = 'roots';
  syncSession();
}

function onMapSelect(next: string | SelectItem | undefined) {
  mapId.value =
    typeof next === 'string' ? next : next && 'value' in next ? String(next.value) : '';
  onMapChange();
}

function onMapChange() {
  datasetId.value = '';
  findType.value = '';
  findMiss.value = false;
  if (highlightClearTimer.value) {
    clearTimeout(highlightClearTimer.value);
    highlightClearTimer.value = null;
  }
  highlightIds.value = [];
  findExpandIds.value = [];
  pane.value = 'roots';
  refreshLists();
  syncSession();
}

function pinDataset() {
  void actionFeedback.run('dataset', () => {
    getApi()?.pin('dataset');
  });
}

function previewMenus() {
  const d = getApi();
  if (!d) return;
  const preview = d.previewMenus({
    control: control.value,
    target: target.value,
  });
  if (preview) menuBuckets.value = preview;
  if (selectedMenuId.value) {
    menuDetail.value =
      d.inspectMenu({
        menuId: selectedMenuId.value,
        control: control.value,
        target: target.value,
      }) ?? null;
    if (!menuDetail.value) {
      selectedMenuId.value = '';
    }
  }
}

function scrollMenusToLatest() {
  void nextTick(() => {
    const paneEl = menusPaneRef.value;
    if (paneEl) paneEl.scrollTop = 0;
    menuDetailRef.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

function onMenusFilterChange() {
  syncSession();
  scrollMenusToLatest();
}

function detailFromSummary(m: MenuSummary): MenuInspectDetail {
  const id = m.id || m.key || m.name || m.type || 'menu';
  return {
    key: m.key || id,
    id,
    idGenerated: m.idGenerated ?? !m.id,
    name: m.name,
    type: m.type,
    summary: {
      ...m,
      key: m.key || id,
      id,
    },
    location: m.location,
    effectiveLocation: m.effectiveLocation ?? 'extra',
    order: m.order,
    icon: m.icon,
    componentKey: m.componentKey,
    byControlKeys: m.byControlKeys ?? [],
    hasClick: m.hasClick,
    source: m.source,
    sourceLabel: m.sourceLabel,
    hostType: m.hostType,
    hostId: m.hostId,
    control: m.control ?? control.value,
    target: m.target ?? target.value,
    rawKeys: [],
  };
}

function selectMenu(m: MenuSummary) {
  const id = m.id || m.key;
  selectedMenuId.value = id || m.name || m.type || '';
  const d = getApi();
  let detail: MenuInspectDetail | null = null;
  if (id) {
    detail =
      d?.inspectMenu({
        menuId: id,
        control: control.value,
        target: target.value,
      }) ?? null;
  }
  // Always show basic info even when live menu has no id / inspect misses.
  menuDetail.value = detail ?? detailFromSummary(m);
  void nextTick(() => {
    menuDetailRef.value?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  });
}

let sessionPollTimer: number | undefined;

onMounted(() => {
  const d =
    typeof window !== 'undefined' ? window.__hungpvqDatasetDebug : undefined;
  api.value = d ?? null;
  ready.value = Boolean(d);
  if (!d) return;
  hydrateFromSession();
  let lastRev = d.sessionRev ?? 0;
  sessionPollTimer = window.setInterval(() => {
    const live = getApi();
    if (!live) return;
    const rev = live.sessionRev ?? 0;
    if (rev === lastRev) return;
    lastRev = rev;
    hydrateFromSession();
  }, 300);
});

onBeforeUnmount(() => {
  if (sessionPollTimer != null) window.clearInterval(sessionPollTimer);
  if (highlightClearTimer.value) {
    clearTimeout(highlightClearTimer.value);
    highlightClearTimer.value = null;
  }
});
</script>
