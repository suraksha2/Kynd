import { Link, Navigate, useLocation } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:3001'

export default function BookingConfirmed() {
  const { state } = useLocation()
  const [order, setOrder] = useState(state || (() => {
    try { return JSON.parse(localStorage.getItem('kynd.lastOrder') || 'null') } catch { return null }
  })())
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState(null)

  // Handle payment verification when returning from Airwallex Hosted Payment Page
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const pendingOrderStr = localStorage.getItem('kynd.pendingOrder')
        if (!pendingOrderStr) return

        const pendingOrder = JSON.parse(pendingOrderStr)
        if (!pendingOrder.intentId || !pendingOrder.order) return

        setVerifying(true)
        setVerificationError(null)

        // Verify the payment status server-side
        const verifyRes = await fetch(`${API_BASE}/api/payments/${pendingOrder.intentId}`)
        const verify = await verifyRes.json()
        const ok = verifyRes.ok && ['SUCCEEDED', 'REQUIRES_CAPTURE'].includes(verify.status)

        if (!ok) {
          throw new Error('Payment could not be verified. Please contact support.')
        }

        // Payment succeeded, create the booking
        const paidOrder = {
          ...pendingOrder.order,
          paymentIntentId: pendingOrder.intentId,
          paymentStatus: verify.status
        }

        const response = await fetch(`${API_BASE}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paidOrder)
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create booking')
        }

        // Clear pending order and set confirmed order
        localStorage.removeItem('kynd.pendingOrder')
        try { localStorage.setItem('kynd.lastOrder', JSON.stringify(paidOrder)) } catch {}
        setOrder(paidOrder)
      } catch (error) {
        console.error('Payment verification error:', error)
        setVerificationError(error.message || 'Payment verification failed.')
      } finally {
        setVerifying(false)
      }
    }

    if (!state) {
      verifyPayment()
    }
  }, [state])

  if (!order && !verifying) return <Navigate to="/" replace />
  if (verifying) {
    return (
      <section className="pt-32 md:pt-36 pb-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="rounded-3xl bg-white ring-1 ring-neutral-100 shadow-soft p-8 text-center">
            <div className="mx-auto w-16 h-16 grid place-items-center rounded-full bg-brand-50 text-brand-700">
              <Loader2 className="w-9 h-9 animate-spin" />
            </div>
            <h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-neutral-900">Verifying payment...</h1>
            <p className="mt-2 text-neutral-500">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </section>
    )
  }

  if (verificationError) {
    return (
      <section className="pt-32 md:pt-36 pb-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="rounded-3xl bg-white ring-1 ring-neutral-100 shadow-soft p-8 text-center">
            <h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-red-600">Payment verification failed</h1>
            <p className="mt-2 text-neutral-500">{verificationError}</p>
            <Link to="/cart" className="mt-6 inline-block rounded-full bg-brand-400 hover:bg-brand-500 text-cocoa font-semibold px-6 py-3 text-sm">Return to cart</Link>
          </div>
        </div>
      </section>
    )
  }

  const scheduleLabel = order.schedule === 'instant'
    ? 'Instant — your Pro is being assigned'
    : order.schedule === 'scheduled'
      ? `Scheduled${order.scheduledAt ? ` for ${new Date(order.scheduledAt).toLocaleString()}` : ''}`
      : `Recurring (${order.cadence})`

  return (
    <section className="pt-32 md:pt-36 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <div className="rounded-3xl bg-white ring-1 ring-neutral-100 shadow-soft p-8 text-center">
          <div className="mx-auto w-16 h-16 grid place-items-center rounded-full bg-brand-50 text-brand-700">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-neutral-900">Booking confirmed</h1>
          <p className="mt-2 text-neutral-500">Thanks{order.contact?.name ? `, ${order.contact.name}` : ''} — we'll send updates to {order.contact?.phone}.</p>

          <div className="mt-6 rounded-2xl bg-neutral-50 p-4 text-left text-sm">
            <div className="flex justify-between"><span className="text-neutral-500">Booking ID</span><span className="font-semibold">{order.bookingId}</span></div>
            <div className="mt-2 flex justify-between"><span className="text-neutral-500">When</span><span className="text-right">{scheduleLabel}</span></div>
            <div className="mt-2 flex justify-between"><span className="text-neutral-500">Address</span><span className="text-right max-w-[60%]">{order.contact?.address}, {order.contact?.city} {order.contact?.pincode}</span></div>
            <div className="mt-2 flex justify-between"><span className="text-neutral-500">Payment</span><span className="capitalize">{order.payment === 'cod' ? 'Cash after service' : order.payment.toUpperCase()}</span></div>
            <div className="mt-3 pt-3 border-t">
              <div className="text-neutral-500 mb-2">Services</div>
              <ul className="space-y-1">
                {order.items.map(it => (
                  <li key={it.slug} className="flex justify-between"><span>{it.name} × {it.qty}</span><span>S${(it.priceFrom * it.qty).toFixed(2)}</span></li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t flex justify-between font-bold text-neutral-900"><span>Total</span><span>S${order.total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-6 py-3 text-sm">Back to home</Link>
            <Link to={`/bookings/${order.bookingId}`} className="rounded-full bg-brand-400 hover:bg-brand-500 text-cocoa font-semibold px-6 py-3 text-sm">View booking</Link>
            <Link to="/services" className="rounded-full bg-white ring-1 ring-neutral-200 hover:ring-brand-300 text-neutral-900 font-semibold px-6 py-3 text-sm">Book another</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
