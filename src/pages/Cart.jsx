import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, Zap, Calendar, Repeat } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useServices } from '../context/ServicesContext'
import { iconForService } from '../lib/serviceIcon'

const ScheduleOption = ({ value, current, onChange, icon: Icon, title, sub }) => {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`text-left rounded-2xl border p-4 transition w-full ${active ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/20' : 'border-neutral-200 bg-white hover:border-brand-300'}`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-9 h-9 grid place-items-center rounded-full ${active ? 'bg-brand-400 text-cocoa' : 'bg-neutral-100 text-neutral-700'}`}>
          <Icon className="w-4 h-4" />
        </span>
        <div className="font-semibold text-neutral-900 text-sm">{title}</div>
      </div>
      <div className="mt-2 text-xs text-neutral-500">{sub}</div>
    </button>
  )
}

export default function Cart() {
  const { items, subtotal, setQty, removeItem } = useCart()
  const { fetchServices } = useServices()
  const [schedule, setSchedule] = useState('instant')
  const [scheduledAt, setScheduledAt] = useState('')
  const [cadence, setCadence] = useState('weekly')
  const navigate = useNavigate()

  // Fetch only the services that are in the cart
  useEffect(() => {
    if (items.length > 0) {
      const cartSlugs = items.map(item => item.slug)
      fetchServices(cartSlugs)
    }
  }, [items, fetchServices])

  const proceed = () => {
    if (items.length === 0) return
    navigate('/checkout', { state: { schedule, scheduledAt, cadence } })
  }

  if (items.length === 0) {
    return (
      <section className="pt-32 md:pt-36 pb-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="mx-auto w-16 h-16 grid place-items-center rounded-full bg-brand-50 text-brand-700">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-neutral-900">Your cart is empty</h1>
          <p className="mt-3 text-neutral-500">Pick from 18 trusted services and stack them into one booking.</p>
          <Link to="/services" className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-400 hover:bg-brand-500 text-cocoa font-semibold px-6 py-3">
            Browse services
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-32 md:pt-36 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <nav className="text-xs text-neutral-500 mb-4">
          <Link to="/" className="hover:text-brand-700">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-neutral-700">Cart</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900">Your booking</h1>
        <p className="mt-2 text-neutral-500 text-sm">Stack tasks into one visit. One verified Pro will handle it all.</p>

        <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Items + schedule */}
          <div>
            <div className="rounded-2xl bg-white ring-1 ring-neutral-100 divide-y">
              {items.map(it => (
                <div key={it.slug} className="p-4">
                  {/* Top: image + name + remove */}
                  <div className="flex gap-3 items-start">
                    {(() => {
                      const Icon = iconForService(it.name)
                      return <Icon className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-100 shrink-0 p-3 text-cocoa" strokeWidth={1.5} />
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-neutral-900 text-sm leading-snug break-words">{it.name}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{it.duration} · S${it.priceFrom.toFixed(2)} each</div>
                    </div>
                    <button
                      onClick={() => removeItem(it.slug)}
                      aria-label="Remove item"
                      className="text-neutral-400 hover:text-red-500 p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Bottom: qty + price */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-1 py-1">
                      <button onClick={() => setQty(it.slug, it.qty - 1)} aria-label="Decrease" className="w-7 h-7 grid place-items-center rounded-full hover:bg-white"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="text-sm font-semibold w-6 text-center">{it.qty}</span>
                      <button onClick={() => setQty(it.slug, it.qty + 1)} aria-label="Increase" className="w-7 h-7 grid place-items-center rounded-full hover:bg-white"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="font-bold text-neutral-900 text-sm">S${(it.priceFrom * it.qty).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-8 text-lg font-bold text-neutral-900">When should we come?</h2>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <ScheduleOption value="instant" current={schedule} onChange={setSchedule} icon={Zap} title="Instant" sub="Pro arrives in ~15 min" />
              <ScheduleOption value="scheduled" current={schedule} onChange={setSchedule} icon={Calendar} title="Scheduled" sub="Pick a date & time" />
              <ScheduleOption value="recurring" current={schedule} onChange={setSchedule} icon={Repeat} title="Recurring" sub="Daily / weekly cadence" />
            </div>

            {schedule === 'scheduled' && (
              <div className="mt-4 rounded-2xl bg-white ring-1 ring-neutral-100 p-4">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Date & time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-600"
                />
              </div>
            )}
            {schedule === 'recurring' && (
              <div className="mt-4 rounded-2xl bg-white ring-1 ring-neutral-100 p-4">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Cadence</label>
                <div className="flex flex-wrap gap-2">
                  {['daily', 'weekly', 'biweekly', 'monthly'].map(c => (
                    <button key={c} onClick={() => setCadence(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${cadence === c ? 'bg-brand-400 text-cocoa' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl bg-white ring-1 ring-neutral-100 p-5 shadow-soft">
              <h3 className="font-bold text-neutral-900">Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>S${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-neutral-600"><span>Visit fee</span><span>S$0</span></div>
                <div className="flex justify-between text-neutral-600"><span>Taxes</span><span>Included</span></div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between font-bold text-neutral-900">
                <span>Total</span><span>S${subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={proceed}
                className="mt-5 w-full rounded-full bg-brand-400 hover:bg-brand-500 text-cocoa font-semibold py-3 transition"
              >
                Continue to checkout
              </button>
              <p className="mt-3 text-[11px] text-neutral-400 text-center">Transparent flat pricing. No hidden charges.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
