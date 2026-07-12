import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { iconForService } from '../lib/serviceIcon'
import { API_BASE } from '../lib/api'

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
            img: service.image || '/images/hourly-bookings.webp',
            price: parseFloat(service.price),
            pricingFrom: `S$${parseFloat(service.price).toFixed(2)}`,
            duration: service.duration || 'Variable'
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
      <div className="pt-32 pb-20 bg-cream min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">All Kynd services</h1>
            <p className="mt-3 text-neutral-600 max-w-xl mx-auto">Loading services...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20 bg-cream min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">All Kynd services</h1>
          <p className="mt-3 text-neutral-600 max-w-xl mx-auto">{services.length} trusted services. Transparent flat pricing. Book a Pro in minutes.</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map(s => (
            <Link key={s.id} to={`/services/${s.slug}`} className="group rounded-2xl bg-white border border-neutral-100 overflow-hidden hover:shadow-soft transition">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-100 grid place-items-center">
                {(() => {
                  const Icon = iconForService(s.name)
                  return <Icon className="w-12 h-12 md:w-14 md:h-14 text-cocoa group-hover:scale-[1.08] transition duration-300" strokeWidth={1.75} />
                })()}
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm text-brand-900">{s.name}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">From {s.pricingFrom} • {s.duration}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
