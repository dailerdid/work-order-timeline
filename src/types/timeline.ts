export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

export interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    /** ISO date (YYYY-MM-DD), inclusive */
    startDate: string;
    /** ISO date (YYYY-MM-DD), inclusive */
    endDate: string;
  };
}

/** What the user types into the Create / Edit panel (ISO dates, both ends inclusive). */
export interface WorkOrderFormValues {
  name: string;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;
}

/** Everything the panel needs to open in create or edit mode. */
export interface OrderPanelConfig {
  mode: 'create' | 'edit';
  workCenterId: string;
  /** docId of the order being edited - ignored by the overlap check */
  excludeDocId?: string;
  initial: WorkOrderFormValues;
}
