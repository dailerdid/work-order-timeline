# Work Order Schedule Timeline

An interactive timeline for a manufacturing ERP: it shows work orders across work centers and lets planners create, edit and delete them, with Day / Week / Month zoom.

## Run it

Developed and tested with Node.js 24.20 and npm 11.19 (Create React App 5 also works on Node 18+).

```bash
npm install
npm start        # http://localhost:3000
```

Other scripts:

```bash
npm test                          # unit + smoke tests (Jest, React Testing Library)
npx react-scripts test --watchAll=false   # single run, as in CI
npm run build                     # production build into /build
npx tsc --noEmit                  # type check (strict mode)
```

No other setup is needed: sample data is hardcoded and the Circular Std font is loaded from the CDN given in the brief.

## Features

**Timeline**
- Day / Week / Month zoom via the Timescale dropdown; the header and bar widths are recalculated, the data stays the same.
- Fixed left column with work center names, horizontally scrollable grid (the mouse wheel scrolls it sideways, the scrollbar is hidden as in the design).
- Current-day indicator with a "Current month / week / day" badge, row hover highlight.
- Initial range is centered on today: about ±2 weeks (Day), ±2 months (Week), ±6 months (Month).

**Work orders**
- Bars with name, status pill and a three-dot menu (Edit / Delete).
- Four statuses: Open, In progress, Complete, Blocked, each with its own colors from the design.
- Clicking empty space shows a "Click to add dates" ghost block; clicking opens the Create panel with the start date taken from the ghost position.
- Create / Edit use the same slide-out panel (`mode: 'create' | 'edit'`).

**Validation**
- Name, start and end dates are required.
- End date must be after the start date.
- A work order may not overlap another one on the same work center (when editing, the order itself is ignored). An error is shown and nothing is saved.

**Bonus items done**
- `localStorage` persistence (work orders survive a refresh).
- Panel slide-in/out animation.
- Keyboard: `Esc` closes the panel / menus, form is Tab-navigable.
- "Today" button that smoothly scrolls the viewport to today.
- Tooltip on bar hover with the name, status and full date range (appears after a short delay, hidden while the actions menu is open or when scrolling).
- Custom styling of the status select and focus states to match the design.
- Automated tests (see below).

## Approach

The code is split into three layers so each piece can be explained and tested on its own:

1. **`src/utils/` - pure logic**, no React: date helpers, the ghost-block calculation, overlap detection, form validation, status labels. These are covered by unit tests.
2. **Hooks** - state and side effects. Shared ones live in `src/hooks/`; hooks that belong to one component sit in a subfolder next to it (`TimelineHooks/`, `WorkOrderPanelHooks/`).
3. **Components** - presentational, they receive only the data they need.

```
src/
  types/        domain types (work centers, work orders, form values)
  utils/        dates, overlap, validation, status (+ tests)
  data/         sample work centers and work orders
  store/        Redux Toolkit slice, store factory, localStorage persistence
  hooks/        useWorkOrders, useDismiss
  components/
    Timeline/         container, header, backdrop (grid), row, TimelineHooks/;
                      also its own types, scale config (px per day); column/box maths live in useTimelineRange, ghost logic in useGhostSelection
      WorkOrderBar/   bar, actions menu and BarTooltip (used only by the timeline rows)
    WorkOrderPanel/   create/edit form, WorkOrderPanelHooks/
    Select/           toolbar dropdown (used for the Timescale)
    Button/           toolbar button (used for Today)
  styles/       SCSS variables, status palette, globals
```

### How positioning works

Every zoom level has a fixed scale in **pixels per day** (Day 70, Week 16, Month 3.75). A date is converted to a pixel position relative to the start of the visible range:

```
left  = diffDays(startDate, viewStart) * pxPerDay
width = (diffDays(endDate, startDate) + 1) * pxPerDay      // end date is inclusive
```

Because everything is derived from one scale, changing the zoom only changes `pxPerDay`; bars, the today line and the grid all follow.

Date details worth knowing:
- All dates are handled in **local time** (no `toISOString`, which would shift days across time zones).
- `diffDays` goes through `Date.UTC`, so a daylight-saving change never produces a 23- or 25-hour "day".
- Weeks start on Monday.

### Click-to-create ghost block

The ghost is `max(1, round(113 / pxPerDay))` days wide (about 113px, as in the design), snapped to whole days. If the cursor is near an existing order, the ghost is pushed to the nearest free edge instead of overlapping it, and it is hidden when the cursor is directly over an order. The dates of a click are exactly what the ghost showed (end date = start + days - 1).

### State

Redux Toolkit holds the work orders (`add` / `update` / `delete`). A `store.subscribe` write-through saves them to `localStorage` (`work-orders.v1`); on load the saved data is validated, and the demo data is used when nothing valid is stored. `makeStore(preloaded)` creates a fresh store per test.

## Libraries and why

| Library | Why |
| --- | --- |
| React 19.3, TypeScript 4.9 (strict) | UI and type safety |
| Redux Toolkit 2.13, react-redux 9.3 | A predictable store for work orders with little boilerplate |
| react-select 5.10 | Status dropdown, restyled to match the design |
| react-datepicker 8.10.0 | Date fields; pinned to 8.x because 9.x breaks `react-scripts build` |
| Sass 1.106 (SCSS) | All styling, with shared variables and a status palette generated from one map |
| Jest + React Testing Library 16 | Unit and smoke tests (Jest comes with react-scripts 5.0.1) |

## Tests

16 tests in 4 suites:
- `dates.test.ts`, `validation.test.ts`, `persistence.test.ts` - the pure logic (date math, overlap and validation rules, saving to and loading from localStorage).
- `App.test.tsx` - smoke tests: the app renders, Edit opens the panel and `Esc` closes it, an empty name is rejected, the Today button works, Delete removes an order.

## Decisions and trade-offs

- **Status values follow the brief exactly** (`'open' | 'in-progress' | 'complete' | 'blocked'`). The status is also used as a CSS class suffix, so the SCSS map key is quoted (`'in-progress'`).
- **Default dates of a new order come from the ghost block** (about 113px wide, so 2 days in Day, 7 in Week, 30 in Month view), as in the design. The brief says End Date = Start Date + 7 days; this is a deliberate trade-off: the ghost block shows the range the user is about to create, so the form opens with exactly those dates, which is more consistent and easier to understand.
- **No infinite scroll.** The visible range is fixed (about a month in Day view, a year in Month view). Simpler and predictable; listed under upgrades.
- **px-per-day scale instead of fitting the container.** Bars keep a constant size when the window is resized; the grid scrolls instead.
- **Sticky column and header live in one scroll container** (no JS syncing of two scrollers), so the left column cannot drift out of alignment.
- **Bar menu is rendered in a portal** so it is never clipped by the scroll container.
- **Behavior was checked by tests, type check and a production build.** Pixel accuracy was matched against exported Sketch measurements and screenshots, not against an automated visual diff.

## Possible upgrades

- Infinite horizontal scroll (prepend past / append future columns and keep the scroll position).
- Hide the three-dot button in a hover popover for very short bars (`@upgrade` note in `WorkOrderBar.scss`).
- Custom styling of the datepicker popup to match the design system.
- E2E tests (Playwright / Cypress) and a fuller accessibility pass (focus trap in the panel, arrow-key navigation in menus).
- `React.memo` for bars and rows if the number of orders grows.
