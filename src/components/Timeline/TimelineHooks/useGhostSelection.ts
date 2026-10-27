import { MouseEvent, useCallback, useState } from 'react';
import { WorkOrderDocument } from '../../../types/timeline';
import { TimelineSelection } from '../timeline.types';
import { addDays, diffDays, parseISO, toISO } from '../../../utils/dates';
import { GHOST_TARGET_WIDTH_PX } from '../timelineConfig';
import { TimelineRange, rangeToBox } from './useTimelineRange';

/** Day range relative to the timeline start: [start, end) - `end` is exclusive. */
export interface DayRange {
  start: number;
  end: number;
}

/** Ghost width in whole days (at least 1), so it always sits on day boundaries. */
export const ghostDaysFor = (pxPerDay: number): number =>
  Math.max(1, Math.round(GHOST_TARGET_WIDTH_PX / pxPerDay));

/**
 * Where the ghost should start (in days from the timeline start), or null to hide it.
 *
 * - The cursor is at the ghost's centre, snapped to whole days.
 * - If that spot overlaps an existing order, the ghost is pushed to the closest free
 *   edge (just before / just after an order). Candidates further than one ghost width
 *   from the cursor are rejected, so the ghost never "jumps" far away.
 * - Hovering directly over an order, or running out of the visible range, hides it.
 */
export const resolveGhostStart = (
  cursorPx: number,
  pxPerDay: number,
  ghostDays: number,
  ranges: DayRange[],
  totalDays: number,
): number | null => {
  const cursorDay = Math.floor(cursorPx / pxPerDay);
  if (ranges.some((r) => cursorDay >= r.start && cursorDay < r.end)) return null;

  const wanted = Math.round((cursorPx - (ghostDays * pxPerDay) / 2) / pxPerDay);

  const fitsAt = (start: number) =>
    start >= 0 &&
    start + ghostDays <= totalDays &&
    ranges.every((r) => !(start < r.end && start + ghostDays > r.start));

  const candidates = [wanted, ...ranges.flatMap((r) => [r.start - ghostDays, r.end])]
    .filter((start) => Math.abs(start - wanted) <= ghostDays && fitsAt(start))
    .sort((a, b) => Math.abs(a - wanted) - Math.abs(b - wanted));

  return candidates.length ? candidates[0] : null;
};

export interface Ghost {
  workCenterId: string;
  /** Days from the timeline start */
  startDay: number;
  days: number;
}

interface Args {
  range: TimelineRange;
  ordersByCenter: Record<string, WorkOrderDocument[]>;
  /** Range that stays highlighted while the create panel is open */
  selection: TimelineSelection | null;
  onCreate: (selection: TimelineSelection) => void;
}

/**
 * "Click to add dates": turns the mouse position over a row into a ghost block (hover) and a
 * click into a selection. The dates of a click are exactly what the ghost showed.
 *
 * Kept as a hook (used only by Timeline) on purpose: it holds the mouse-to-date logic and its
 * own state, so Timeline stays a short component that only wires header, grid and rows.
 */
export const useGhostSelection = ({ range, ordersByCenter, selection, onCreate }: Args) => {
  const { totalWidth, viewStart, pxPerDay } = range;
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const totalDays = Math.round(totalWidth / pxPerDay);

  const clearGhost = useCallback(() => setGhost(null), []);

  /**
   * `getBoundingClientRect()` of the cells already accounts for horizontal scroll, so
   * `clientX - rect.left` is the x position inside the timeline content (no scrollLeft needed).
   */
  const handleMove = (e: MouseEvent<HTMLElement>, workCenterId: string) => {
    if (selection) return; // a selection is pending (panel open) - no new ghost
    const rect = e.currentTarget.getBoundingClientRect();
    const days = ghostDaysFor(pxPerDay);

    // Existing orders of this row as [start, end) day ranges relative to viewStart
    const ranges: DayRange[] = (ordersByCenter[workCenterId] ?? []).map((o) => ({
      start: diffDays(parseISO(o.data.startDate), viewStart),
      end: diffDays(parseISO(o.data.endDate), viewStart) + 1, // inclusive end -> exclusive
    }));

    const startDay = resolveGhostStart(e.clientX - rect.left, pxPerDay, days, ranges, totalDays);
    setGhost(startDay === null ? null : { workCenterId, startDay, days });
  };

  const handleClick = (workCenterId: string) => {
    if (selection || !ghost || ghost.workCenterId !== workCenterId) return;
    const start = addDays(viewStart, ghost.startDay);
    const end = addDays(start, ghost.days - 1); // inclusive end date
    setGhost(null);
    onCreate({ workCenterId, startDate: toISO(start), endDate: toISO(end) });
  };

  /** Pixel box of the highlighted selection in a row (null when it belongs to another row). */
  const pickedBox = (workCenterId: string) => {
    if (selection?.workCenterId !== workCenterId) return null;
    return rangeToBox(selection.startDate, selection.endDate, range);
  };

  return { ghost, handleMove, handleClick, clearGhost, pickedBox };
};
