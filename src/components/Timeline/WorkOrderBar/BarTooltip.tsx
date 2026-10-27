import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { WorkOrderDocument } from '../../../types/timeline';
import { formatDateShort } from '../../../utils/dates';
import { STATUS_LABEL } from '../../../utils/status';

const SHOW_DELAY_MS = 300;
// Half of the tooltip's max width: keeps it inside the window near the edges
const EDGE_MARGIN_PX = 140;

interface Props {
  /** The bar the tooltip belongs to; hover is tracked on it */
  anchorRef: RefObject<HTMLElement | null>;
  order: WorkOrderDocument;
  /** True while something else (the actions menu) is open */
  disabled: boolean;
}

interface Pos {
  top: number;
  left: number;
}

const clampX = (x: number) => Math.min(Math.max(x, EDGE_MARGIN_PX), window.innerWidth - EDGE_MARGIN_PX);

/** Hover tooltip: shown after a short delay above the bar, follows the cursor sideways. */
export const BarTooltip = ({ anchorRef, order, disabled }: Props) => {
  const { name, status, startDate, endDate } = order.data;
  const [pos, setPos] = useState<Pos | null>(null);
  const timer = useRef<number | undefined>(undefined);
  // Latest cursor x, so the delayed show starts where the cursor is NOW, not where it entered
  const cursorX = useRef(0);

  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    setPos(null);
  }, []);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || disabled) return;

    const onEnter = (e: MouseEvent) => {
      cursorX.current = e.clientX;
      const top = anchor.getBoundingClientRect().top;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setPos({ top, left: clampX(cursorX.current) }), SHOW_DELAY_MS);
    };
    const onMove = (e: MouseEvent) => {
      cursorX.current = e.clientX;
      // Only moves a tooltip that is already visible; before that the delay timer is running
      setPos((p) => (p ? { top: p.top, left: clampX(e.clientX) } : p));
    };

    anchor.addEventListener('mouseenter', onEnter);
    anchor.addEventListener('mousemove', onMove);
    anchor.addEventListener('mouseleave', hide);
    return () => {
      anchor.removeEventListener('mouseenter', onEnter);
      anchor.removeEventListener('mousemove', onMove);
      anchor.removeEventListener('mouseleave', hide);
      hide(); // also covers `disabled` turning on and the bar unmounting
    };
  }, [anchorRef, disabled, hide]);

  useEffect(() => {
    if (!pos) return;
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, [pos, hide]);

  if (!pos) return null;
  return createPortal(
    <div className="bar-tooltip" role="tooltip" style={{ top: pos.top, left: pos.left }}>
      <strong className="bar-tooltip__name">{name}</strong>
      {/* Same coloured pill as the status field in the panel */}
      <span className={`status-pill status-pill--${status} bar-tooltip__status`}>{STATUS_LABEL[status]}</span>
      <span>
        {formatDateShort(startDate)} – {formatDateShort(endDate)}
      </span>
    </div>,
    document.body,
  );
};
