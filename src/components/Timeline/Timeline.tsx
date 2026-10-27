import { useMemo, useState } from 'react';
import { useGhostSelection } from './TimelineHooks/useGhostSelection';
import { TimelineRange } from './TimelineHooks/useTimelineRange';
import { useTimelineScroll } from './TimelineHooks/useTimelineScroll';
import { WorkCenterDocument, WorkOrderDocument } from '../../types/timeline';
import { TimelineSelection } from './timeline.types';
import { TimelineBackdrop } from './TimelineBackdrop';
import { TimelineHeader } from './TimelineHeader';
import { TimelineRow } from './TimelineRow';
import './Timeline.scss';

interface Props {
  range: TimelineRange;
  workCenters: WorkCenterDocument[];
  /** All work orders; the timeline groups them by work center itself */
  orders: WorkOrderDocument[];
  onEdit: (order: WorkOrderDocument) => void;
  onCreate: (selection: TimelineSelection) => void;
  onDelete: (docId: string) => void;
  /** Range that stays highlighted while the create panel is open */
  selection: TimelineSelection | null;
  /** Increases every time the "Today" button is pressed */
  todayRequest: number;
}

/**
 * Container of the timeline: it wires the logic hooks to the presentational parts
 * (header, backdrop, rows). It knows nothing about where the data lives (Redux, API, ...):
 * everything comes in through props, changes go out through callbacks. Layout: ONE scroll container, the left "Work Center" column is
 * `position: sticky`, so labels and cells stay aligned and no scroll syncing is needed.
 */
export const Timeline = ({
  range,
  workCenters,
  orders,
  onEdit,
  onCreate,
  onDelete,
  selection,
  todayRequest,
}: Props) => {
  const { zoom, columns, totalWidth, todayPx } = range;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const scrollRef = useTimelineScroll(zoom, todayPx, todayRequest);
  // Group once instead of filtering the whole list inside every row
  const ordersByCenter = useMemo(() => {
    const map: Record<string, WorkOrderDocument[]> = {};
    orders.forEach((o) => (map[o.data.workCenterId] ??= []).push(o));
    return map;
  }, [orders]);
  const { ghost, handleMove, handleClick, clearGhost, pickedBox } = useGhostSelection({
    range,
    ordersByCenter,
    selection,
    onCreate,
  });

  return (
    <div className="timeline" ref={scrollRef} onScroll={clearGhost}>
      <div className="timeline__inner">
        <TimelineHeader columns={columns} totalWidth={totalWidth} />

        <div className="timeline__body">
          <TimelineBackdrop columns={columns} totalWidth={totalWidth} zoom={zoom} todayPx={todayPx} />

          {workCenters.map((wc, i) => (
            <TimelineRow
              key={wc.docId}
              center={wc}
              isFirst={i === 0}
              isHovered={hoveredId === wc.docId}
              orders={ordersByCenter[wc.docId] ?? []}
              range={range}
              ghost={ghost?.workCenterId === wc.docId ? ghost : null}
              picked={pickedBox(wc.docId)}
              onEnter={() => setHoveredId(wc.docId)}
              onLeave={() => {
                setHoveredId(null);
                clearGhost();
              }}
              onMove={(e) => handleMove(e, wc.docId)}
              onClick={() => handleClick(wc.docId)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {/* Stretches to the bottom so the sticky label column stays white to the end */}
          <div className="timeline__row is-filler" aria-hidden="true">
            <div className="timeline__label" />
            <div className="timeline__cells" style={{ width: totalWidth }} />
          </div>
        </div>
      </div>
    </div>
  );
};
