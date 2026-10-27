import { MouseEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDismiss } from '../../../hooks/useDismiss';
import { WorkOrderDocument } from '../../../types/timeline';
import { TimelineScale } from '../timeline.types';
import { rangeToBox } from '../TimelineHooks/useTimelineRange';
import { STATUS_LABEL } from '../../../utils/status';
import { BarTooltip } from './BarTooltip';
import './WorkOrderBar.scss';

// Narrower bars hide the status pill so the name keeps room; the actions button always stays.
const HIDE_PILL_BELOW_PX = 170;

interface Props {
  order: WorkOrderDocument;
  /** Scale of the grid the bar is drawn on */
  scale: TimelineScale;
  onEdit: (order: WorkOrderDocument) => void;
  onDelete: (docId: string) => void;
}

export const WorkOrderBar = ({ order, scale, onEdit, onDelete }: Props) => {
  const { name, status, startDate, endDate } = order.data;
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const { left, width } = rangeToBox(startDate, endDate, scale);

  // Close the menu on outside click, Escape or scroll (it is positioned with fixed coords).
  useDismiss(!!menuPos, () => setMenuPos(null), {
    insideRefs: [buttonRef, menuRef],
    closeOnScroll: true,
  });

  const toggleMenu = (e: MouseEvent) => {
    e.stopPropagation();
    if (menuPos) return setMenuPos(null);
    const rect = buttonRef.current!.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, left: rect.left - 12 });
  };

  return (
    <div
      ref={barRef}
      className={`bar bar--${status}${menuPos ? ' is-menu-open' : ''}`}
      style={{ left, width }}
      // A click on a bar must not count as a click on the empty row (create flow)
      onClick={(e) => e.stopPropagation()}
    >
      <span className="bar__name" title={name}>
        {name}
      </span>
      {width >= HIDE_PILL_BELOW_PX && <span className="bar__status">{STATUS_LABEL[status]}</span>}
      {/* Always rendered: the actions button must stay reachable at every zoom level */}
      <button
        ref={buttonRef}
        type="button"
        className="bar__menu-btn"
        aria-label={`Actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={!!menuPos}
        onClick={toggleMenu}
      >
        {/* Three dots from the design: 24x22 box, 0.75 radius + 1.4 round stroke */}
        <svg width="24" height="22" viewBox="0 0 24 22" strokeWidth="1.4" aria-hidden="true">
          <circle cx="6.75" cy="11.69" r="0.75" />
          <circle cx="12" cy="11.69" r="0.75" />
          <circle cx="17.25" cy="11.69" r="0.75" />
        </svg>
      </button>

      {/* Hover tooltip with the full details; hidden while the actions menu is open */}
      <BarTooltip anchorRef={barRef} order={order} disabled={!!menuPos} />

      {menuPos &&
        createPortal(
          <ul ref={menuRef} className="bar-menu" role="menu" style={{ top: menuPos.top, left: menuPos.left }}>
            <li
              role="menuitem"
              onClick={() => {
                setMenuPos(null);
                onEdit(order);
              }}
            >
              Edit
            </li>
            <li
              role="menuitem"
              className="is-danger"
              onClick={() => {
                setMenuPos(null);
                onDelete(order.docId);
              }}
            >
              Delete
            </li>
          </ul>,
          document.body,
        )}
    </div>
  );
};
