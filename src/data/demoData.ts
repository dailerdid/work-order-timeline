import { WorkCenterDocument, WorkOrderDocument, WorkOrderStatus } from '../types/timeline';
import { addDays, startOfDay, toISO } from '../utils/dates';

export const workCenters: WorkCenterDocument[] = [
  'Extrusion Line A',
  'CNC Machine 1',
  'Assembly Station',
  'Quality Control',
  'Packaging Line',
].map((name, i) => ({ docId: `wc-${i + 1}`, docType: 'workCenter', data: { name } }));

const today = startOfDay(new Date());

// Demo orders are placed relative to today so the timeline is never empty.
const order = (
  n: number,
  name: string,
  center: number,
  status: WorkOrderStatus,
  fromDay: number,
  toDay: number,
): WorkOrderDocument => ({
  docId: `wo-${n}`,
  docType: 'workOrder',
  data: {
    name,
    workCenterId: `wc-${center}`,
    status,
    startDate: toISO(addDays(today, fromDay)),
    endDate: toISO(addDays(today, toDay)),
  },
});

export const workOrders: WorkOrderDocument[] = [
  order(1, 'Polymer Batch 4021', 1, 'complete', -40, -12),
  order(2, 'Aluminium Profile Run', 1, 'in-progress', -5, 20),
  order(3, 'Housing Milling', 2, 'in-progress', -10, 9),
  order(4, 'Shaft Turning', 2, 'open', 14, 35),
  order(5, 'Gearbox Assembly', 3, 'blocked', -3, 18),
  order(6, 'Control Unit Assembly', 3, 'open', 25, 50),
  order(7, 'Batch Inspection #88', 4, 'complete', -25, -8),
  order(8, 'Final QA Sign-off', 4, 'open', 2, 12),
  order(9, 'Retail Pack Run', 5, 'in-progress', -15, 6),
  order(10, 'Export Palletising', 5, 'blocked', 12, 30),
];
