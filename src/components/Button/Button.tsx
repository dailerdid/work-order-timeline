import { ReactNode } from 'react';
import './Button.scss';

interface Props {
  children: ReactNode;
  onClick: () => void;
  /** Needed when the visible text does not describe the action well enough */
  ariaLabel?: string;
}

/** The toolbar button of the project. Styled like the Select control so they sit together. */
export const Button = ({ children, onClick, ariaLabel }: Props) => (
  <button type="button" className="button" onClick={onClick} aria-label={ariaLabel}>
    {children}
  </button>
);
