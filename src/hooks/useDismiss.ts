import { RefObject, useEffect, useRef } from 'react';

/** Calls `handler` when Escape is pressed (only while `active`). */
export const useEscapeKey = (handler: () => void, active = true) => {
  // Always call the latest handler without re-subscribing on every render
  const latest = useRef(handler);
  latest.current = handler;

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && latest.current();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);
};

interface DismissOptions {
  /** Clicks inside any of these elements do not dismiss */
  insideRefs: RefObject<Element | null>[];
  /** Also dismiss when anything scrolls (for popups positioned with fixed coordinates) */
  closeOnScroll?: boolean;
}

/** Dismisses a popup on outside click, Escape and (optionally) scroll - only while `active`. */
export const useDismiss = (active: boolean, onDismiss: () => void, options: DismissOptions) => {
  const latest = useRef(onDismiss);
  latest.current = onDismiss;
  const opts = useRef(options);
  opts.current = options;

  useEscapeKey(onDismiss, active);

  useEffect(() => {
    if (!active) return;
    const dismiss = () => latest.current();
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (opts.current.insideRefs.some((ref) => ref.current?.contains(target))) return;
      dismiss();
    };
    document.addEventListener('mousedown', onDown);
    const scroll = !!opts.current.closeOnScroll;
    if (scroll) window.addEventListener('scroll', dismiss, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      if (scroll) window.removeEventListener('scroll', dismiss, true);
    };
  }, [active]);
};
