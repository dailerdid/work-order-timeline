import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Zoom } from '../timeline.types';

// Keep in sync with $labels-width / $labels-width-mobile in styles/_variables.scss
const labelsWidth = () => (window.innerWidth <= 768 ? 150 : 381);

/**
 * Scrolling behaviour of the timeline container (returns the ref to attach to it):
 * - starts (and re-starts on every zoom change) with today in the middle of the visible grid;
 * - every time `todayRequest` increases (the "Today" button) it glides back to today;
 * - the horizontal scrollbar is hidden, so the mouse wheel scrolls sideways.
 */
export const useTimelineScroll = (zoom: Zoom, todayPx: number, todayRequest: number) => {
  const ref = useRef<HTMLDivElement>(null);

  // Visible grid width = container width - sticky labels column
  const centerOnToday = useCallback(
    (behavior: ScrollBehavior) => {
      const el = ref.current;
      if (!el) return;
      const left = Math.max(0, todayPx - (el.clientWidth - labelsWidth()) / 2);
      // scrollTo with a behavior is missing in some environments (e.g. jsdom in tests)
      if (typeof el.scrollTo === 'function') el.scrollTo({ left, behavior });
      else el.scrollLeft = left;
    },
    [todayPx],
  );

  // Initial position and every zoom change: jump instantly
  useLayoutEffect(() => centerOnToday('auto'), [zoom, centerOnToday]);

  // "Today" button: glide. The ref remembers the last handled request, so a later zoom change
  // (which re-creates centerOnToday) does not trigger a second animated scroll.
  const handledRequest = useRef(todayRequest);
  useEffect(() => {
    if (todayRequest === handledRequest.current) return;
    handledRequest.current = todayRequest;
    centerOnToday('smooth');
  }, [todayRequest, centerOnToday]);

  // Needs a native non-passive listener: React's onWheel cannot call preventDefault.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const hasVerticalOverflow = el.scrollHeight > el.clientHeight;
      // Trackpads already send deltaX; with vertical overflow keep the normal vertical scroll
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY) || (hasVerticalOverflow && !e.shiftKey)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return ref;
};
