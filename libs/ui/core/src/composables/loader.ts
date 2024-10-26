import { computed } from 'vue';
import { getCurrentInstanceName } from '../utils/getCurrentInstance';
import { propsFactory } from '../utils/propsFactory';

export interface LoaderProps {
  loading?: boolean | string;
}
export const makeLoaderProps = propsFactory(
  {
    loading: [Boolean, String],
  },
  'loader'
);

export function useLoader(props: LoaderProps, name = getCurrentInstanceName()) {
  const loaderClasses = computed(() => ({
    [`${name}--loading`]: props.loading,
  }));

  return { loaderClasses };
}
