import type { ExpandedContext } from '../../components/data-table'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Badge, Button, Skeleton, type BadgeTone } from '../../components/ui/primitives'
import type { Attendee, BookingStatus, StudioClass } from '../../server/db'

const BOOKING_STATUS_TONES: Record<BookingStatus, BadgeTone> = {
  Booked: 'info',
  'Checked-in': 'success',
  Cancelled: 'danger',
  'No-show': 'warning',
}

export function AttendeePanel({
  row,
  status,
  children,
  error,
  retry,
}: ExpandedContext<StudioClass, Attendee>) {
  return (
    <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Attendees — {row.name}
        </h3>
        {status === 'ready' && children.length > 0 ? (
          <span className="text-xs text-slate-500">{children.length} booked</span>
        ) : null}
      </div>

      {status === 'loading' ? (
        <ul className="space-y-2" aria-live="polite" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <li
              key={index}
              className="flex items-center gap-4 border border-slate-200 bg-white px-3 py-2.5"
            >
              <Skeleton className="w-40" />
              <Skeleton className="w-24" />
              <Skeleton className="w-20" />
            </li>
          ))}
        </ul>
      ) : null}

      {status === 'error' ? (
        <div className="flex flex-col items-center gap-3 border border-rose-200 bg-rose-50/60 px-4 py-6 text-center">
          <TriangleAlert className="size-6 text-rose-500" />
          <p className="text-sm text-rose-700">{error?.message ?? 'Could not load attendees.'}</p>
          <Button onClick={retry}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      ) : null}

      {status === 'ready' && children.length === 0 ? (
        <p className="border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          No attendees booked for this class yet.
        </p>
      ) : null}

      {status === 'ready' && children.length > 0 ? (
        <table className="w-full table-fixed border-separate border-spacing-y-1.5">
          <caption className="sr-only">Attendees for {row.name}</caption>
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th scope="col" className="px-3 pb-1 font-medium">
                Customer
              </th>
              <th scope="col" className="px-3 pb-1 font-medium">
                Payment
              </th>
              <th scope="col" className="px-3 pb-1 font-medium">
                Booking
              </th>
            </tr>
          </thead>
          <tbody>
            {children.map((attendee) => (
              <tr key={attendee.id} className="bg-white">
                <td className="border-y border-l border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800">
                  {attendee.customerName}
                </td>
                <td className="border-y border-slate-200 px-3 py-2.5 text-sm text-slate-600">
                  {attendee.paymentType}
                </td>
                <td className="border-y border-r border-slate-200 px-3 py-2.5">
                  <Badge tone={BOOKING_STATUS_TONES[attendee.bookingStatus]}>
                    {attendee.bookingStatus}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}
