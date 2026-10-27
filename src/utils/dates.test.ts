import { addDays, diffDays, parseISO, rangesOverlap, startOfWeek, toISO } from './dates';

test('parse/format round trip keeps the local date', () => {
  expect(toISO(parseISO('2026-03-29'))).toBe('2026-03-29');
});

test('diffDays is a whole number across a DST change', () => {
  expect(diffDays(parseISO('2026-03-30'), parseISO('2026-03-28'))).toBe(2);
});

test('weeks start on Monday', () => {
  expect(toISO(startOfWeek(parseISO('2026-10-22')))).toBe('2026-10-19'); // Thursday
  expect(toISO(startOfWeek(parseISO('2026-10-25')))).toBe('2026-10-19'); // Sunday
});

test('ranges are inclusive on both ends', () => {
  const d = parseISO;
  expect(rangesOverlap(d('2026-10-01'), d('2026-10-05'), d('2026-10-05'), d('2026-10-09'))).toBe(true);
  expect(rangesOverlap(d('2026-10-01'), d('2026-10-05'), d('2026-10-06'), d('2026-10-09'))).toBe(false);
});
