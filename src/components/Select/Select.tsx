import { useRef, useState } from 'react';
import { useDismiss } from '../../hooks/useDismiss';
import './Select.scss';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  /** Grey caption on the left of the control, e.g. "Timescale" */
  label: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** The toolbar dropdown of the project: a caption plus the current option, opens a list. */
export const Select = <T extends string>({ label, options, value, onChange }: Props<T>) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useDismiss(open, () => setOpen(false), { insideRefs: [rootRef] });

  const current = options.find((o) => o.value === value);

  return (
    <div className="select" ref={rootRef}>
      <button
        type="button"
        className="select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="select__label">{label}</span>
        <span className="select__value">
          {current?.label}
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {open && (
        <ul className="select__menu" role="listbox">
          {options.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={o.value === value ? 'is-active' : undefined}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
