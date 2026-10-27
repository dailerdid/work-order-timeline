import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { addWorkOrder, deleteWorkOrder, updateWorkOrder } from '../store/workOrdersSlice';
import { WorkOrderDocument, WorkOrderFormValues } from '../types/timeline';

/**
 * The only place components talk to Redux about work orders: read the list (also grouped by
 * work center) and create / update / delete. Components never touch dispatch directly.
 */
export const useWorkOrders = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((s) => s.workOrders);

  // Group once instead of filtering the whole list inside every row
  const ordersByCenter = useMemo(() => {
    const map: Record<string, WorkOrderDocument[]> = {};
    orders.forEach((o) => (map[o.data.workCenterId] ??= []).push(o));
    return map;
  }, [orders]);

  const addOrder = useCallback(
    (workCenterId: string, values: WorkOrderFormValues) =>
      dispatch(
        addWorkOrder({
          docId: `wo-${Date.now()}`,
          docType: 'workOrder',
          data: { ...values, workCenterId },
        }),
      ),
    [dispatch],
  );

  const updateOrder = useCallback(
    (order: WorkOrderDocument, values: WorkOrderFormValues) =>
      dispatch(updateWorkOrder({ ...order, data: { ...order.data, ...values } })),
    [dispatch],
  );

  const removeOrder = useCallback((docId: string) => dispatch(deleteWorkOrder(docId)), [dispatch]);

  return { orders, ordersByCenter, addOrder, updateOrder, removeOrder };
};
