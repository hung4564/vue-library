import { PrintOption } from '../../store';

export class PrintableAreaManager {
  private mapCanvas: HTMLCanvasElement;
  private option!: PrintOption;
  private svgCanvas?: SVGSVGElement;
  private cutWidth?: number;
  private cutHeight?: number;
  private cutStartX?: number;
  private cutStartY?: number;
  private svgPath?: SVGPathElement;
  constructor(canvas: HTMLCanvasElement, options: PrintOption) {
    this.mapCanvas = canvas;
    this.setOption(options);
  }
  getCutSize() {
    return {
      width: this.cutWidth!,
      height: this.cutHeight!,
      startX: this.cutStartX!,
      startY: this.cutStartY!,
    };
  }
  mapResize() {
    this.generateCutOut();
  }
  create() {
    this.createCanvas(this.mapCanvas.parentElement!);
    this.generateCutOut();
  }
  createCanvas(container: HTMLElement) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    const clientWidth = this.mapCanvas.clientWidth;
    const clientHeight = this.mapCanvas.clientHeight;
    svg.style.position = 'absolute';
    svg.style.top = '0px';
    svg.style.left = '0px';
    (svg.style as any)['pointer-events'] = 'none';
    svg.setAttribute('width', `${clientWidth}px`);
    svg.setAttribute('height', `${clientHeight}px`);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('style', 'fill:#888888;stroke-width:0');
    path.setAttribute('fill-opacity', '0.5');
    svg.append(path);
    container.appendChild(svg);
    this.svgCanvas = svg;
    this.svgPath = path;
  }
  generateCutOut() {
    if (this.svgCanvas === undefined || this.svgPath === undefined) {
      return;
    }
    const clientWidth = this.mapCanvas.clientWidth;
    const clientHeight = this.mapCanvas.clientHeight;
    const ratio = this.option.ratio;
    let maxLength = clientHeight;
    if (maxLength > clientWidth) {
      maxLength = clientWidth;
    }
    let width_calc = 0,
      height_calc = 0;
    if (ratio >= 1) {
      width_calc = Math.floor((maxLength * 4) / 5 - 30);
      height_calc = width_calc / ratio;
    } else {
      height_calc = Math.floor((maxLength * 4) / 5 - 30);
      width_calc = Math.floor(height_calc * ratio);
    }
    if (this.option.orientation !== 'landscape') {
      if (width_calc > height_calc) {
        const temp = height_calc;
        height_calc = width_calc;
        width_calc = temp;
      }
    } else {
      if (width_calc < height_calc) {
        const temp = height_calc;
        height_calc = width_calc;
        width_calc = temp;
      }
    }
    this.cutStartX = clientWidth / 2 - width_calc / 2;
    this.cutStartY = clientHeight / 2 - height_calc / 2;
    const height = height_calc;
    const width = width_calc;
    this.cutWidth = width_calc;
    this.cutHeight = height_calc;
    const startX = this.cutStartX;
    const endX = startX + width;
    const startY = this.cutStartY;
    const endY = startY + height;

    this.svgCanvas.setAttribute('width', `${clientWidth}px`);
    this.svgCanvas.setAttribute('height', `${clientHeight}px`);
    this.svgPath.setAttribute(
      'd',
      `M 0 0 L ${clientWidth} 0 L ${clientWidth} ${clientHeight} L 0 ${clientHeight} M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY} L ${endX} ${startY}`
    );
  }
  setOption(option: PrintOption) {
    this.option = option;
    this.generateCutOut();
  }
  destroy() {
    if (this.svgCanvas !== undefined) {
      this.svgCanvas.remove();
      this.svgCanvas = undefined;
    }
  }
}
