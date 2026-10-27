const MS_PER_DAY = 86_400_000;

// Dates are treated as LOCAL calendar days (year / month / day), never via toISOString(),
// so what the user sees is what is stored, regardless of timezone. The only place that
// touches UTC is diffDays: it uses UTC midnights purely to count days without DST errors.

export const parseISO = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const toISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const addMonths = (date: Date, months: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/** Weeks start on Monday. */
export const startOfWeek = (date: Date): Date => {
  const offset = (date.getDay() + 6) % 7; // Mon=0 ... Sun=6
  return addDays(startOfDay(date), -offset);
};

export const daysInMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

/**
 * Whole calendar days from `b` to `a` (a - b). Computed through UTC midnights so
 * a DST change (23h / 25h day) can never produce a fractional result.
 */
export const diffDays = (a: Date, b: Date): number =>
  Math.round(
    (Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) -
      Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) /
      MS_PER_DAY,
  );

export const formatDate = (date: Date, opts: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString('en-US', opts);

/** "Mar 5, 2026" - used in messages and tooltips. */
export const formatDateShort = (iso: string): string =>
  formatDate(parseISO(iso), { month: 'short', day: 'numeric', year: 'numeric' });

/** Both ends inclusive: a one-day order (start === end) occupies one day. */
export const rangesOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean =>
  aStart <= bEnd && bStart <= aEnd;
