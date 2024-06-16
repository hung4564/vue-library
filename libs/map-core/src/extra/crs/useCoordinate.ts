import proj4 from 'proj4';
import { getCrsItem } from './store';
import { CrsItem } from './types';
export function useCoordinate(mapId: string) {
  function format(
    { longitude, latitude }: { longitude: number; latitude: number },
    isDMS = false
  ) {
    const crs: CrsItem =
      getCrsItem(mapId) ||
      ({
        name: 'WGS 84',
        epsg: '4326',
        default: true,
        unit: 'degree',
      } as CrsItem);
    return formatCoordinate({ longitude, latitude }, crs, isDMS);
  }
  return { format };
}
export function formatCoordinate(
  { longitude, latitude }: { longitude: number; latitude: number },
  crs?: CrsItem,
  isDMS = false
) {
  const currentPoint = { longitude: '0', latitude: '0' };
  if (!longitude || !latitude) return currentPoint;
  if (crs && !crs.default && crs.proj4js) {
    [longitude, latitude] = proj4(crs.proj4js, [longitude, latitude]);
  }
  if (crs && crs.unit === 'meter') {
    currentPoint.longitude = longitude.toFixed(0);
    currentPoint.latitude = latitude.toFixed(0);
  } else {
    if (isDMS) {
      currentPoint.longitude = lngDMS(+longitude);
      currentPoint.latitude = latDMS(+latitude);
    } else {
      currentPoint.longitude = longitude.toFixed(6);
      currentPoint.latitude = latitude.toFixed(6);
    }
  }
  return currentPoint;
}
export function deg_to_dms(deg: number) {
  let d = Math.floor(deg);
  const minFloat = (deg - d) * 60;
  let m = Math.floor(minFloat);
  const secFloat = (minFloat - m) * 60;
  let s = Math.round(secFloat);
  // After rounding, the seconds might become 60. These two
  // if-tests are not necessary if no rounding is done.
  if (s == 60) {
    m++;
    s = 0;
  }
  if (m == 60) {
    d++;
    m = 0;
  }
  return { deg: d, min: m, sec: s };
}
export function dms_to_des(
  { deg, min, sec }: { deg: number; min: number; sec: number } = {
    deg: 0,
    min: 0,
    sec: 0,
  }
) {
  const result = (Number(deg) + Number(min) / 60 + Number(sec) / 3600).toFixed(
    6
  );
  return result;
}
export function deg_to_dms_string(str: number) {
  const { deg, min, sec } = deg_to_dms(str);

  return (
    deg +
    '° ' +
    (min + '').padStart(2, '0') +
    '′ ' +
    (sec + '').padStart(2, '0') +
    '″'
  );
}
export const latDMS = (lat: number) => {
  return `${dcToDeg(lat)}° ${dcToMin(lat)}' ${parseFloat(
    dcToSec(lat).toFixed(2)
  )}" ${lat > 0 ? 'N' : 'S'}`;
};

export const lngDMS = (lng: number) => {
  return `${dcToDeg(lng)}° ${dcToMin(lng)}' ${parseFloat(
    dcToSec(lng).toFixed(2)
  )}" ${lng > 0 ? 'E' : 'W'}`;
};

const dcToDeg = (val: number) => {
  if (val === 0) {
    return 0;
  }
  return Math.floor(Math.abs(val));
};

const dcToMin = (val: number) => {
  if (val === 0) {
    return 0;
  }
  return Math.floor((Math.abs(val) - Math.floor(Math.abs(val))) * 60);
};

const dcToSec = (val: number) => {
  if (val === 0) {
    return 0;
  }
  return (Math.abs(val) - dcToDeg(val) - dcToMin(val) / 60) * 3600;
};
