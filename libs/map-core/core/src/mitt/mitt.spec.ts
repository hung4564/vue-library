import { describe, expect, it, vi } from 'vitest';
import { createMapMitt } from './index';

describe('createMapMitt', () => {
  it('emits typed events to subscribers', () => {
    type Events = { ready: { id: string }; ping: undefined };
    const bus = createMapMitt<Events>();
    const onReady = vi.fn();
    bus.on('ready', onReady);
    bus.emit('ready', { id: 'm1' });
    expect(onReady).toHaveBeenCalledWith({ id: 'm1' });
  });

  it('forwards all events to onAny via *', () => {
    const onAny = vi.fn();
    const bus = createMapMitt<{ tick: number }>(onAny);
    bus.emit('tick', 3);
    expect(onAny).toHaveBeenCalledWith('tick', 3);
  });
});
