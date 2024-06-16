import { saveAs } from 'file-saver';
export function exportFile(
  canvas: HTMLCanvasElement,
  format: 'pdf' | 'png' | 'jpg',
  fileName = 'map'
) {
  switch (format) {
    case Format.PNG:
      toPNG(canvas, fileName);
      break;
    case Format.JPEG:
      toJPEG(canvas, fileName);
      break;
    default:
      console.error(`Invalid file format: ${format}`);
      break;
  }
}
function toPNG(canvas: HTMLCanvasElement, fileName: string) {
  saveAs(canvas.toDataURL(), `${fileName}.png`);
}
function toJPEG(canvas: HTMLCanvasElement, fileName: string) {
  saveAs(canvas.toDataURL(), `${fileName}.jpg`);
}
export const Format = {
  JPEG: 'jpg',
  PNG: 'png',
  PDF: 'pdf',
} as const;
export type FormatType = (typeof Format)[keyof typeof Format];
