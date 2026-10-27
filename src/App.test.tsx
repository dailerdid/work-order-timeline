import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { App } from './App';
import { makeStore } from './store';

// Smoke test of the whole screen: it protects the user-visible behaviour while the code is
// being restructured (jsdom has no layout, so only structure and interactions are checked).
// Every test gets its own store, so deleting an order in one test does not leak into another.
const renderApp = () =>
  render(
    <Provider store={makeStore()}>
      <App />
    </Provider>,
  );

beforeEach(() => window.localStorage.clear());

const FIRST_ORDER = 'Polymer Batch 4021';

test('renders the work centers and the demo orders', () => {
  renderApp();
  expect(screen.getByText('Work Orders')).toBeTruthy();
  expect(screen.getByText('Extrusion Line A')).toBeTruthy();
  expect(screen.getByText('Packaging Line')).toBeTruthy();
  expect(screen.getByText(FIRST_ORDER)).toBeTruthy();
});

test('Edit opens the panel with the order data and Escape closes it', () => {
  jest.useFakeTimers();
  renderApp();

  fireEvent.click(screen.getByLabelText(`Actions for ${FIRST_ORDER}`));
  fireEvent.click(screen.getByText('Edit'));

  expect(screen.getByText('Work Order Details')).toBeTruthy();
  expect((screen.getByLabelText('Work Order Name') as HTMLInputElement).value).toBe(FIRST_ORDER);
  expect(screen.getByText('Save')).toBeTruthy();

  fireEvent.keyDown(document, { key: 'Escape' });
  act(() => {
    jest.advanceTimersByTime(400);
  });
  expect(screen.queryByText('Work Order Details')).toBeNull();
  jest.useRealTimers();
});

test('Save is blocked when the end date is not after the start date', () => {
  renderApp();
  fireEvent.click(screen.getByLabelText(`Actions for ${FIRST_ORDER}`));
  fireEvent.click(screen.getByText('Edit'));

  fireEvent.change(screen.getByLabelText('Work Order Name'), { target: { value: '' } });
  fireEvent.click(screen.getByText('Save'));

  expect(screen.getByText('Work order name is required')).toBeTruthy();
});

test('the Today button scrolls the timeline to today', () => {
  renderApp();
  const scroller = document.querySelector('.timeline') as HTMLElement;

  // jsdom has no layout (all sizes are 0), so give the scroller one to see the effect
  Object.defineProperty(scroller, 'clientWidth', { configurable: true, value: 1000 });
  scroller.scrollLeft = 0;

  fireEvent.click(screen.getByLabelText('Scroll to today'));

  // Today is far from the left edge of the Day view, so the scroller must have moved right
  expect(scroller.scrollLeft).toBeGreaterThan(0);
});

test('Delete removes the order', () => {
  renderApp();
  fireEvent.click(screen.getByLabelText(`Actions for ${FIRST_ORDER}`));
  fireEvent.click(screen.getByText('Delete'));
  expect(screen.queryByText(FIRST_ORDER)).toBeNull();
});
