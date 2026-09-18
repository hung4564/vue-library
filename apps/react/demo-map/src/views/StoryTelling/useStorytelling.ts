import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
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

type ActionPayload = Record<string, unknown>;

type Action =
  | {
      type: string;
      payload?: ActionPayload;
      custom?: false;
    }
  | {
      type: string;
      add?: () => void | Promise<void>;
      remove?: () => void | Promise<void>;
      custom: true;
    };

// Payload shapes vary per action type (mirrors Vue demo engine).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobalActionFn = (payload?: any) => {
  add?: () => void | Promise<void>;
  remove?: () => void | Promise<void>;
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

function useStorytelling(options: UseStorytellingOptions) {
  const {
    chapters,
    globalActions = {},
    autoPlay = false,
    autoNext = true,
    delayStart = 0,
    loop = false,
    speed,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed] = useState(speed || 1);

  const currentIndexRef = useRef(0);
  const currentSpeedRef = useRef(speed || 1);
  const timerRef = useRef<number | null>(null);
  const chaptersRef = useRef(chapters);
  const globalActionsRef = useRef(globalActions);
  const autoNextRef = useRef(autoNext);
  const loopRef = useRef(loop);

  chaptersRef.current = chapters;
  globalActionsRef.current = globalActions;
  autoNextRef.current = autoNext;
  loopRef.current = loop;
  currentSpeedRef.current = currentSpeed;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resolveAction = useCallback((action: Action) => {
    if (action.custom) {
      return { add: action.add, remove: action.remove };
    }
    const fn = globalActionsRef.current[action.type];
    if (fn) {
      return fn(action.payload);
    }
    return undefined;
  }, []);

  const exitCurrentChapter = useCallback(
    (nextIndex: number) => {
      const current = chaptersRef.current[currentIndexRef.current];
      const nextChapter = chaptersRef.current[nextIndex];
      const nextTypes = new Set(
        nextChapter?.actions?.map((a) => a.type) ?? [],
      );

      current?.onExit?.();

      for (const action of current?.actions ?? []) {
        if (!nextTypes.has(action.type)) {
          const resolved = resolveAction(action);
          resolved?.remove?.();
        }
      }

      clearTimer();
    },
    [clearTimer, resolveAction],
  );

  const runCurrentChapterRef = useRef<() => void>(() => undefined);

  const nextRef = useRef<() => void>(() => undefined);

  const runCurrentChapter = useCallback(() => {
    const chapter = chaptersRef.current[currentIndexRef.current];
    if (!chapter) return;

    chapter.onEnter?.();

    for (const action of chapter.actions ?? []) {
      const resolved = resolveAction(action);
      resolved?.add?.();
    }

    if (autoNextRef.current && chapter.duration) {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        chapter.onExit?.();
        nextRef.current();
      }, chapter.duration / currentSpeedRef.current);
    }
  }, [clearTimer, resolveAction]);

  runCurrentChapterRef.current = runCurrentChapter;

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= chaptersRef.current.length) return;
      exitCurrentChapter(index);
      currentIndexRef.current = index;
      setCurrentIndex(index);
      runCurrentChapterRef.current();
    },
    [exitCurrentChapter],
  );

  const next = useCallback(() => {
    if (currentIndexRef.current < chaptersRef.current.length - 1) {
      goTo(currentIndexRef.current + 1);
    } else if (loopRef.current) {
      goTo(0);
    } else {
      setIsPlaying(false);
      clearTimer();
    }
  }, [clearTimer, goTo]);

  nextRef.current = next;

  const prev = useCallback(() => {
    if (currentIndexRef.current > 0) {
      goTo(currentIndexRef.current - 1);
    }
  }, [goTo]);

  const play = useCallback(() => {
    setIsPlaying(true);
    runCurrentChapterRef.current();
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setTimeout(() => play(), delayStart);
    return () => clearTimeout(id);
  }, [autoPlay, delayStart, play]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

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
  mapIdRef: MutableRefObject<string>,
  options: UseStorytellingOptions,
) {
  const simpleActionsRef = useRef<ReturnType<typeof createSimpleMapAction>>();
  const orbitActionsRef = useRef<ReturnType<typeof createOrbitGlobalActions>>();

  if (!simpleActionsRef.current) {
    simpleActionsRef.current = createSimpleMapAction(mapIdRef);
  }
  if (!orbitActionsRef.current) {
    orbitActionsRef.current = createOrbitGlobalActions(mapIdRef);
  }

  return useStorytelling({
    ...options,
    globalActions: {
      highlightElement: (payload) => {
        const selector =
          typeof payload?.selector === 'string' ? payload.selector : '';
        return {
          add: () =>
            document.querySelector(selector)?.classList.add('highlight'),
          remove: () =>
            document.querySelector(selector)?.classList.remove('highlight'),
        };
      },
      ...(simpleActionsRef.current as unknown as Record<string, GlobalActionFn>),
      ...(orbitActionsRef.current as unknown as Record<string, GlobalActionFn>),
      ...options.globalActions,
    },
  });
}
