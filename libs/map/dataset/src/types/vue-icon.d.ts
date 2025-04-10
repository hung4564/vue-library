declare module '@jamescoyle/vue-icon' {
  import { DefineComponent } from 'vue';

  const SvgIcon: DefineComponent<{
    type: string;
    path: string;
    size?: string | number;
    viewBox?: string;
    flip?: 'horizontal' | 'vertical' | 'both';
    rotate?: number;
    title?: string;
  }>;

  export default SvgIcon;
}
