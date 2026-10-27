import { TimelineColumn, Zoom } from './timeline.types';

interface Props {
  columns: TimelineColumn[];
  totalWidth: number;
  zoom: Zoom;
  /** Left px of today's date */
  todayPx: number;
}

const BADGE_LABEL: Record<Zoom, string> = {
  day: 'Today',
  week: 'Current week',
  month: 'Current month',
};

/** Layer behind the rows: vertical grid lines, the "today" line and its badge. */
export const TimelineBackdrop = ({ columns, totalWidth, zoom, todayPx }: Props) => (
  <div className="timeline__layer" style={{ width: totalWidth }} aria-hidden="true">
    {columns.map((c) => (
      <div key={c.key} className="timeline__line" style={{ left: c.offset }} />
    ))}
    <div className="timeline__today" style={{ left: todayPx }} />
    {/* Pill starts exactly at the today line and hugs its text, like the design */}
    <div className={`timeline__badge timeline__badge--${zoom}`} style={{ left: todayPx }}>
      {BADGE_LABEL[zoom]}
    </div>
  </div>
);
