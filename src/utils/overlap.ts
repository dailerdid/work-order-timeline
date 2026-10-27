import { WorkOrderDocument } from '../types/timeline';
import { parseISO, rangesOverlap } from './dates';

/**
 * Returns the first order on the same work center that overlaps the given range,
 * ignoring `excludeDocId` (the order being edited). Ranges are inclusive.
 */
export const findOverlap = (
  orders: WorkOrderDocument[],
  workCenterId: string,
  startISO: string,
  endISO: string,
  excludeDocId?: string,
): WorkOrderDocument | undefined => {
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  return orders.find(
    (o) =>
      o.data.workCenterId === workCenterId &&
      o.docId !== excludeDocId &&
      rangesOverlap(start, end, parseISO(o.data.startDate), parseISO(o.data.endDate)),
  );
};
