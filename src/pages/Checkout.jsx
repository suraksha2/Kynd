import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Wallet, Banknote, ShieldCheck } from 'lucide-react'
import { useCart } from '../context/CartContext'

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-neutral-700 mb-1.5">{label}</span>
    {children}
  </label>
)

const inputCls = 'w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-600'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('Bangalore')
  const [pincode, setPincode] = useState('')
  const [pay, setPay] = useState('upi')
  const [submitting, setSubmitting] = useState(false)

  if (items.length === 0) return <Navigate to="/cart" replace />

  const schedule = state?.schedule || 'instant'
  const scheduledAt = state?.scheduledAt || ''
  const cadence = state?.cadence || 'weekly'

  const submit = (e) => {
    e.preventDefault()
    if (!name || !phone || !address || !pincode) return
    setSubmitting(true)
    setTimeout(() => {
      const bookingId = 'HLP' + Math.random().toString(36).slice(2, 8).toUpperCase()
      const order = {
        bookingId,
        items,
        total: subtotal,
        schedule, scheduledAt, cadence,
        contact: { name, phone, address, city, pincode },
        payment: pay,
        placedAt: new Date().toISOString()
      }
      try { localStorage.setItem('helpr.lastOrder', JSON.stringify(order)) } catch {}
      clear()
      navigate('/booking/confirmed', { state: order, replace: true })
    }, 600)
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
                    <select className={inputCls} value={city} onChange={e => setCity(e.target.value)}>
                      {['Ahmedabad','Bangalore','Chennai','Delhi','Faridabad','Ghaziabad','Gurgaon','Hyderabad','Jaipur','Kolkata','Mumbai','Navi Mumbai','Noida','Pune','Thane'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Pincode"><input className={inputCls} value={pincode} onChange={e => setPincode(e.target.value)} required /></Field>
                </div>
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
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500"><ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Demo checkout — no real payment is taken.</p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl bg-white ring-1 ring-neutral-100 p-5 shadow-soft">
              <h3 className="font-bold text-neutral-900">Summary</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map(it => (
                  <li key={it.slug} className="flex justify-between gap-2 text-neutral-700">
                    <span className="truncate">{it.name} × {it.qty}</span>
                    <span>S${it.priceFrom * it.qty}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t text-xs text-neutral-500">{scheduleLabel}</div>
              <div className="mt-3 flex justify-between font-bold text-neutral-900">
                <span>Total</span><span>S${subtotal}</span>
              </div>
              <button disabled={submitting} className="mt-5 w-full rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 transition">
                {submitting ? 'Confirming…' : `Pay & confirm · S$${subtotal}`}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </section>
  )
}
