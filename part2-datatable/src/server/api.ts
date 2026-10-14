import type { SortDirection } from '../components/data-table'
import { db, type Attendee, type Invoice, type StudioClass } from './db'

export interface SimulateOptions {
  latencyMs?: number
  fail?: boolean

  empty?: boolean
}

export interface PagedResult<TRow> {
  rows: TRow[]
  total: number
}

export interface InvoiceQuery {
  page: number
  pageSize: number
  sortBy?: string
  sortDirection?: SortDirection
  simulate?: SimulateOptions
}

const DEFAULT_LATENCY_MS = 650

class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function respond<TValue>(value: TValue, simulate: SimulateOptions | undefined, empty: TValue) {
  const latency = simulate?.latencyMs ?? DEFAULT_LATENCY_MS
  const { promise, resolve } = Promise.withResolvers<void>()
  setTimeout(resolve, latency)
  await promise

  if (simulate?.fail) {
    throw new ApiError('The server responded with 500. Please try again.')
  }
  return simulate?.empty ? empty : value
}

export function getClasses(simulate?: SimulateOptions): Promise<StudioClass[]> {
  return respond(db.classes, simulate, [])
}

export function getAttendees(classId: string, simulate?: SimulateOptions): Promise<Attendee[]> {
  const rows = db.classes.find((item) => item.id === classId)?.attendees ?? []
  return respond(rows, simulate, [])
}

const INVOICE_SORTS: Record<string, (a: Invoice, b: Invoice) => number> = {
  reference: (a, b) => a.reference.localeCompare(b.reference),
  customer: (a, b) => a.customer.localeCompare(b.customer),
  issuedOn: (a, b) => Date.parse(a.issuedOn) - Date.parse(b.issuedOn),
  amountCents: (a, b) => a.amountCents - b.amountCents,
  status: (a, b) => a.status.localeCompare(b.status),
  autoCollect: (a, b) => Number(a.autoCollect) - Number(b.autoCollect),
}

export function getInvoices(query: InvoiceQuery): Promise<PagedResult<Invoice>> {
  const comparator = query.sortBy ? INVOICE_SORTS[query.sortBy] : undefined

  const ordered = comparator
    ? [...db.invoices].sort((a, b) => comparator(a, b) * (query.sortDirection === 'desc' ? -1 : 1))
    : db.invoices

  const start = (query.page - 1) * query.pageSize
  const result: PagedResult<Invoice> = {
    rows: ordered.slice(start, start + query.pageSize),
    total: ordered.length,
  }

  return respond(result, query.simulate, { rows: [], total: 0 })
}
