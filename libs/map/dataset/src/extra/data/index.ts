export interface WithDataHelper<T = any> {
  getData(): T;
  setData(data: T): void;
}
export function createWithDataHelper<T>(data: T): WithDataHelper {
  let _temp_data: T = data;
  return {
    getData(): T {
      return _temp_data;
    },
    setData(newData: T) {
      _temp_data = newData;
    },
  };
}
