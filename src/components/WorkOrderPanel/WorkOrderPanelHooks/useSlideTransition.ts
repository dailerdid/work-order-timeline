import { useEffect, useState } from 'react';

// Keep in sync with $slide in WorkOrderPanel.scss
const SLIDE_MS = 220;

/**
 * Slide-in / slide-out for a panel: `open` flips to true right after mount (so the CSS
 * transition plays), and `close()` waits for the slide-out to finish before calling `onClosed`
 * (which unmounts the panel).
 */
export const useSlideTransition = (onClosed: () => void) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = () => {
    setOpen(false);
    window.setTimeout(onClosed, SLIDE_MS);
  };

  return { open, close };
};
