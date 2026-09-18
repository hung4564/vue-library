import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CrosshairManager } from './CrosshairManager';
import { PrintableAreaManager } from './PrintableAreaManager';

function installDomStub() {
  const children: any[] = [];
  const parent = {
    appendChild: vi.fn((el: any) => {
      children.push(el);
      return el;
    }),
    removeChild: vi.fn((el: any) => {
      const i = children.indexOf(el);
      if (i >= 0) children.splice(i, 1);
    }),
  };

  class FakeEl {
    style: Record<string, string> = {};
    attrs: Record<string, string> = {};
    kids: any[] = [];
    setAttribute(k: string, v: string) {
      this.attrs[k] = v;
    }
    appendChild(el: any) {
      this.kids.push(el);
      return el;
    }
    append(el: any) {
      return this.appendChild(el);
    }
    remove() {
      parent.removeChild(this);
    }
  }

  const canvas = {
    clientWidth: 800,
    clientHeight: 600,
    parentElement: parent,
  } as unknown as HTMLCanvasElement;

  vi.stubGlobal('document', {
    createElementNS: (_ns: string, tag: string) => {
      const el = new FakeEl();
      (el as any).tagName = tag;
      return el;
    },
  });

  return { canvas, parent, children };
}

describe('print managers smoke', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    ({ canvas } = installDomStub());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('CrosshairManager create builds svg overlay', () => {
    const mgr = new CrosshairManager(canvas);
    mgr.create();
    expect((canvas.parentElement as any).appendChild).toHaveBeenCalled();
    mgr.mapResize();
  });

  it('PrintableAreaManager computes cut size', () => {
    const mgr = new PrintableAreaManager(canvas, {
      ratio: 1.414,
      orientation: 'landscape',
    } as any);
    mgr.create();
    const cut = mgr.getCutSize();
    expect(cut.width).toBeGreaterThan(0);
    expect(cut.height).toBeGreaterThan(0);
    mgr.mapResize();
  });
});
