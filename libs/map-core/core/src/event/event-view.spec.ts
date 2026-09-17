import { describe, expect, it } from 'vitest';
import { groupEventsByMapType, isEventActive } from './event-view';
import type { IEvent } from './model/Event';

function ev(id: string, event_map_type: string): IEvent {
  return { id, event_map_type } as IEvent;
}

describe('event-view', () => {
  it('isEventActive matches id for map type', () => {
    const a = ev('a', 'click');
    const b = ev('b', 'click');
    expect(isEventActive({ click: a }, a)).toBe(true);
    expect(isEventActive({ click: a }, b)).toBe(false);
    expect(isEventActive({}, a)).toBe(false);
  });

  it('groupEventsByMapType buckets by event_map_type', () => {
    const a = ev('a', 'click');
    const b = ev('b', 'click');
    const c = ev('c', 'contextmenu');
    expect(groupEventsByMapType([a, b, c])).toEqual({
      click: [a, b],
      contextmenu: [c],
    });
  });
});
