import { SubmitEvent, useState } from 'react';
import DatePicker from 'react-datepicker';
import Select, { components, DropdownIndicatorProps, SingleValue } from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { useEscapeKey } from '../../hooks/useDismiss';
import { useWorkOrders } from '../../hooks/useWorkOrders';
import { useSlideTransition } from './WorkOrderPanelHooks/useSlideTransition';
import { OrderPanelConfig, WorkOrderFormValues, WorkOrderStatus } from '../../types/timeline';
import { parseISO, toISO } from '../../utils/dates';
import { STATUS_LABEL } from '../../utils/status';
import { FormErrors, hasErrors, validateWorkOrder } from '../../utils/validation';
import './WorkOrderPanel.scss';

interface Props {
  config: OrderPanelConfig;
  onSubmit: (values: WorkOrderFormValues) => void;
  onClose: () => void;
}

interface StatusOption {
  value: WorkOrderStatus;
  label: string;
}

const STATUS_OPTIONS: StatusOption[] = (Object.keys(STATUS_LABEL) as WorkOrderStatus[]).map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));

interface PanelValues {
  name: string;
  status: WorkOrderStatus;
  start: Date | null;
  end: Date | null;
}

const CaretIndicator = (props: DropdownIndicatorProps<StatusOption, false>) => (
  <components.DropdownIndicator {...props}>
    <span className="select-caret">
      <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden="true">
        <path d="M3.61 4.51 .65.81C.39.49.62 0 1.04 0h5.92c.42 0 .65.49.39.81L4.39 4.51a.5.5 0 0 1-.78 0Z" fill="currentColor" />
      </svg>
    </span>
  </components.DropdownIndicator>
);

/**
 * The Create / Edit panel. It owns the form state and validation; the slide animation
 * (useSlideTransition) and Escape (useEscapeKey) are small shared hooks. `config.mode` only
 * changes the submit button label.
 */
export const WorkOrderPanel = ({ config, onSubmit, onClose }: Props) => {
  const { initial, workCenterId, excludeDocId } = config;
  const { orders } = useWorkOrders();
  const { open, close } = useSlideTransition(onClose);
  useEscapeKey(close);

  // One state object for the whole form (instead of a useState per field); `setField` updates one key
  const [values, setValues] = useState<PanelValues>({
    name: initial.name,
    status: initial.status,
    start: parseISO(initial.startDate),
    end: parseISO(initial.endDate),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const { name, status, start, end } = values;
  const setField = <K extends keyof PanelValues>(key: K, value: PanelValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));
  // @upgrade: for bigger forms use react-hook-form (or Formik) instead of hand-written state + validation

  // Validates first; on any error the panel stays open and shows the messages
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validateWorkOrder({ name, start, end }, orders, workCenterId, excludeDocId);
    setErrors(next);
    if (hasErrors(next) || !start || !end) return;
    onSubmit({ name: name.trim(), status, startDate: toISO(start), endDate: toISO(end) });
    close();
  };

  return (
    <div className={`panel-root${open ? ' is-open' : ''}`}>
      {/* Clicking outside the panel closes it */}
      <div className="panel-backdrop" onClick={close} />

      <form className="panel" onSubmit={handleSubmit} noValidate aria-label="Work Order Details">
        <header className="panel__header">
          <div>
            <h2>Work Order Details</h2>
            <p>Specify the dates, name and status for this order</p>
          </div>
          <div className="panel__actions">
            <button type="button" className="btn btn--secondary" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {config.mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </header>

        <div className="panel__body">
          <div className="field">
            <label htmlFor="wo-name">Work Order Name</label>
            <input
              id="wo-name"
              className={errors.name ? 'has-error' : undefined}
              value={name}
              autoFocus
              autoComplete="off"
              onChange={(e) => setField('name', e.target.value)}
            />
            {errors.name && <span className="field__error">{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="wo-status">Status</label>
            <Select<StatusOption, false>
              inputId="wo-status"
              classNamePrefix="status-select"
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.find((o) => o.value === status)}
              onChange={(o: SingleValue<StatusOption>) => o && setField('status', o.value)}
              isSearchable={false}
              components={{ IndicatorSeparator: null, DropdownIndicator: CaretIndicator }}
              // Selected value shows the coloured pill; the list shows plain text rows
              formatOptionLabel={(o, { context }) =>
                context === 'value' ? (
                  <span className={`status-pill status-pill--${o.value}`}>{o.label}</span>
                ) : (
                  o.label
                )
              }
            />
          </div>

          <div className="field">
            <label htmlFor="wo-start">Start date</label>
            <DatePicker
              id="wo-start"
              selected={start}
              onChange={(d: Date | null) => setField('start', d)}
              dateFormat="MM.dd.yyyy"
              placeholderText="MM.DD.YYYY"
              autoComplete="off"
              className={errors.start ? 'has-error' : undefined}
            />
            {errors.start && <span className="field__error">{errors.start}</span>}
          </div>

          <div className="field">
            <label htmlFor="wo-end">End date</label>
            <DatePicker
              id="wo-end"
              selected={end}
              onChange={(d: Date | null) => setField('end', d)}
              dateFormat="MM.dd.yyyy"
              placeholderText="MM.DD.YYYY"
              autoComplete="off"
              className={errors.end ? 'has-error' : undefined}
            />
            {errors.end && <span className="field__error">{errors.end}</span>}
          </div>

          {errors.overlap && (
            <div className="panel__alert" role="alert">
              {errors.overlap}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
