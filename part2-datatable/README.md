# Part 2 - Data Table

A data table built from scratch (no table/grid library), used for a studio class
timetable and a second invoices dataset to prove it isn't hard-coded to one shape.

## Run

```bash
pnpm install
pnpm dev
```

`/` is the timetable, `/demo` is the invoices demo with server-driven and
client-side modes. Both pages have checkboxes to force slow, empty and failed
responses so you can see the loading/empty/error states without luck.

## How to use it

```tsx
<DataTable
  caption="Class timetable"
  data={classes}
  columns={classColumns}
  getRowId={(row) => row.id}
  defaultSort={{ columnId: 'time', direction: 'asc' }}
  state={{ loading, error }}
  onRetry={reload}
  expandable={{
    getChildren: (row) => row.attendees,
    renderExpanded: (ctx) => <AttendeePanel {...ctx} />,
  }}
/>
```

The table is generic over the row type. Columns are definitions with `id`, `header`,
`accessor`, `cell`, `sortable`, `sortFn`, `width`, `pinned`, `align`. Accessor and
cell are separate on purpose: the Time column renders "9:00 AM" but sorts on the
timestamp, otherwise "9:00" would sort after "10:00".

Header click cycles asc / desc / none.

## Client vs server mode

Sort, page and pageSize each work controlled or uncontrolled (`sort`, `defaultSort`,
`onSortChange` and the same for the other two). For server mode pass `manualSort`
and `totalRows` and the table renders exactly what you give it, it never re-sorts or
slices. Uncontrolled, it sorts and paginates all 5,000 demo rows itself. Same
component, there is no mode prop.

## Expandable rows

Two modes: `getChildren` when the children already come with the row, `loadChildren`
to fetch them on first expand (cached per row, stale responses are dropped).
`renderExpanded` gets `{ row, status, children, error, retry }` so one panel handles
loading, error, empty and the list. The expanded row spans the full table width and
animates open.

## Sticky column

`position: sticky` with measured offsets. Declared widths lie (padding, min-width),
so a layout effect measures the real header widths and puts them in CSS variables; a
ResizeObserver keeps them fresh. The scroll shadow is a data attribute set by a
passive scroll listener, nothing re-renders while you scroll.

## State

All local, in two headless hooks: `useDataTable` (sorting + pagination, memoized)
and `useExpansion` (expansion + child cache). No Redux/Zustand/Context, nothing
outside the table reads this state. Fetching lives in the pages against a seeded
mock API (`src/server/`) that has latency and failure injection; in server mode it
sorts and slices inside the API and returns one page.

## Edge cases covered

empty data, empty child list, failed initial fetch, failed child fetch (retry just
that row), slow fetch (skeleton rows that match the columns), invalid sort key,
out-of-range page (clamped), narrow screens (table scrolls inside its container,
pinned column stays), 5,000 rows sort in ~25ms.

## Tradeoffs

- Vite instead of Next, the brief needs no backend and "server-side" here means
  controlled mode.
- Pagination instead of virtualisation, the DOM never holds more than ~50 rows.
- Single-column sort and left-pin only, that's what was asked; the types leave room
  for more.
