import { WorkOrderDocument } from '../types/timeline';
import { loadWorkOrders, saveWorkOrders } from './persistence';

const order: WorkOrderDocument = {
  docId: 'wo-1',
  docType: 'workOrder',
  data: { name: 'Order', workCenterId: 'wc-1', status: 'open', startDate: '2026-01-01', endDate: '2026-01-05' },
};

beforeEach(() => window.localStorage.clear());

test('saved work orders are loaded back', () => {
  saveWorkOrders([order]);
  expect(loadWorkOrders()).toEqual([order]);
});

test('nothing stored or corrupted storage falls back to undefined', () => {
  expect(loadWorkOrders()).toBeUndefined();
  window.localStorage.setItem('work-orders.v1', '{not json');
  expect(loadWorkOrders()).toBeUndefined();
  window.localStorage.setItem('work-orders.v1', JSON.stringify([{ docId: 'x' }]));
  expect(loadWorkOrders()).toBeUndefined();
});
