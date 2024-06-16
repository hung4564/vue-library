import {
  MaybeRefOrGetter,
  getUUIDv4,
  toValue,
  tryOnMounted,
  tryOnScopeDispose,
  unrefElement,
} from '@hungpvq/shared';
import { ConfigurableDocument, defaultDocument } from '@hungpvq/shared-core';
import Sortable, { type Options } from 'sortablejs';
import { Ref, nextTick, ref } from 'vue';

export interface UseSortableReturn<T> {
  /**
   * start sortable instance
   */
  start: () => void;
  /**
   * destroy sortable instance
   */
  stop: () => void;
  setCache: (items: T[]) => void;

  /**
   * Options getter/setter
   * @param name a Sortable.Options property.
   * @param value a value.
   */
  option: (<K extends keyof Sortable.Options>(
    name: K,
    value: Sortable.Options[K]
  ) => void) &
    (<K extends keyof Sortable.Options>(name: K) => Sortable.Options[K]);
  items: Ref<T[]>;
}

export type UseSortableOptions = Options & ConfigurableDocument;

export function useStoreSortable<T>(
  selector: string,
  list: { get: () => T[]; set: (value: T[]) => void },
  options?: UseSortableOptions
): UseSortableReturn<T>;
export function useStoreSortable<T>(
  el: MaybeRefOrGetter<HTMLElement | null | undefined>,
  list: { get: () => T[]; set: (value: T[]) => void },
  options?: UseSortableOptions
): UseSortableReturn<T>;

/**
 * Wrapper for sortablejs.
 * @param el
 * @param list
 * @param options
 */
export function useStoreSortable<T extends { id: string }>(
  el: MaybeRefOrGetter<HTMLElement | null | undefined> | string,
  list: { get: () => T[]; set: (value: T[]) => void },
  options: UseSortableOptions = {}
): UseSortableReturn<T> {
  let group_name = getUUIDv4();
  const items = ref(list.get() || []) as Ref<T[]>;
  if (options && options.group) {
    group_name =
      typeof options.group == 'string' ? options.group : options.group.name;
  }
  let sortable: Sortable | undefined;

  const {
    document = defaultDocument,
    onAdd,
    onRemove,
    ...resetOptions
  } = options;
  const defaultOptions: Options = {
    store: {
      get() {
        // When the list is a ref, make a shallow copy of it to avoid repeatedly triggering side effects when moving elements
        const array = toValue(list.get());
        return array.map((x) => x.id);
      },
      set(e) {
        const ids = e.toArray();
        const tmp = ids.map<T>((cur) => store.value[group_name][cur]);
        list.set(tmp);
        items.value = tmp;
      },
    },
    onAdd(e) {
      sortable?.save();
      onAdd && onAdd(e);
    },
    onRemove(e) {
      sortable?.save();
      onRemove && onRemove(e);
    },
  };

  const start = () => {
    const array = toValue(list.get());
    items.value = array;
    setListCache(array, group_name);
    const target =
      typeof el === 'string' ? document?.getElementById(el) : unrefElement(el);

    if (!target || sortable !== undefined) return;
    sortable = new Sortable(target as HTMLElement, {
      ...defaultOptions,
      ...resetOptions,
    });
  };

  const stop = () => {
    sortable?.destroy();
    sortable = undefined;
  };

  const option = <K extends keyof Options>(name: K, value?: Options[K]) => {
    if (value !== undefined) sortable?.option(name, value);
    else return sortable?.option(name);
  };
  const setCache = (value: T[] = []) => {
    setListCache(value, group_name);
    items.value = value;
  };
  tryOnMounted(start);

  tryOnScopeDispose(stop);

  return {
    stop,
    start,
    option: option as UseSortableReturn<T>['option'],
    items,
    setCache,
  };
}

const store = ref<Record<string, Record<string, any>>>({});
function setListCache(items: any[], group_name: string) {
  if (!store.value[group_name]) {
    store.value[group_name] = {};
  }
  items.forEach((item) => (store.value[group_name][item.id] = item));
}

export function moveArrayElement<T>(
  list: { get: () => T[]; set: (value: T[]) => void },
  from: number,
  to: number
): void {
  // When the list is a ref, make a shallow copy of it to avoid repeatedly triggering side effects when moving elements
  const array = list.get();
  if (to >= 0 && to < array.length) {
    const element = array.splice(from, 1)[0];
    nextTick(() => {
      array.splice(to, 0, element);
      // When list is ref, assign array to list.value
      list.set(array);
    });
  }
}
