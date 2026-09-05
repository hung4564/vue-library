<script>
export default {
  props: {
    value: {},
    label: String,
    accept: String,
    multiple: Boolean,
  },
  emits: ['change'],
  computed: {
    model: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  methods: {
    onChangeFile(event) {
      const files = Array.from(event.target.files);
      if (files.length > 0)
        this.$emit('change', this.multiple ? files : files[0]);
      const input = this.$refs.file;
      if (input) {
        input.type = 'text';
        input.type = 'file';
        input.value = '';
      }
    },
  },
};
</script>
<template>
  <div class="form-group">
    <label v-if="label">
      {{ label }}
    </label>
    <div class="input-container">
      <input
        ref="file"
        @change="onChangeFile"
        type="file"
        :accept="accept"
        :multiple="multiple"
      />
    </div>
  </div>
</template>
