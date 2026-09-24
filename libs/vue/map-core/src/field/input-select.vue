<script
  setup
  lang="ts"
  generic="
    TItem = { value: string | number; text: string },
    TValue = string | number
  "
>
const model = defineModel<TValue>();

const props = withDefaults(
  defineProps<{
    label?: string;
    items?: TItem[];
    itemValue?: TItem extends object ? keyof TItem : string;
    itemText?: TItem extends object ? keyof TItem : string;
    returnObject?: boolean;
  }>(),
  {
    items: () => [] as TItem[],
    itemValue: 'value' as any,
    itemText: 'text' as any,
    returnObject: false,
  },
);

function getValue(item: TItem): TValue {
  if (
    typeof item === 'string' ||
    typeof item === 'number' ||
    props.returnObject
  ) {
    return item as unknown as TValue;
  }
  if (item && typeof item === 'object' && props.itemValue) {
    return (item as any)[props.itemValue] as TValue;
  }
  return item as unknown as TValue;
}

function getText(item: TItem): string {
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item);
  }
  if (item && typeof item === 'object' && props.itemText) {
    return String((item as any)[props.itemText]);
  }
  return String(item);
}

function getKey(item: TItem): string | number {
  if (typeof item === 'string' || typeof item === 'number') {
    return item;
  }
  if (item && typeof item === 'object' && props.itemValue) {
    return String((item as any)[props.itemValue]);
  }
  return String(item);
}
</script>
<template>
  <div class="form-group">
    <label v-if="label">
      {{ label }}
    </label>
    <div class="input-container">
      <select class="input-select" v-bind="$attrs" v-model="model">
        <option v-if="$attrs.placeholder" value="" disabled hidden>
          {{ $attrs.placeholder as string }}
        </option>
        <option
          :value="getValue(item)"
          v-for="item in items"
          :key="getKey(item)"
        >
          {{ getText(item) }}
        </option>
      </select>
    </div>
  </div>
</template>
