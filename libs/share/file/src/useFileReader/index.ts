export type UseFileReaderOption = {
  type: 'text' | 'arraybuffer' | 'binary';
  onSuccess: (result: any) => void | undefined;
  onError: (err: any) => void;
  parser: IParser;
};
export function useFileReader(options: Partial<UseFileReaderOption> = {}) {
  const reader = new Reader();
  async function read(file: File, opt: Partial<UseFileReaderOption> = {}) {
    return reader.read(file, Object.assign({}, options, opt));
  }
  return { read };
}
class Reader {
  async read(file: File, opt: Partial<UseFileReaderOption> = {}) {
    const parser = opt.parser || this.getParser(file);
    const type = opt.type || 'text';
    const onSuccess = opt.onSuccess;
    const onError = opt.onError;
    try {
      let data = await FileReaderHelper.read(file, type);
      if (parser) data = await parser.parse(data, file);
      onSuccess && onSuccess(data);
      return data;
    } catch (error) {
      onError && onError(error);
      throw error;
    }
  }
  getParser(file: File): IParser | void {
    // get file extension
    const ext = FileReaderHelper.getExtension(file);
    switch (ext) {
      case 'geojson':
      case 'json':
        return new GeoJSONParser();
    }
  }
}
class FileReaderHelper {
  static getExtension(file: File) {
    return file.name.split('.').pop();
  }
  static async read(
    file: File,
    type: UseFileReaderOption['type']
  ): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.onload = (e) => e.target && resolve(e.target.result);
      reader.onerror = (err) => reject(err);

      if (type === 'text') {
        reader.readAsText(file);
      } else if (type === 'arraybuffer') {
        reader.readAsArrayBuffer(file);
      } else if (type === 'binary') {
        reader.readAsDataURL(file);
      } else {
        reject(new Error(`Read file as ${type} is not available`));
      }
    });
  }
}
type IParser = {
  parse(data: FileReader['result'], file: File): Promise<any>;
};
export default class GeoJSONParser implements IParser {
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  parse(data: string, file: File) {
    const geojson = JSON.parse(data);
    return Promise.resolve(this.toGeojson(geojson));
  }
  toGeojson(geojson: any) {
    if (!geojson.crs) {
      return geojson;
    }
    return geojson;
  }
}
