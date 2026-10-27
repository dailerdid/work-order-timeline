import { useState } from 'react';
import { Timeline } from './components/Timeline/Timeline';
import { Button } from './components/Button/Button';
import { Select } from './components/Select/Select';
import { WorkOrderPanel } from './components/WorkOrderPanel/WorkOrderPanel';
import { useWorkOrders } from './hooks/useWorkOrders';
import { workCenters } from './data/demoData';
import { useOrderPanel } from './components/WorkOrderPanel/WorkOrderPanelHooks/useOrderPanel';
import { useTimelineRange } from './components/Timeline/TimelineHooks/useTimelineRange';
import { Zoom } from './components/Timeline/timeline.types';
import logo from './assets/naologic-logo.svg';
import './styles/global.scss';
import './App.scss';

const ZOOM_OPTIONS: { value: Zoom; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

/** The screen: it only composes the parts and passes them what they need. */
export function App() {
  // @upgrade: move the timeline state (zoom, range, panel, orders) into a context provider
  // instead of keeping it here; fine for a small demo app.
  // @upgrade: zoom could be owned by the Timeline itself (or passed in from outside) rather than
  // living in App; kept here to avoid over-engineering.
  const [zoom, setZoom] = useState<Zoom>('day');
  // Each press of "Today" bumps the counter; the timeline reacts by scrolling to today
  const [todayRequest, setTodayRequest] = useState(0);
  const range = useTimelineRange(zoom);
  // The only place where the timeline is connected to the store
  const { orders, removeOrder } = useWorkOrders();
  const { panel, selection, openCreate, openEdit, closePanel, submitPanel } = useOrderPanel();

  return (
    <div className="page">
      <div className="page__logo">
        <img src={logo} width={80} height={10} alt="Naologic" />
      </div>
      <h1 className="page__title">Work Orders</h1>
      <div className="page__toolbar">
        <Select label="Timescale" options={ZOOM_OPTIONS} value={zoom} onChange={setZoom} />
        <Button ariaLabel="Scroll to today" onClick={() => setTodayRequest((n) => n + 1)}>
          Today
        </Button>
      </div>
      <div className="page__timeline">
        <Timeline
          range={range}
          workCenters={workCenters}
          orders={orders}
          onEdit={openEdit}
          onCreate={openCreate}
          onDelete={removeOrder}
          selection={selection}
          todayRequest={todayRequest}
        />
      </div>

      {/* @upgrade: render the panel through a portal (createPortal to document.body) */}
      {panel && (
        <WorkOrderPanel key={panel.key} config={panel.config} onSubmit={submitPanel} onClose={closePanel} />
      )}
    </div>
  );
}
