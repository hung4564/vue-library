import { onUnmounted, Ref, ref } from 'vue';
import {
  createOrbitGlobalActions,
  createSimpleMapAction,
} from './helper-global';

export interface Chapter {
  id: string;
  duration?: number;
  onEnter?: () => void;
  onExit?: () => void;
  actions?: Action[];
}

export type Action =
  | {
      type: string;
      payload?: any;
      custom?: false;
    }
  | {
      type: string;
      add?: () => void | Promise<void>;
      remove?: () => void | Promise<void>;
      custom: true;
    };

export type GlobalActionFn = (payload?: any) => {
  add?: () => any | Promise<any>;
  remove?: () => any | Promise<any>;
};

export interface UseStorytellingOptions {
  chapters: Chapter[];
  globalActions?: Record<string, GlobalActionFn>;
  autoPlay?: boolean;
  autoNext?: boolean;
  delayStart?: number;
  loop?: boolean;
  speed?: number;
}

export function useStorytelling(options: UseStorytellingOptions) {
  const {
    chapters,
    globalActions = {},
    autoPlay = false,
    autoNext = true,
    delayStart = 0,
    loop = false,
    speed,
  } = options;

  const currentIndex = ref(0);
  const isPlaying = ref(false);
  const currentSpeed = ref(speed || 1);
  let timer: number | null = null;

  const play = () => {
    isPlaying.value = true;
    runCurrentChapter();
  };

  const pause = () => {
    isPlaying.value = false;
    clearTimer();
  };

  const next = () => {
    if (currentIndex.value < chapters.length - 1) {
      goTo(currentIndex.value + 1);
    } else if (loop) {
      goTo(0);
    } else {
      pause();
    }
  };

  const prev = () => {
    if (currentIndex.value > 0) {
      goTo(currentIndex.value - 1);
    }
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= chapters.length) return;
    exitCurrentChapter(index);
    currentIndex.value = index;
    runCurrentChapter();
  };

  const runCurrentChapter = () => {
    const chapter = chapters[currentIndex.value];
    console.log('test', currentIndex.value, 'start');
    console.log('test', currentIndex.value, 'start', 'chapter', chapter);
    chapter.onEnter?.();

    for (const action of chapter.actions ?? []) {
      console.log('test', currentIndex.value, 'start', 'action', action);
      const resolved = resolveAction(action);
      resolved?.add?.();
    }

    if (autoNext && chapter.duration) {
      clearTimer();
      timer = window.setTimeout(() => {
        console.log('test', currentIndex.value, 'start', 'exit');
        chapter.onExit?.();
        next();
      }, chapter.duration / currentSpeed.value);
    }
  };

  const exitCurrentChapter = (nextIndex: number) => {
    console.log('test', currentIndex.value, 'end', 'exit');
    const current = chapters[currentIndex.value];
    console.log('test', currentIndex.value, 'end', 'chapter', current);
    const next = chapters[nextIndex];
    const nextTypes = new Set(next?.actions?.map((a) => a.type) ?? []);

    current?.onExit?.();

    for (const action of current?.actions ?? []) {
      console.log(
        'test',
        currentIndex.value,
        'end',
        'action',
        action,
        nextTypes,
        nextTypes.has(action.type)
      );
      if (!nextTypes.has(action.type)) {
        const resolved = resolveAction(action);
        resolved?.remove?.();
        console.log('test', currentIndex.value, 'end', 'remove action', action);
      }
    }

    clearTimer();
  };

  const resolveAction = (action: Action) => {
    if (action.custom) {
      return { add: action.add, remove: action.remove };
    }
    if (globalActions[action.type]) {
      return globalActions[action.type](action.payload);
    }
    return undefined;
  };

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  if (autoPlay) {
    setTimeout(play, delayStart);
  }

  onUnmounted(() => {
    clearTimer();
  });

  return {
    currentIndex,
    currentSpeed,
    isPlaying,
    play,
    pause,
    next,
    prev,
    goTo,
  };
}

export function useMapStorytelling(
  mapId: Ref<string>,
  options: UseStorytellingOptions
) {
  return useStorytelling({
    ...options,
    globalActions: {
      highlightElement: ({ selector }) => ({
        add: () => document.querySelector(selector)?.classList.add('highlight'),
        remove: () =>
          document.querySelector(selector)?.classList.remove('highlight'),
      }),
      ...createSimpleMapAction(mapId),
      ...createOrbitGlobalActions(mapId),
      ...options.globalActions,
    },
  });
}
