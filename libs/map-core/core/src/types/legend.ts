/**
 * Framework-agnostic legend types
 */

/**
 * Legend item interface
 */
export interface LegendItem {
  id: string;
  title: string;
  visible: boolean;
}

/**
 * Layer configuration interface
 */
export interface LayerConfig {
  id: string;
  title?: string;
  visible?: boolean;
}
