import { reactify } from '@hungpv97/shared';
import YAML from 'js-yaml';

export const stringify = reactify((input: any) =>
  YAML.dump(input, {
    skipInvalid: true,
    forceQuotes: true,
    condenseFlow: true,
    noCompatMode: true,
    quotingType: "'",
  })
);
