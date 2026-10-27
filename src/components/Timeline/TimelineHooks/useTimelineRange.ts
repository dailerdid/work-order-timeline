import { useMemo } from 'react';
import { PX_PER_DAY, VISIBLE_RANGE_DAYS } from '../timelineConfig';
import { TimelineColumn, TimelineScale, Zoom } from '../timeline.types';
import {
  addDays,
  addMonths,
  diffDays,
  formatDate,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toISO,
} from '../../../utils/dates';

/**
 * Builds header columns from `start` to `end`. Week / month columns are aligned to
 * the Monday / the 1st, so the first column may begin before `start` (negative
 * offset) - that keeps every column boundary on a real calendar boundary.
 * `ppd` is the scale (px per day) of the zoom level, see timelineConfig.ts.
 */
export const buildColumns = (
  zoom: Zoom,
  start: Date,
  end: Date,
  ppd: number,
): TimelineColumn[] => {
  const cols: TimelineColumn[] = [];

  let cur = zoom === 'week' ? startOfWeek(start) : zoom === 'month' ? startOfMonth(start) : startOfDay(start);

  while (cur <= end) {
    let next: Date;
    let label: string;

    if (zoom === 'day') {
      next = addDays(cur, 1);
      label = formatDate(cur, { weekday: 'short', day: 'numeric' });
    } else if (zoom === 'week') {
      next = addDays(cur, 7);
      const last = addDays(cur, 6);
      label =
        cur.getMonth() === last.getMonth()
          ? `${formatDate(cur, { month: 'short', day: 'numeric' })} – ${last.getDate()}`
          : `${formatDate(cur, { month: 'short', day: 'numeric' })} – ${formatDate(last, { month: 'short', day: 'numeric' })}`;
    } else {
      next = addMonths(cur, 1);
      label = formatDate(cur, { month: 'short', year: 'numeric' });
    }

    cols.push({
      key: toISO(cur),
      label,
      offset: diffDays(cur, start) * ppd,
      width: diffDays(next, cur) * ppd,
    });
    cur = next;
  }
  return cols;
};

/**
 * The ONE place that turns an inclusive date range into pixels (bars, picked selection):
 * `left` counts days from the timeline start, `width` adds 1 because the end date is inclusive,
 * so a one-day range still occupies one day.
 */
export const rangeToBox = (
  startISO: string,
  endISO: string,
  { viewStart, pxPerDay }: TimelineScale,
): { left: number; width: number } => {
  const start = parseISO(startISO);
  return {
    left: diffDays(start, viewStart) * pxPerDay,
    width: (diffDays(parseISO(endISO), start) + 1) * pxPerDay,
  };
};

/** `viewStart` is aligned to the first column, so no column has a negative offset. */
export interface TimelineRange extends TimelineScale {
  zoom: Zoom;
  today: Date;
  columns: TimelineColumn[];
  totalWidth: number;
  /** Left px of today's date (start of the day) */
  todayPx: number;
}

/** Visible date range centred on today, plus the header columns for the zoom level. */
export const useTimelineRange = (zoom: Zoom): TimelineRange =>
  useMemo(() => {
    const today = startOfDay(new Date());
    const span = VISIBLE_RANGE_DAYS[zoom];
    const rawStart = addDays(today, -span);
    const end = addDays(today, span);

    const viewStart =
      zoom === 'week' ? startOfWeek(rawStart) : zoom === 'month' ? startOfMonth(rawStart) : rawStart;

    const pxPerDay = PX_PER_DAY[zoom];
    const columns = buildColumns(zoom, viewStart, end, pxPerDay);
    const last = columns[columns.length - 1];

    return {
      zoom,
      viewStart,
      today,
      columns,
      totalWidth: last.offset + last.width,
      todayPx: diffDays(today, viewStart) * pxPerDay,
      pxPerDay,
    };
  }, [zoom]);
