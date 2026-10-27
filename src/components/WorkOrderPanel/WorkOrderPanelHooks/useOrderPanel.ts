import { useCallback, useState } from 'react';
import { OrderPanelConfig, WorkOrderDocument, WorkOrderFormValues } from '../../../types/timeline';
import { TimelineSelection } from '../../Timeline/timeline.types';
import { useWorkOrders } from '../../../hooks/useWorkOrders';

type PanelState =
  | { id: number; mode: 'create'; selection: TimelineSelection }
  | { id: number; mode: 'edit'; order: WorkOrderDocument };

/**
 * Owns the Create / Edit panel: which mode is open, what it is filled with, and what happens
 * on submit. The screen only gets ready-to-use props and callbacks.
 */
export const useOrderPanel = () => {
  const [state, setState] = useState<PanelState | null>(null);
  const { addOrder, updateOrder } = useWorkOrders();

  // `id` changes on every open, so the panel remounts with a fresh form
  const openCreate = useCallback(
    (selection: TimelineSelection) => setState({ id: Date.now(), mode: 'create', selection }),
    [],
  );
  const openEdit = useCallback(
    (order: WorkOrderDocument) => setState({ id: Date.now(), mode: 'edit', order }),
    [],
  );
  const closePanel = useCallback(() => setState(null), []);

  const submitPanel = (values: WorkOrderFormValues) => {
    if (!state) return;
    if (state.mode === 'create') addOrder(state.selection.workCenterId, values);
    else updateOrder(state.order, values);
  };

  return {
    panel: state && { key: state.id, config: toPanelConfig(state) },
    // While the create panel is open the picked range stays highlighted on the timeline
    selection: state?.mode === 'create' ? state.selection : null,
    openCreate,
    openEdit,
    closePanel,
    submitPanel,
  };
};

const toPanelConfig = (state: PanelState): OrderPanelConfig =>
  state.mode === 'create' ? createConfig(state.selection) : editConfig(state.order);

const createConfig = ({ workCenterId, startDate, endDate }: TimelineSelection): OrderPanelConfig => ({
  mode: 'create',
  workCenterId,
  initial: { name: '', status: 'open', startDate, endDate },
});

const editConfig = ({ docId, data }: WorkOrderDocument): OrderPanelConfig => ({
  mode: 'edit',
  workCenterId: data.workCenterId,
  excludeDocId: docId,
  initial: { name: data.name, status: data.status, startDate: data.startDate, endDate: data.endDate },
});
