import { MouseEvent } from 'react';
import { Ghost } from './TimelineHooks/useGhostSelection';
import { TimelineRange } from './TimelineHooks/useTimelineRange';
import { WorkCenterDocument, WorkOrderDocument } from '../../types/timeline';
import { WorkOrderBar } from './WorkOrderBar/WorkOrderBar';

interface Props {
  center: WorkCenterDocument;
  isFirst: boolean;
  isHovered: boolean;
  orders: WorkOrderDocument[];
  range: TimelineRange;
  /** Hover ghost, only when it belongs to this row */
  ghost: Ghost | null;
  /** Highlighted selection (create panel open), only when it belongs to this row */
  picked: { left: number; width: number } | null;
  onEnter: () => void;
  onLeave: () => void;
  onMove: (e: MouseEvent<HTMLElement>) => void;
  onClick: () => void;
  onEdit: (order: WorkOrderDocument) => void;
  onDelete: (docId: string) => void;
}

/** One work center: its name on the left, its bars (and the ghost) on the right. */
export const TimelineRow = ({
  center,
  isFirst,
  isHovered,
  orders,
  range,
  ghost,
  picked,
  onEnter,
  onLeave,
  onMove,
  onClick,
  onEdit,
  onDelete,
}: Props) => (
  <div
    className={`timeline__row${isFirst ? ' is-first' : ''}${isHovered ? ' is-hovered' : ''}`}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
  >
    <div className="timeline__label">{center.data.name}</div>
    <div className="timeline__cells" style={{ width: range.totalWidth }} onMouseMove={onMove} onClick={onClick}>
      {/* Clip layer: orders that start/end outside the visible range are cut off */}
      <div className="timeline__clip">
        {orders.map((o) => (
          <WorkOrderBar
            key={o.docId}
            order={o}
            scale={range}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {ghost && (
        <div className={`ghost${isFirst ? ' is-first' : ''}`} style={{ left: ghost.startDay * range.pxPerDay, width: ghost.days * range.pxPerDay }}>
          <span className={`ghost__tip${isFirst ? ' is-below' : ''}`}>Click to add dates</span>
        </div>
      )}
      {picked && <div className="ghost is-picked" style={picked} />}
    </div>
  </div>
);
