import type { EventHookOn } from '@hungpv97/shared';
import { createEventHook, hasOwn } from '@hungpv97/shared';
import { ConfigurableDocument, defaultDocument } from '@hungpv97/shared-core';
import { readonly, ref, type Ref } from 'vue';

export interface UseFileDialogOptions extends ConfigurableDocument {
  /**
   * @default true
   */
  multiple?: boolean;
  /**
   * @default '*'
   */
  accept?: string;
  /**
   * Select the input source for the capture file.
   * @see [HTMLInputElement Capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
   */
  capture?: string;
  /**
   * Reset when open file dialog.
   * @default false
   */
  reset?: boolean;
  /**
   * Select directories instead of files.
   * @see [HTMLInputElement webkitdirectory](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)
   * @default false
   */
  directory?: boolean;
}

const DEFAULT_OPTIONS: UseFileDialogOptions = {
  multiple: true,
  accept: '*',
  reset: false,
  directory: false,
};

export interface UseFileDialogReturn {
  files: Ref<FileList | null>;
  open: (localOptions?: Partial<UseFileDialogOptions>) => void;
  reset: () => void;
  onChange: EventHookOn<FileList | null>;
}

export function useFileDialog(
  options: UseFileDialogOptions = {}
): UseFileDialogReturn {
  const { document = defaultDocument } = options;

  const files = ref<FileList | null>(null);
  const { on: onChange, trigger } = createEventHook();
  let input: HTMLInputElement | undefined;
  if (document) {
    input = document.createElement('input');
    input.type = 'file';

    input.onchange = (event: Event) => {
      const result = event.target as HTMLInputElement;
      files.value = result.files;
      trigger(files.value);
    };
  }

  const reset = () => {
    files.value = null;
    if (input && input.value) {
      input.value = '';
      trigger(null);
    }
  };

  const open = (localOptions?: Partial<UseFileDialogOptions>) => {
    if (!input) return;
    const _options = {
      ...DEFAULT_OPTIONS,
      ...options,
      ...localOptions,
    };
    input.multiple = _options.multiple!;
    input.accept = _options.accept!;
    // webkitdirectory key is not stabled, maybe replaced in the future.
    input.webkitdirectory = _options.directory!;
    if (hasOwn(_options, 'capture')) input.capture = _options.capture!;
    if (_options.reset) reset();
    input.click();
  };

  return {
    files: readonly(files),
    open,
    reset,
    onChange,
  };
}
