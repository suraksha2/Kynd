import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const BookingsContext = createContext(null)
const STORAGE_KEY = 'helpr.bookings.v1'

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

/**
 * Booking shape:
 * {
 *   bookingId, items: [{slug,name,img,priceFrom,qty,duration}], total,
 *   schedule: 'instant'|'scheduled'|'recurring', scheduledAt, cadence,
 *   contact: { name, phone, address, city, pincode },
 *   payment, placedAt,
 *   status: 'upcoming' | 'completed' | 'cancelled',
 *   history: [{ at, type, note }],
 *   provider: { id, name, mobile, city, rating, totalJobs }
 * }
 */

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(readStore)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings)) } catch {}
  }, [bookings])

  const addBooking = useCallback((order) => {
    const booking = {
      ...order,
      status: 'upcoming',
      history: [{ at: new Date().toISOString(), type: 'created', note: 'Booking placed' }],
    }
    setBookings(prev => [booking, ...prev])
    return booking
  }, [])

  const cancelBooking = useCallback((bookingId, reason = '') => {
    setBookings(prev => prev.map(b => b.bookingId === bookingId
      ? {
          ...b,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancelReason: reason,
          history: [...(b.history || []), { at: new Date().toISOString(), type: 'cancelled', note: reason || 'Cancelled by user' }],
        }
      : b
    ))
  }, [])

  const rescheduleBooking = useCallback((bookingId, newAt) => {
    setBookings(prev => prev.map(b => b.bookingId === bookingId
      ? {
          ...b,
          schedule: 'scheduled',
          scheduledAt: newAt,
          history: [...(b.history || []), { at: new Date().toISOString(), type: 'rescheduled', note: `Rescheduled to ${new Date(newAt).toLocaleString()}` }],
        }
      : b
    ))
  }, [])

  const getBooking = useCallback((bookingId) => bookings.find(b => b.bookingId === bookingId) || null, [bookings])

  // Bucket bookings into upcoming/past based on status + schedule time
  const { upcoming, past } = useMemo(() => {
    const now = Date.now()
    const upcoming = []
    const past = []
    for (const b of bookings) {
      if (b.status === 'cancelled' || b.status === 'completed') { past.push(b); continue }
      // status === 'upcoming'
      if (b.schedule === 'scheduled' && b.scheduledAt) {
        if (new Date(b.scheduledAt).getTime() < now) past.push(b)
        else upcoming.push(b)
      } else if (b.schedule === 'instant') {
        // instant bookings are "in progress" briefly, then past after 2h
        const placed = new Date(b.placedAt || 0).getTime()
        if (now - placed > 2 * 60 * 60 * 1000) past.push(b)
        else upcoming.push(b)
      } else {
        // recurring – always upcoming until cancelled
        upcoming.push(b)
      }
    }
    upcoming.sort((a, b) => {
      const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : new Date(a.placedAt).getTime()
      const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : new Date(b.placedAt).getTime()
      return ta - tb
    })
    past.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    return { upcoming, past }
  }, [bookings])

  const value = { bookings, upcoming, past, addBooking, cancelBooking, rescheduleBooking, getBooking }
  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>
}

export function useBookings() {
  const ctx = useContext(BookingsContext)
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider')
  return ctx
}
