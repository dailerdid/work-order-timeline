import { WorkOrderStatus } from '../types/timeline';

export const STATUS_LABEL: Record<WorkOrderStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  complete: 'Complete',
  blocked: 'Blocked',
};
