import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, ChevronRight, ShoppingBag, CheckCircle2, XCircle, Repeat, Zap } from 'lucide-react'
import { useBookings } from '../context/BookingsContext'

function StatusPill({ booking }) {
  if (booking.status === 'cancelled') {
    return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700"><XCircle className="w-3 h-3" /> Cancelled</span>
  }
  if (booking.status === 'completed') {
    return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Completed</span>
  }
  // upcoming
  if (booking.schedule === 'instant') {
    return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700"><Zap className="w-3 h-3" /> In progress</span>
  }
  if (booking.schedule === 'recurring') {
    return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700"><Repeat className="w-3 h-3" /> Recurring</span>
  }
  return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700"><Calendar className="w-3 h-3" /> Scheduled</span>
}

function whenLabel(b) {
  if (b.schedule === 'instant') return `Booked ${new Date(b.placedAt).toLocaleString()}`
  if (b.schedule === 'recurring') return `Recurring · ${b.cadence}`
  if (b.scheduledAt) return new Date(b.scheduledAt).toLocaleString()
  return new Date(b.placedAt).toLocaleString()
}

function BookingCard({ booking }) {
  const firstItem = booking.items?.[0]
  const extra = (booking.items?.length || 1) - 1
  return (
    <Link
      to={`/bookings/${booking.bookingId}`}
      className="block rounded-2xl bg-white ring-1 ring-neutral-100 hover:ring-brand-200 hover:shadow-soft transition p-4"
    >
      <div className="flex items-start gap-3">
        {firstItem?.img ? (
          <img src={firstItem.img} alt="" className="w-14 h-14 rounded-xl object-cover bg-neutral-100" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-neutral-900 truncate">
              {firstItem?.name || 'Service'}{extra > 0 ? ` +${extra} more` : ''}
            </h3>
            <StatusPill booking={booking} />
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate">{whenLabel(booking)}</span>
          </div>
          {booking.contact?.address && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{booking.contact.address}, {booking.contact.city}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-neutral-500">#{booking.bookingId}</span>
            <span className="text-sm font-bold text-neutral-900">S${booking.total}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-300 mt-2 shrink-0" />
      </div>
    </Link>
  )
}

export default function Bookings() {
  const { upcoming, past } = useBookings()
  const [tab, setTab] = useState('upcoming')
  const list = tab === 'upcoming' ? upcoming : past

  return (
    <section className="pt-28 md:pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-5">
        <nav className="text-xs text-neutral-500 mb-3">
          <Link to="/" className="hover:text-brand-700">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-neutral-700">My bookings</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">My bookings</h1>
        <p className="mt-1 text-sm text-neutral-500">Track, reschedule or cancel your services.</p>

        <div className="mt-5 inline-flex p-1 rounded-full bg-neutral-100">
          {[
            { id: 'upcoming', label: `Upcoming${upcoming.length ? ` · ${upcoming.length}` : ''}` },
            { id: 'past', label: `Past${past.length ? ` · ${past.length}` : ''}` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === t.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {list.length === 0 ? (
            <div className="rounded-2xl bg-white ring-1 ring-neutral-100 p-8 text-center">
              <div className="mx-auto w-12 h-12 grid place-items-center rounded-full bg-brand-50 text-brand-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="mt-3 font-bold text-neutral-900">
                {tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings yet'}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                {tab === 'upcoming' ? 'Book a service to see it here.' : 'Completed and cancelled bookings will appear here.'}
              </p>
              <Link to="/services" className="mt-4 inline-flex rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2 text-sm">
                Browse services
              </Link>
            </div>
          ) : (
            list.map(b => <BookingCard key={b.bookingId} booking={b} />)
          )}
        </div>
      </div>
    </section>
  )
}
