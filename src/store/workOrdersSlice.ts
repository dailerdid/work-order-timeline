import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { workOrders as demoOrders } from '../data/demoData';
import { WorkOrderDocument } from '../types/timeline';

const workOrdersSlice = createSlice({
  name: 'workOrders',
  initialState: demoOrders,
  reducers: {
    addWorkOrder: (state, action: PayloadAction<WorkOrderDocument>) => {
      state.push(action.payload);
    },
    updateWorkOrder: (state, action: PayloadAction<WorkOrderDocument>) => {
      const i = state.findIndex((o) => o.docId === action.payload.docId);
      if (i !== -1) state[i] = action.payload;
    },
    deleteWorkOrder: (state, action: PayloadAction<string>) =>
      state.filter((o) => o.docId !== action.payload),
  },
});

export const { addWorkOrder, updateWorkOrder, deleteWorkOrder } = workOrdersSlice.actions;
export default workOrdersSlice.reducer;
