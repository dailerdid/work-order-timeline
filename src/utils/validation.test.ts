import { WorkOrderDocument } from '../types/timeline';
import { parseISO } from './dates';
import { validateWorkOrder } from './validation';

const order = (docId: string, center: string, start: string, end: string): WorkOrderDocument => ({
  docId,
  docType: 'workOrder',
  data: { name: `Order ${docId}`, workCenterId: center, status: 'open', startDate: start, endDate: end },
});

const orders = [order('a', 'wc-1', '2026-10-10', '2026-10-15'), order('b', 'wc-2', '2026-10-10', '2026-10-15')];
const input = (start: string | null, end: string | null, name = 'New') => ({
  name,
  start: start ? parseISO(start) : null,
  end: end ? parseISO(end) : null,
});

test('a valid order has no errors', () => {
  expect(validateWorkOrder(input('2026-10-20', '2026-10-25'), orders, 'wc-1')).toEqual({});
});

test('name and both dates are required', () => {
  const errors = validateWorkOrder(input(null, null, '  '), orders, 'wc-1');
  expect(errors.name).toBeTruthy();
  expect(errors.start).toBeTruthy();
  expect(errors.end).toBeTruthy();
});

test('the end date must be after the start date (equal is not allowed)', () => {
  expect(validateWorkOrder(input('2026-10-20', '2026-10-20'), orders, 'wc-1').end).toBeTruthy();
  expect(validateWorkOrder(input('2026-10-20', '2026-10-19'), orders, 'wc-1').end).toBeTruthy();
});

test('an overlap on the same work center is reported, on another center it is fine', () => {
  expect(validateWorkOrder(input('2026-10-15', '2026-10-18'), orders, 'wc-1').overlap).toContain('Order a');
  expect(validateWorkOrder(input('2026-10-15', '2026-10-18'), orders, 'wc-3').overlap).toBeUndefined();
});

test('the order being edited does not overlap with itself', () => {
  expect(validateWorkOrder(input('2026-10-11', '2026-10-14'), orders, 'wc-1', 'a').overlap).toBeUndefined();
});
