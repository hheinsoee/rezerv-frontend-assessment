import type { ColumnDef } from '../../components/data-table'
import { Badge, type BadgeTone } from '../../components/ui/primitives'
import type { Invoice, InvoiceStatus } from '../../server/db'
import { formatDate, formatMoney } from '../format'

const INVOICE_STATUS_TONES: Record<InvoiceStatus, BadgeTone> = {
  Paid: 'success',
  Pending: 'info',
  Overdue: 'danger',
  Refunded: 'neutral',
}

export const invoiceColumns: ColumnDef<Invoice, any>[] = [
  {
    id: 'reference',
    header: 'Invoice',
    accessor: 'reference',
    sortable: true,
    width: 200,
    pinned: 'left',
    cell: ({ value }) => (
      <span className="font-medium text-slate-900 tabular-nums">{String(value)}</span>
    ),
  },
  {
    id: 'customer',
    header: 'Customer',
    accessor: 'customer',
    sortable: true,
    width: 240,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-slate-800">{row.customer}</span>
        <span className="text-xs text-slate-500">{row.email}</span>
      </div>
    ),
  },
  {
    id: 'issuedOn',
    header: 'Issued',
    accessor: (row) => Date.parse(row.issuedOn),
    sortable: true,
    width: 150,
    cell: ({ row }) => <span className="tabular-nums">{formatDate(row.issuedOn)}</span>,
  },
  {
    id: 'amountCents',
    header: 'Amount',
    accessor: 'amountCents',
    sortable: true,
    width: 140,
    align: 'right',
    cell: ({ value }) => (
      <span className="font-medium tabular-nums text-slate-900">{formatMoney(Number(value))}</span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    width: 140,
    cell: ({ row }) => <Badge tone={INVOICE_STATUS_TONES[row.status]}>{row.status}</Badge>,
  },
  {
    id: 'autoCollect',
    header: 'Auto-collect',
    accessor: 'autoCollect',
    sortable: true,
    width: 150,
    cell: ({ value }) => (
      <span className={value ? 'text-slate-700' : 'text-slate-400'}>{value ? 'On' : 'Off'}</span>
    ),
  },
]
