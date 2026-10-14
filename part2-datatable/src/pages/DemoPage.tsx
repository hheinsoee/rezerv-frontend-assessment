import { useCallback, useMemo, useState } from 'react'
import { DataTable, type SortState } from '../components/data-table'
import { Checkbox, RadioGroup } from '../components/ui/primitives'
import { invoiceColumns } from '../features/invoices/columns'
import { AttendeePanel } from '../features/timetable/AttendeePanel'
import { classColumns } from '../features/timetable/columns'
import { useAsync } from '../hooks/useAsync'
import { getAttendees, getClasses, getInvoices, type SimulateOptions } from '../server/api'
import type { Invoice, StudioClass } from '../server/db'

const SLOW_LATENCY_MS = 2_600
const CLIENT_MODE_ROWS = 5_000

type Mode = 'server' | 'client'

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'server', label: 'Server-driven' },
  { value: 'client', label: 'Client-side' },
]

export function DemoPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Reusability demo</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          The same <code className="bg-slate-100 px-1 py-0.5 text-xs">DataTable</code> as
          the timetable, rendering a different row shape, driven by a different column array, in
          both controlled and uncontrolled modes.
        </p>
      </header>

      <InvoicesSection />
      <OnDemandSection />
    </div>
  )
}

function InvoicesSection() {
  const [mode, setMode] = useState<Mode>('server')
  const [slow, setSlow] = useState(false)
  const [failing, setFailing] = useState(false)

  const [sort, setSort] = useState<SortState | null>({ columnId: 'issuedOn', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const isServer = mode === 'server'

  const simulate = useMemo<SimulateOptions>(
    () => ({ latencyMs: slow ? SLOW_LATENCY_MS : undefined, fail: failing }),
    [slow, failing],
  )

  const invoices = useAsync(
    () =>
      getInvoices({
        page: isServer ? page : 1,
        pageSize: isServer ? pageSize : CLIENT_MODE_ROWS,
        sortBy: isServer ? sort?.columnId : undefined,
        sortDirection: isServer ? sort?.direction : undefined,
        simulate,
      }),
    [isServer, page, pageSize, sort?.columnId, sort?.direction, slow, failing],
  )

  const rows = invoices.data?.rows ?? []
  const getRowId = useCallback((row: Invoice) => row.id, [])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Invoices</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isServer
              ? 'Controlled: the page requests sorted, paginated rows and passes totalRows back in.'
              : `Uncontrolled: all ${CLIENT_MODE_ROWS.toLocaleString()} rows handed to the table, which sorts and paginates them.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RadioGroup
            name="invoice-mode"
            legend="Data source"
            value={mode}
            onChange={setMode}
            options={MODE_OPTIONS}
          />
          <div>
            <Checkbox checked={slow} onChange={setSlow} label="Slow" />
            <Checkbox checked={failing} onChange={setFailing} label="Fail" />
          </div>
        </div>
      </div>

      {isServer ? (
        <DataTable
          caption="Invoices, server-driven"
          data={rows}
          columns={invoiceColumns}
          getRowId={getRowId}
          manualSort
          totalRows={invoices.data?.total ?? 0}
          sort={sort}
          onSortChange={setSort}
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          state={{ loading: invoices.loading, error: invoices.error }}
          onRetry={invoices.reload}
        />
      ) : (
        <DataTable
          caption="Invoices, client-side"
          data={rows}
          columns={invoiceColumns}
          getRowId={getRowId}
          defaultSort={{ columnId: 'issuedOn', direction: 'desc' }}
          defaultPageSize={10}
          state={{ loading: invoices.loading, error: invoices.error }}
          onRetry={invoices.reload}
        />
      )}
    </section>
  )
}

function OnDemandSection() {
  const [slowChildren, setSlowChildren] = useState(true)
  const [failingChildren, setFailingChildren] = useState(false)

  const classes = useAsync(() => getClasses({ latencyMs: 350 }), [])
  const rows = classes.data ?? []

  const getRowId = useCallback((row: StudioClass) => row.id, [])

  const loadChildren = useCallback(
    (row: StudioClass) =>
      getAttendees(row.id, {
        latencyMs: slowChildren ? 1_400 : 300,
        fail: failingChildren,
      }),
    [slowChildren, failingChildren],
  )

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">On-demand child rows</h2>
          <p className="mt-1 text-sm text-slate-500">
            Attendees are fetched when a row is expanded, then cached. Collapse and
            re-expand does not re-fetch; a failed fetch offers a retry.
          </p>
        </div>

        <div>
          <Checkbox checked={slowChildren} onChange={setSlowChildren} label="Slow children" />
          <Checkbox checked={failingChildren} onChange={setFailingChildren} label="Fail children" />
        </div>
      </div>

      <DataTable
        caption="Classes with lazily loaded attendees"
        data={rows}
        columns={classColumns}
        getRowId={getRowId}
        defaultPageSize={5}
        pageSizeOptions={[5, 10, 25]}
        state={{ loading: classes.loading, error: classes.error }}
        onRetry={classes.reload}
        expandable={{
          loadChildren,
          isExpandable: (row) => row.status !== 'Cancelled',
          renderExpanded: (context) => <AttendeePanel {...context} />,
        }}
      />
    </section>
  )
}
