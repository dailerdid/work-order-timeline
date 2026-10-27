export type Zoom = 'day' | 'week' | 'month';

/** A date range picked on the timeline (ISO dates, both ends inclusive). */
export interface TimelineSelection {
  workCenterId: string;
  startDate: string;
  endDate: string;
}

/** Scale shared by everything that is drawn on the timeline grid. */
export interface TimelineScale {
  /** Date at px 0 */
  viewStart: Date;
  pxPerDay: number;
}

/** One header cell of the timeline (a day, a week or a month). */
export interface TimelineColumn {
  key: string;
  label: string;
  /** Left edge in px, relative to the timeline start */
  offset: number;
  width: number;
  isCurrent: boolean;
}
