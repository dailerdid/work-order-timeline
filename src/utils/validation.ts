import { WorkOrderDocument } from '../types/timeline';
import { formatDateShort, toISO } from './dates';
import { findOverlap } from './overlap';

export interface FormErrors {
  name?: string;
  start?: string;
  end?: string;
  overlap?: string;
}

interface FormInput {
  name: string;
  start: Date | null;
  end: Date | null;
}

export const hasErrors = (errors: FormErrors): boolean => Object.keys(errors).length > 0;

/**
 * Checks the Create / Edit form. Order of checks: required fields, end after start,
 * then overlap with other orders of the SAME work center (the edited order is ignored,
 * otherwise it would "overlap" with itself).
 */
export const validateWorkOrder = (
  { name, start, end }: FormInput,
  orders: WorkOrderDocument[],
  workCenterId: string,
  excludeDocId?: string,
): FormErrors => {
  const errors: FormErrors = {};

  if (!name.trim()) errors.name = 'Work order name is required';
  if (!start) errors.start = 'Start date is required';
  if (!end) errors.end = 'End date is required';
  if (start && end && end <= start) errors.end = 'End date must be after the start date';

  if (!errors.start && !errors.end && start && end) {
    const clash = findOverlap(orders, workCenterId, toISO(start), toISO(end), excludeDocId);
    if (clash) {
      errors.overlap = `Overlaps with "${clash.data.name}" (${formatDateShort(
        clash.data.startDate,
      )} – ${formatDateShort(clash.data.endDate)}) on this work center`;
    }
  }
  return errors;
};
