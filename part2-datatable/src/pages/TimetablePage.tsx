import { useCallback, useMemo, useState } from 'react'
import { DataTable } from '../components/data-table'
import { Checkbox } from '../components/ui/primitives'
import { AttendeePanel } from '../features/timetable/AttendeePanel'
import { classColumns } from '../features/timetable/columns'
import { useAsync } from '../hooks/useAsync'
import { getClasses, type SimulateOptions } from '../server/api'
import type { StudioClass } from '../server/db'

const SLOW_LATENCY_MS = 2_600

export function TimetablePage() {
  const [slow, setSlow] = useState(false)
  const [failing, setFailing] = useState(false)
  const [empty, setEmpty] = useState(false)

  const simulate = useMemo<SimulateOptions>(
    () => ({ latencyMs: slow ? SLOW_LATENCY_MS : undefined, fail: failing, empty }),
    [slow, failing, empty],
  )

  const classes = useAsync(() => getClasses(simulate), [slow, failing, empty])

  const rows = classes.data ?? []

  const getRowId = useCallback((row: StudioClass) => row.id, [])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Class timetable</h1>
          <p className="mt-1 text-sm text-slate-500">
            Expand a class to see who is booked. Children ship with the parent row, so
            expanding is instant.
          </p>
        </div>

        <div className="flex">
          <Checkbox checked={slow} onChange={setSlow} label="Slow network" />
          <Checkbox checked={empty} onChange={setEmpty} label="Empty" />
          <Checkbox checked={failing} onChange={setFailing} label="Fail" />
        </div>
      </header>

      <DataTable
        caption="Class timetable"
        data={rows}
        columns={classColumns}
        getRowId={getRowId}
        defaultSort={{ columnId: 'time', direction: 'asc' }}
        defaultPageSize={10}
        state={{ loading: classes.loading, error: classes.error }}
        onRetry={classes.reload}
        skeletonRows={8}
        emptyState={
          <div>
            <p className="font-medium text-slate-900">No classes scheduled</p>
            <p className="mt-1 text-sm text-slate-500">
              Classes added to the timetable will appear here.
            </p>
          </div>
        }
        expandable={{

          getChildren: (row) => row.attendees,
          isExpandable: (row) => row.status !== 'Cancelled',
          renderExpanded: (context) => <AttendeePanel {...context} />,
        }}
      />
    </div>
  )
}
