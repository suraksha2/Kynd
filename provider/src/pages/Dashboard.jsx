import { useEffect, useMemo, useState } from 'react'
import {
  Wrench, LogOut, RefreshCw, Loader2, Calendar, Clock, MapPin,
  Phone, User, IndianRupee, CheckCircle2, XCircle, CircleDot, AlertCircle,
} from 'lucide-react'
import { useAuth, API_BASE } from '../context/AuthContext'

const STATUS_META = {
  upcoming: { label: 'Upcoming', className: 'bg-amber-100 text-amber-800', icon: CircleDot },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700', icon: XCircle },
}

function parseItems(items) {
  try {
    const parsed = typeof items === 'string' ? JSON.parse(items) : items
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatDateTime(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default function Dashboard() {
  const { user, token, logout } = useAuth()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  const authFetch = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authFetch(`${API_BASE}/provider/bookings`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load tasks.')
      setBookings(data.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    setError('')
    try {
      const res = await authFetch(`${API_BASE}/provider/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update task.')
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    } catch (err) {
      setError(err.message || 'Failed to update task.')
    } finally {
      setUpdatingId(null)
    }
  }

  const counts = useMemo(() => {
    const c = { all: bookings.length, upcoming: 0, completed: 0, cancelled: 0 }
    for (const b of bookings) if (c[b.status] !== undefined) c[b.status] += 1
    return c
  }, [bookings])

  const visible = useMemo(
    () => (filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter]
  )

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Kynd Logo" className="h-10 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="font-extrabold text-cocoa text-xl leading-tight truncate">Kynd Provider</p>
              <p className="text-sm text-gray-500 truncate">{user?.name || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadBookings}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-cocoa">My Tasks</h1>
          <p className="text-gray-500 mt-2 text-base">Jobs assigned to you by the Kynd team.</p>
        </div>

        {/* Filter tabs */}
        <div className="bg-white inline-flex rounded-2xl p-2 shadow-sm mb-8 gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === t.id
                  ? 'bg-brand-500 text-cocoa shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
              <span className="ml-2 text-xs opacity-70 bg-white/20 px-2 py-0.5 rounded-full">{counts[t.id] ?? 0}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm px-5 py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-3xl border border-gray-100 min-h-[400px] overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
                <p className="text-gray-500">Loading tasks...</p>
              </div>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                <CircleDot className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No tasks here</p>
              <p className="text-gray-400 text-sm mt-1">Assigned jobs will show up on this screen.</p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-4">
              {visible.map((b) => (
                <TaskCard
                  key={b.id}
                  booking={b}
                  updating={updatingId === b.id}
                  onUpdate={updateStatus}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function TaskCard({ booking, updating, onUpdate }) {
  const items = parseItems(booking.items)
  const meta = STATUS_META[booking.status] || STATUS_META.upcoming
  const StatusIcon = meta.icon
  const when = formatDateTime(booking.scheduled_at) || formatDateTime(booking.placed_at)

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-400 mb-1">#{booking.booking_id}</p>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {items.length > 0
                ? items.map((it) => it.name || it.serviceName || it.title || 'Service').join(', ')
                : 'Service'}
            </h3>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${meta.className} shrink-0`}>
            <StatusIcon className="w-4 h-4" />
            {meta.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <Detail icon={Calendar} label={booking.schedule === 'instant' ? 'ASAP' : when} />
          {booking.cadence && <Detail icon={Clock} label={booking.cadence} />}
          <Detail icon={User} label={booking.contact_name} />
          <Detail icon={Phone} label={booking.contact_phone} isLink={`tel:${booking.contact_phone}`} />
          <Detail
            icon={MapPin}
            label={[booking.contact_address, booking.contact_area, booking.contact_city, booking.contact_pincode]
              .filter(Boolean)
              .join(', ')}
            className="sm:col-span-2"
          />
          <Detail
            icon={IndianRupee}
            label={`${Number(booking.total).toLocaleString('en-IN')} · ${booking.payment}`}
          />
        </div>
      </div>

      {booking.status === 'upcoming' && (
        <div className="border-t border-gray-200 p-4 sm:p-5 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
          <button
            disabled={updating}
            onClick={() => onUpdate(booking.id, 'completed')}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-60 text-white text-sm font-semibold py-3 transition-all shadow-sm"
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Mark completed
          </button>
          <button
            disabled={updating}
            onClick={() => onUpdate(booking.id, 'cancelled')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-60 text-gray-700 text-sm font-semibold px-6 py-3 transition-all"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

function Detail({ icon: Icon, label, className = '', isLink }) {
  if (!label) return null
  return (
    <div className={`flex items-start gap-2 text-neutral-600 ${className}`}>
      <Icon className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
      {isLink ? (
        <a href={isLink} className="hover:text-brand-700 break-words">{label}</a>
      ) : (
        <span className="break-words">{label}</span>
      )}
    </div>
  )
}
