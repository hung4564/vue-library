/**
 * @experimental Field / lightweight UI helpers.
 * Published on `@hungpvq/react-map-core/fields` (not the package root).
 * May change in a minor — see libs/map-core/core/docs/core/stable-api.md.
 *
 * Canonical names: `BaseCollapse`, `InputTextArea`.
 * Aliases kept for cross-framework parity: `Collapse`, `InputTextarea`.
 * Action buttons: use Stable root `MapControlButton` (not a fields export).
 */
export { BaseCollapse, BaseCollapse as Collapse } from './base-collapse';
export type { BaseCollapseProps } from './base-collapse';
export * from './drag-drop-file';
export * from './input-checkbox';
export * from './input-crs';
export * from './input-choose';
export * from './input-colorPicker';
export * from './input-file';
export * from './input-select';
export * from './input-slider';
export * from './input-text';
export {
  InputTextarea,
  InputTextarea as InputTextArea,
} from './input-textarea';
export type { InputTextareaProps as InputTextAreaProps } from './input-textarea';
