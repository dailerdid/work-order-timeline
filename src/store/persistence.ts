import { WorkOrderDocument, WorkOrderStatus } from '../types/timeline';

const STORAGE_KEY = 'work-orders.v1';
const STATUSES: WorkOrderStatus[] = ['open', 'in-progress', 'complete', 'blocked'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Orders saved while the key was temporarily called 'inProgress' keep working.
const migrateLegacyStatus = (item: any): any =>
  item?.data?.status === 'inProgress' ? { ...item, data: { ...item.data, status: 'in-progress' } } : item;

/** Checks the shape of a stored document, so corrupted or hand-edited storage is never used. */
const isWorkOrder = (item: any): item is WorkOrderDocument => {
  const data = item?.data;
  return (
    item?.docType === 'workOrder' &&
    typeof item.docId === 'string' &&
    typeof data?.name === 'string' &&
    typeof data.workCenterId === 'string' &&
    STATUSES.includes(data.status) &&
    ISO_DATE.test(data.startDate) &&
    ISO_DATE.test(data.endDate) &&
    data.startDate <= data.endDate
  );
};

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
    return orders.every(isWorkOrder) ? orders : undefined;
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
