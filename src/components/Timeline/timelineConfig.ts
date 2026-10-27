import { Zoom } from './timeline.types';

/**
 * The single source of truth for the timeline scale. Everything else (columns, bar positions,
 * ghost block, today line) is derived from `pxPerDay` of the current zoom, which reaches the
 * components through `TimelineRange` (see useTimelineRange) - nobody reads these maps directly
 * except that hook.
 */

/**
 * Pixels per calendar day for every zoom level.
 * Week column = 7 * 16 = 112px, month column ~ 30 * 3.75 = 112px (matches the design).
 */
export const PX_PER_DAY: Record<Zoom, number> = {
  day: 70,
  week: 16,
  month: 3.75,
};

/**
 * Initial visible range around today, per zoom level (days before / after today).
 * Day: ±2 weeks, Week: ±2 months, Month: ±6 months (see the task description).
 */
export const VISIBLE_RANGE_DAYS: Record<Zoom, number> = {
  day: 14,
  week: 60,
  month: 183,
};

/** Target width of the "Click to add dates" ghost block, as in the design (px). */
export const GHOST_TARGET_WIDTH_PX = 113;
