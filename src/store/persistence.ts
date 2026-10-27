 import { WorkOrderDocument } from '../types/timeline';

const STORAGE_KEY = 'work-orders.v1';
const STATUSES = ['open', 'in-progress', 'complete', 'blocked'];

// Orders saved while the key was temporarily called 'inProgress' keep working.
const migrateLegacyStatus = (x: any): any =>
  x?.data?.status === 'inProgress' ? { ...x, data: { ...x.data, status: 'in-progress' } } : x;


/**
 * Returns the saved work orders, or undefined when nothing valid is stored
 * (first visit, cleared storage, corrupted or blocked storage) so the demo data is used.
 */
export const loadWorkOrders = (): WorkOrderDocument[] | undefined => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    const orders = parsed.map(migrateLegacyStatus);
  } catch {
    return undefined;
  }
};

export const saveWorkOrders = (orders: WorkOrderDocument[]): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Storage full / blocked (private mode): the app keeps working, just without persistence.
  }
};
