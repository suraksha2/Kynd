import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { iconForService } from '../../lib/serviceIcon'
import { useCart } from '../../context/CartContext'
import { API_BASE } from '../../lib/api'

const ServiceTile = ({ s }) => {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const Icon = iconForService(s.name)
  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation()
    addItem(s); setAdded(true); setTimeout(() => setAdded(false), 1200)
  }
  return (
    <Link
      to={`/services/${s.slug}`}
      className="group relative flex flex-col items-center text-center p-3"
    >
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-neutral-100 group-hover:bg-brand-50 grid place-items-center transition">
        <Icon className="w-9 h-9 md:w-10 md:h-10 text-cocoa group-hover:scale-[1.08] transition duration-300" strokeWidth={1.75} />
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${s.name} to cart`}
          className={`absolute bottom-1 right-1 w-6 h-6 rounded-full grid place-items-center shadow-soft transition ${added ? 'bg-brand-400 text-cocoa scale-110' : 'bg-white text-neutral-700 hover:bg-brand-400 hover:text-cocoa opacity-0 group-hover:opacity-100'}`}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
      </div>
      <div className="mt-2 text-[11px] md:text-xs text-neutral-700 font-medium leading-snug">
        {s.name}
      </div>
      <div className="text-[10px] text-neutral-500">from {s.pricingFrom}</div>
    </Link>
  )
}

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_BASE}/services`)
        const result = await response.json()
        if (result.data) {
          const mappedServices = result.data.map(service => ({
            id: service.id,
            slug: service.name.toLowerCase().replace(/\s+/g, '-'),
            name: service.name,
            short: service.category || 'Professional service',
            img: service.image || import.meta.env.BASE_URL + 'images/hourly-bookings.webp',
            price: parseFloat(service.price),
            pricingFrom: `S$${parseFloat(service.price).toFixed(2)}`,
            duration: 'Variable',
            bullets: ['Professional service', 'Quality guaranteed', 'Trusted providers']
          }))
          setServices(mappedServices)
        }
      } catch (error) {
        console.error('Failed to fetch services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  if (loading) {
    return (
      <section id="services" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">Book trusted house<br />help.</h2>
            <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
              Loading services...
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="services" className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">Book trusted house<br />help.</h2>
          <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
            From cleaning and maintenance to childcare and elderly support, Kynd's got you covered. {services.length} services, transparent flat pricing.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {services.map(s => <ServiceTile key={s.id} s={s} />)}
        </div>

        <div className="mt-10 text-center">
          <Link to="/cart" className="inline-flex items-center justify-center rounded-full bg-brand-400 hover:bg-brand-500 text-cocoa font-semibold px-6 py-3 transition">
            View cart & checkout
          </Link>
        </div>
      </div>
    </section>
  )
}
