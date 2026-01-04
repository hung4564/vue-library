import { type CoordinatesNumber } from '@hungpvq/shared-map';
import { IViewSetting } from '../types';

export class Measure {
  public value: CoordinatesNumber[];
  constructor() {
    this.value = [];
  }
  get type(): string | null {
    return null;
  }
  get setting(): any {
    return {};
  }
  get coordinates() {
    return this.value.filter((x) => x[0] != null && x[1] != null);
  }
  start() {
    return;
  }
  add(coordinate: CoordinatesNumber) {
    const index = getFirstIndexNotValid(this.value);
    if (index >= 0) {
      this.value[index] = coordinate;
    } else {
      this.value.push(coordinate);
    }
  }
  init(coordinates: CoordinatesNumber[]) {
    this.value = coordinates;
  }
  getResult(): IViewSetting {
    return {};
  }
  reset() {
    this.value = [];
  }
  destroy() {
    this.value = [];
  }
}
function getFirstIndexNotValid(coordinates: CoordinatesNumber[] = []) {
  return coordinates.findIndex((value) => !value[0] || !value[1]);
}
export function formatNumber(number: number | string, locales = 'vi') {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat(locales).format(num);
}
