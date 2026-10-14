

export type ClassStatus = 'Scheduled' | 'Full' | 'Cancelled'
export type PaymentType = 'One-time' | 'Package' | 'Membership'
export type BookingStatus = 'Booked' | 'Checked-in' | 'Cancelled' | 'No-show'

export interface Attendee {
  id: string
  classId: string
  customerName: string
  paymentType: PaymentType
  bookingStatus: BookingStatus
}

export interface StudioClass {
  id: string
  name: string
  instructor: string
  room: string
  startsAt: string
  endsAt: string
  durationMinutes: number
  booked: number
  capacity: number
  status: ClassStatus
  waitlist: number
  attendees: Attendee[]
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Refunded'

export interface Invoice {
  id: string
  reference: string
  customer: string
  email: string
  issuedOn: string
  amountCents: number
  status: InvoiceStatus
  autoCollect: boolean
}

function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CLASS_NAMES = [
  'Yoga Flow', 'Reformer Pilates', 'HIIT Circuit', 'Spin Express', 'Barre Sculpt',
  'Boxing Fundamentals', 'Mobility & Stretch', 'Strength Lab', 'Vinyasa Yoga',
  'Core Conditioning', 'Aqua Fit', 'TRX Suspension', 'Zumba Party', 'Deep Stretch',
  'Olympic Lifting', 'Sunrise Meditation',
]

const INSTRUCTORS = [
  'Aung Kyaw Moe', 'Thiri San', 'Hein Htet Linn', 'Soe Thu Aung', 'Thiha Tun',
  'Aye Thet Poe', 'Kyaw Than Maw', 'Moe Thiri Aye', 'Tun Linn Soe', 'Thet Hein Thu',
]

const ROOMS = ['Studio A', 'Studio B', 'Mat Room', 'Spin Room', 'Outdoor Deck']

const NAME_SYLLABLES = [
  'Aung', 'Kyaw', 'Hein', 'Maw', 'Thu', 'Soe', 'Thiha', 'Than', 'Aye',
  'Moe', 'Htet', 'Poe', 'San', 'Tun', 'Linn', 'Thiri', 'Thet',
]

const PAYMENT_TYPES: PaymentType[] = ['One-time', 'Package', 'Membership']
const BOOKING_STATUSES: BookingStatus[] = ['Booked', 'Checked-in', 'Cancelled', 'No-show']
const INVOICE_STATUSES: InvoiceStatus[] = ['Paid', 'Pending', 'Overdue', 'Refunded']

function pick<T>(random: () => number, values: T[]): T {
  return values[Math.floor(random() * values.length)]
}

function buildName(random: () => number): string {
  const parts: string[] = []
  const length = random() < 0.45 ? 2 : 3
  while (parts.length < length) {
    const syllable = pick(random, NAME_SYLLABLES)
    if (parts.at(-1) !== syllable) parts.push(syllable)
  }
  return parts.join(' ')
}

function buildClasses(): StudioClass[] {
  const random = createRandom(20260211)
  const classes: StudioClass[] = []

  for (let day = 0; day < 3; day += 1) {
    for (let slot = 0; slot < 6; slot += 1) {
      const index = day * 6 + slot
      const id = `cls_${String(index + 1).padStart(3, '0')}`
      const hour = 7 + slot * 2
      const duration = pick(random, [45, 50, 60, 75])
      const capacity = 8 + Math.floor(random() * 14)

      const date = new Date(Date.UTC(2026, 1, 16 + day, hour, 0, 0))
      const ends = new Date(date.getTime() + duration * 60_000)

      const cancelled = index === 4
      const booked = cancelled ? 0 : index === 9 ? 0 : Math.min(capacity, Math.floor(random() * (capacity + 3)))
      const status: ClassStatus = cancelled ? 'Cancelled' : booked >= capacity ? 'Full' : 'Scheduled'

      const attendees: Attendee[] = Array.from({ length: booked }, (_, seat) => ({
        id: `${id}_att_${seat + 1}`,
        classId: id,
        customerName: buildName(random),
        paymentType: pick(random, PAYMENT_TYPES),
        bookingStatus: pick(random, BOOKING_STATUSES),
      }))

      classes.push({
        id,
        name: pick(random, CLASS_NAMES),
        instructor: pick(random, INSTRUCTORS),
        room: pick(random, ROOMS),
        startsAt: date.toISOString(),
        endsAt: ends.toISOString(),
        durationMinutes: duration,
        booked,
        capacity,
        status,
        waitlist: booked >= capacity ? Math.floor(random() * 5) : 0,
        attendees,
      })
    }
  }

  return classes
}

const INVOICE_COUNT = 5_000

function buildInvoices(): Invoice[] {
  const random = createRandom(777)
  return Array.from({ length: INVOICE_COUNT }, (_, index) => {
    const issued = new Date(Date.UTC(2025, 0, 1 + Math.floor(random() * 420)))
    return {
      id: `inv_${String(index + 1).padStart(5, '0')}`,
      reference: `INV-${2025 + Math.floor(index / 2500)}-${String(index + 1).padStart(5, '0')}`,
      customer: buildName(random),
      email: `customer${index + 1}@example.com`,
      issuedOn: issued.toISOString(),
      amountCents: Math.floor(random() * 48_000) + 1_200,
      status: pick(random, INVOICE_STATUSES),
      autoCollect: random() > 0.45,
    }
  })
}

export const db = {
  classes: buildClasses(),
  invoices: buildInvoices(),
}
