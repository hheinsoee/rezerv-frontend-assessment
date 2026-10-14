const TIME_FORMAT = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
})

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const MONEY_FORMAT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatTimeRange(startsAt: string, endsAt: string): string {
  return `${TIME_FORMAT.format(new Date(startsAt))} – ${TIME_FORMAT.format(new Date(endsAt))}`
}

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso))
}

export function formatMoney(cents: number): string {
  return MONEY_FORMAT.format(cents / 100)
}
