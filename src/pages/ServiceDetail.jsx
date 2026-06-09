import { useState, useEffect } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { Check, X, ShoppingBag, Zap, Clock, Tag } from 'lucide-react'
import CitiesGrid from '../components/CitiesGrid'
import { useCart } from '../context/CartContext'
import { useServices } from '../context/ServicesContext'
import { DownloadCta } from './Home'
import { cities } from '../data/cities'

const BookingCard = ({ svc }) => {
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)
  const onAdd = () => { addItem(svc); setAdded(true); setTimeout(() => setAdded(false), 1500) }
  const onBook = () => { addItem(svc); navigate('/cart') }
  return (
    <div className="rounded-2xl bg-white ring-1 ring-neutral-100 shadow-soft p-4 w-full md:w-[320px]">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-widest text-brand-700">FROM</div>
        <div className="inline-flex items-center gap-1 text-[11px] text-neutral-500"><Clock className="w-3 h-3" /> {svc.duration}</div>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-3xl font-extrabold text-neutral-900">{svc.pricingFrom}</div>
        <div className="text-xs text-neutral-500">flat · per visit</div>
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 text-[11px] font-semibold px-2.5 py-1">
        <Zap className="w-3 h-3" /> Pro arrives in ~15 min
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onAdd} className={`rounded-full font-semibold text-sm py-2.5 transition ${added ? 'bg-brand-50 text-brand-700' : 'bg-neutral-900 hover:bg-neutral-800 text-white'}`}>
          {added ? 'Added ✓' : 'Add to cart'}
        </button>
        <button onClick={onBook} className="rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-2.5 transition">
          Book now
        </button>
      </div>
      <p className="mt-3 flex items-center gap-1 text-[11px] text-neutral-500"><Tag className="w-3 h-3" /> Transparent flat pricing. No advance.</p>
    </div>
  )
}

/* ---------- Compact hero matching the reference screenshot ---------- */
const ServiceHero = ({ svc }) => (
  <section className="relative overflow-hidden bg-white pt-28 md:pt-32 pb-10">
    {/* soft green corner blobs to match the screenshot */}
    <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-100/70 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-brand-100/70 blur-3xl pointer-events-none" />

    <div className="relative max-w-5xl mx-auto px-6">
      {/* breadcrumbs */}
      <nav className="text-xs text-neutral-500 mb-6">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-1.5">›</span>
        <Link to="/services" className="hover:text-brand-700">Services</Link>
        <span className="mx-1.5">›</span>
        <span className="text-neutral-700">{svc.name}</span>
      </nav>

      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
            {svc.name}
          </h1>
          <p className="mt-4 text-neutral-600 max-w-md text-sm md:text-base">
            {svc.short}
          </p>
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <span className="text-amber-400">★★★★★</span>
              <span>4.9 from <strong className="text-neutral-700">15,000+</strong> homes</span>
            </div>
          </div>
          <div className="mt-5 w-full md:w-[260px] aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-100 shadow-soft md:hidden">
            <img src={svc.img} alt={svc.name} className="w-full h-full object-cover" />
          </div>
          <div className="mt-6">
            <BookingCard svc={svc} />
          </div>
        </div>

        {/* tile image (rounded-3xl) - desktop */}
        <div className="hidden md:block w-full md:w-[260px] aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-100 shadow-soft">
          <img src={svc.img} alt={svc.name} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </section>
)

/* ---------- What's included / Not included two-column block ---------- */
const Inclusions = ({ svc }) => {
  const notIncluded = svc.notIncluded || [
    'Specialty deep-clean services such as ceiling, exterior facade or fumigation',
    'Removal of heavy or industrial machinery',
    'Use of harsh chemicals not approved by Helpr',
    'Pickup or disposal of hazardous waste',
    'Anything outside the scope of the booked service',
    'No-stage rescue / handling of belongings beyond reach'
  ]
  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-extrabold text-brand-900">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white grid place-items-center">
              <Check className="w-4 h-4" strokeWidth={3} />
            </span>
            What's included
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm text-neutral-700">
            {svc.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-extrabold text-neutral-700">
            <span className="w-6 h-6 rounded-full bg-neutral-300 text-white grid place-items-center">
              <X className="w-4 h-4" strokeWidth={3} />
            </span>
            Not included
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm text-neutral-500">
            {notIncluded.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-neutral-400 font-bold">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- "More ways to keep your home clean" — icon-tile grid of other services ---------- */
const MoreServices = ({ currentSlug, allServices }) => {
  const others = allServices.filter(s => s.slug !== currentSlug)
  return (
    <section className="py-14 bg-neutral-50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 leading-tight">
          More ways to keep your<br />home clean
        </h2>
        <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
          {others.map(s => (
            <Link
              key={s.id}
              to={`/services/${s.slug}`}
              className="group rounded-2xl bg-white p-3 md:p-4 hover:shadow-soft transition flex flex-col items-center text-center"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-100 grid place-items-center">
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-500"
                />
              </div>
              <div className="mt-2 text-[11px] md:text-xs font-medium text-neutral-700 leading-snug">
                {s.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const { services, loading } = useServices()
  const [availableCities, setAvailableCities] = useState([])

  useEffect(() => {
    const fetchCitiesForService = async () => {
      const svc = services.find(s => s.slug === slug)
      if (svc) {
        try {
          const response = await fetch(`http://localhost:3001/api/city-services/by-service/${svc.id}`)
          const result = await response.json()
          if (result.data) {
            setAvailableCities(result.data)
          }
        } catch (error) {
          console.error('Failed to fetch cities for service:', error)
        }
      }
    }
    if (services.length > 0) {
      fetchCitiesForService()
    }
  }, [slug, services])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    )
  }

  const svc = services.find(s => s.slug === slug)
  if (!svc) return <Navigate to="/services" replace />

  // Map city IDs from backend to actual city objects from static data
  const filteredCities = availableCities.length > 0
    ? cities.filter(city => availableCities.some(ac => ac.cityId === city.id.toString()))
    : []

  return (
    <div>
      <ServiceHero svc={svc} />
      <Inclusions svc={svc} />
      {filteredCities.length > 0 ? (
        <CitiesGrid
          title={`Available in ${filteredCities.length} ${filteredCities.length === 1 ? 'city' : 'cities'}`}
          className="bg-white"
          filteredCities={filteredCities}
        />
      ) : (
        <section className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
              No cities available for this service yet
            </h2>
            <p className="mt-4 text-neutral-600">
              This service is not currently available in any cities. Please check back later.
            </p>
          </div>
        </section>
      )}
      <MoreServices currentSlug={svc.slug} allServices={services} />
      <DownloadCta />
    </div>
  )
}
