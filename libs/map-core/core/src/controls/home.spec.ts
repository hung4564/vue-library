import { describe, expect, it, vi } from 'vitest';

import { captureHomeView, goHome } from './home';

describe('home control helpers', () => {
  it('captureHomeView prefers props then map', () => {
    const map = {
      getZoom: () => 8,
      getCenter: () => ({ lat: 1, lng: 2 }),
    } as any;
    expect(captureHomeView(map)).toEqual({
      zoom: 8,
      center: { lat: 1, lng: 2 },
    });
    expect(captureHomeView(map, { zoom: 3, center: [10, 20] })).toEqual({
      zoom: 3,
      center: { lat: 20, lng: 10 },
    });
  });

  it('goHome applies zoom and center', () => {
    const map = {
      setZoom: vi.fn(),
      setCenter: vi.fn(),
    } as any;
    goHome(map, { zoom: 5, center: { lat: 1, lng: 2 } });
    expect(map.setZoom).toHaveBeenCalledWith(5);
    expect(map.setCenter).toHaveBeenCalledWith({ lat: 1, lng: 2 });
  });
});
