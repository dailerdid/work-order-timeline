import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { WorkOrderDocument } from '../types/timeline';
import { loadWorkOrders, saveWorkOrders } from './persistence';
import workOrders from './workOrdersSlice';

/**
 * Store factory (tests create their own isolated store). Saved orders survive a page refresh;
 * without them the slice falls back to the demo data. Every change is written through to
 * localStorage (the list is small, so no debouncing is needed).
 */
export const makeStore = (preloaded?: WorkOrderDocument[]) => {
  const created = configureStore({
    reducer: { workOrders },
    preloadedState: preloaded ? { workOrders: preloaded } : undefined,
  });

  let previous = created.getState().workOrders;
  created.subscribe(() => {
    const current = created.getState().workOrders;
    if (current !== previous) {
      previous = current;
      saveWorkOrders(current);
    }
  });
  return created;
};

export const store = makeStore(loadWorkOrders());

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
