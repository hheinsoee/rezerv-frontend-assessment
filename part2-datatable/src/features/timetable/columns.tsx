import type { ColumnDef } from '../../components/data-table'
import { Badge, type BadgeTone } from '../../components/ui/primitives'
import type { ClassStatus, StudioClass } from '../../server/db'
import { formatTimeRange } from '../format'

const CLASS_STATUS_TONES: Record<ClassStatus, BadgeTone> = {
  Scheduled: 'info',
  Full: 'warning',
  Cancelled: 'danger',
}

export const classColumns: ColumnDef<StudioClass, any>[] = [
  {
    id: 'name',
    header: 'Class',
    accessor: 'name',
    sortable: true,
    width: 220,
    pinned: 'left',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-slate-900">{row.name}</span>
        <span className="text-xs text-slate-500">{row.room}</span>
      </div>
    ),
  },
  { id: 'instructor', header: 'Instructor', accessor: 'instructor', sortable: true, width: 180 },
  {
    id: 'time',
    header: 'Time',

    accessor: (row) => Date.parse(row.startsAt),
    sortable: true,
    width: 200,
    cell: ({ row }) => (
      <span className="tabular-nums">{formatTimeRange(row.startsAt, row.endsAt)}</span>
    ),
  },
  {
    id: 'duration',
    header: 'Duration',
    accessor: 'durationMinutes',
    sortable: true,
    width: 120,
    align: 'right',
    cell: ({ value }) => <span className="tabular-nums">{String(value)} min</span>,
  },
  {
    id: 'attendance',
    header: 'Attendance',
    accessor: (row) => row.booked / row.capacity,
    sortable: true,
    width: 160,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="tabular-nums text-slate-700">
          {row.booked} / {row.capacity}
        </span>
        <span className="h-1.5 w-14 overflow-hidden bg-slate-200">
          <span
            className="block h-full bg-slate-700"
            style={{ width: `${Math.min(100, (row.booked / row.capacity) * 100)}%` }}
          />
        </span>
      </div>
    ),
  },
  {
    id: 'waitlist',
    header: 'Waitlist',
    accessor: 'waitlist',
    sortable: true,
    width: 110,
    align: 'right',
    cell: ({ value }) => (value ? <span className="tabular-nums">{String(value)}</span> : null),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    width: 140,
    cell: ({ row }) => <Badge tone={CLASS_STATUS_TONES[row.status]}>{row.status}</Badge>,
  },
]
