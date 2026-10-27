import { TimelineColumn } from './timeline.types';

interface Props {
  columns: TimelineColumn[];
  totalWidth: number;
}

/** Sticky header: the "Work Center" corner and the day / week / month columns. */
export const TimelineHeader = ({ columns, totalWidth }: Props) => (
  <div className="timeline__header">
    <div className="timeline__corner">Work Center</div>
    <div className="timeline__columns" style={{ width: totalWidth }}>
      {columns.map((c) => (
        <div key={c.key} className="timeline__column" style={{ left: c.offset, width: c.width }}>
          {c.label}
        </div>
      ))}
    </div>
  </div>
);
