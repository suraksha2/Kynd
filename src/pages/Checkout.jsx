import { useState, useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Wallet, Banknote, ShieldCheck, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useBookings } from '../context/BookingsContext'
import AirwallexDropIn from '../components/AirwallexDropIn'

const API_BASE = 'http://localhost:3001'

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-neutral-700 mb-1.5">{label}</span>
    {children}
  </label>
)

const inputCls = 'w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-600'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { addBooking } = useBookings()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [cities, setCities] = useState([])
  const [selectedArea, setSelectedArea] = useState('')
  const [pincode, setPincode] = useState('')
  const [pay, setPay] = useState('card')
  const [submitting, setSubmitting] = useState(false)
  // When set, the Airwallex Drop-in modal is shown for an online payment.
  const [paymentSession, setPaymentSession] = useState(null)
  const [payError, setPayError] = useState(null)
  const [loadingCities, setLoadingCities] = useState(true)
  const [citiesError, setCitiesError] = useState(null)

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/cities')
        if (!response.ok) {
          throw new Error('Failed to fetch cities')
        }
        const result = await response.json()
        const data = result.data || []
        // Transform backend city data to match frontend format
        const transformedCities = data.map(city => ({
          id: city.id,
          slug: city.cityName.toLowerCase().replace(/\s+/g, '-'),
          name: city.cityName,
          tagline: `Trusted house help across ${city.cityName}.`,
          img: '',
          areas: city.areas || []
        }))
        setCities(transformedCities)
        // Set first city as default if available
        if (transformedCities.length > 0) {
          setCity(transformedCities[0].name)
        }
      } catch (error) {
        setCitiesError(error.message)
        console.error('Error fetching cities:', error)
      } finally {
        setLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  // Get areas for selected city from API response
  const selectedCityData = cities.find(c => c.name === city)
  const cityAreas = selectedCityData?.areas || []

  const handleAreaChange = (e) => {
    const value = e.target.value
    setSelectedArea(value)
  }

  const handleCityChange = (e) => {
    setCity(e.target.value)
    setSelectedArea('')
    setPincode('')
  }

  if (items.length === 0) return <Navigate to="/cart" replace />

  const schedule = state?.schedule || 'instant'
  const scheduledAt = state?.scheduledAt || ''
  const cadence = state?.cadence || 'weekly'

  const buildOrder = () => {
    const bookingId = 'HLP' + Math.random().toString(36).slice(2, 8).toUpperCase()
    return {
      bookingId,
      items,
      total: subtotal,
      schedule, scheduledAt, cadence,
      contact: { name, phone, address, city, pincode, area: selectedArea },
      payment: pay,
      placedAt: new Date().toISOString()
    }
  }

  // Persist the booking on the backend and route to the confirmation page.
  const finalizeBooking = async (order) => {
    const response = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create booking')
    }
    try { localStorage.setItem('helpr.lastOrder', JSON.stringify(order)) } catch {}
    addBooking(order)
    clear()
    navigate('/booking/confirmed', { state: order, replace: true })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!name || !phone || !address || !pincode) return
    setPayError(null)
    setSubmitting(true)

    const order = buildOrder()

    // Cash after service: no online payment, create the booking directly.
    if (pay === 'cod') {
      try {
        await finalizeBooking(order)
      } catch (error) {
        console.error('Booking error:', error)
        alert(error.message || 'Failed to create booking. Please try again.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Online payment via Airwallex: create a PaymentIntent, then open Drop-in.
    try {
      const res = await fetch(`${API_BASE}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: order.total,
          merchantOrderId: order.bookingId,
          metadata: { bookingId: order.bookingId, customer: name, phone },
          returnUrl: `${window.location.origin}/booking/confirmed`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start payment')

      setPaymentSession({
        intentId: data.id,
        clientSecret: data.clientSecret,
        currency: data.currency,
        order,
      })
    } catch (error) {
      console.error('Payment init error:', error)
      alert(error.message || 'Could not start payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = async () => {
    const session = paymentSession
    if (!session) return
    setSubmitting(true)
    try {
      // Verify the payment status server-side before fulfilling the booking.
      const verifyRes = await fetch(`${API_BASE}/api/payments/${session.intentId}`)
      const verify = await verifyRes.json()
      const ok = verifyRes.ok && ['SUCCEEDED', 'REQUIRES_CAPTURE'].includes(verify.status)
      if (!ok) throw new Error('Payment could not be verified. Please contact support.')

      const paidOrder = { ...session.order, paymentIntentId: session.intentId, paymentStatus: verify.status }
      setPaymentSession(null)
      await finalizeBooking(paidOrder)
    } catch (error) {
      console.error('Payment verification error:', error)
      setPayError(error.message || 'Payment verification failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const scheduleLabel = schedule === 'instant'
    ? 'Instant — Pro arrives in ~15 min'
    : schedule === 'scheduled'
      ? `Scheduled${scheduledAt ? ` for ${new Date(scheduledAt).toLocaleString()}` : ''}`
      : `Recurring (${cadence})`

  return (
    <section className="pt-32 md:pt-36 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <nav className="text-xs text-neutral-500 mb-4">
          <Link to="/" className="hover:text-brand-700">Home</Link>
          <span className="mx-1.5">›</span>
          <Link to="/cart" className="hover:text-brand-700">Cart</Link>
          <span className="mx-1.5">›</span>
          <span className="text-neutral-700">Checkout</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900">Checkout</h1>

        <form onSubmit={submit} className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white ring-1 ring-neutral-100 p-5">
              <h2 className="font-bold text-neutral-900">Contact</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <Field label="Full name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} required /></Field>
                <Field label="Phone"><input className={inputCls} type="tel" value={phone} onChange={e => setPhone(e.target.value)} required /></Field>
              </div>
            </div>

            <div className="rounded-2xl bg-white ring-1 ring-neutral-100 p-5">
              <h2 className="font-bold text-neutral-900">Service address</h2>
              <div className="mt-4 grid gap-4">
                <Field label="Address"><textarea rows={2} className={inputCls} value={address} onChange={e => setAddress(e.target.value)} required /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="City">
                    {loadingCities ? (
                      <select className={inputCls} disabled>
                        <option>Loading cities...</option>
                      </select>
                    ) : citiesError ? (
                      <select className={inputCls} disabled>
                        <option>Error loading cities</option>
                      </select>
                    ) : (
                      <select className={inputCls} value={city} onChange={handleCityChange}>
                        {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    )}
                  </Field>
                  <Field label="Area">
                    <select className={inputCls} value={selectedArea} onChange={handleAreaChange} required>
                      <option value="">Select area</option>
                      {cityAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Pincode"><input className={inputCls} value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Enter your pincode" required /></Field>
              </div>
            </div>

            <div className="rounded-2xl bg-white ring-1 ring-neutral-100 p-5">
              <h2 className="font-bold text-neutral-900">Payment method</h2>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {[
                  { id: 'upi', label: 'UPI', icon: Wallet },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'cod', label: 'Cash after service', icon: Banknote }
                ].map(p => {
                  const active = pay === p.id
                  const Icon = p.icon
                  return (
                    <button key={p.id} type="button" onClick={() => setPay(p.id)} className={`rounded-xl border p-3 text-left transition ${active ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/20' : 'border-neutral-200 bg-white hover:border-brand-300'}`}>
                      <Icon className={`w-4 h-4 ${active ? 'text-brand-700' : 'text-neutral-500'}`} />
                      <div className="mt-2 text-sm font-semibold text-neutral-900">{p.label}</div>
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500"><ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> {pay === 'cod' ? 'Pay the professional in cash after the service.' : 'Secure online payment processed by Airwallex.'}</p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl bg-white ring-1 ring-neutral-100 p-5 shadow-soft">
              <h3 className="font-bold text-neutral-900">Summary</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map(it => (
                  <li key={it.slug} className="flex justify-between gap-2 text-neutral-700">
                    <span className="truncate">{it.name} × {it.qty}</span>
                    <span>S${(it.priceFrom * it.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t text-xs text-neutral-500">{scheduleLabel}</div>
              <div className="mt-3 flex justify-between font-bold text-neutral-900">
                <span>Total</span><span>S${subtotal.toFixed(2)}</span>
              </div>
              <button disabled={submitting} className="mt-5 w-full rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 transition">
                {submitting
                  ? 'Processing…'
                  : pay === 'cod'
                    ? `Place booking · S$${subtotal.toFixed(2)}`
                    : `Pay & confirm · S$${subtotal.toFixed(2)}`}
              </button>
            </div>
          </aside>
        </form>
      </div>

      {paymentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div>
                <h3 className="font-bold text-neutral-900">Complete payment</h3>
                <p className="text-xs text-neutral-500">Total S${paymentSession.order.total.toFixed(2)} · {paymentSession.order.bookingId}</p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentSession(null)}
                disabled={submitting}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-5">
              {payError && (
                <div className="mb-3 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{payError}</div>
              )}
              <AirwallexDropIn
                intentId={paymentSession.intentId}
                clientSecret={paymentSession.clientSecret}
                currency={paymentSession.currency}
                onSuccess={handlePaymentSuccess}
                onError={(msg) => setPayError(msg)}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
