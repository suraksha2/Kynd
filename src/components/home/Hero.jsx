import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import StoreButtons from '../StoreButtons'
import PhoneMockup from '../PhoneMockup'
import { cities } from '../../data/cities'

const API_BASE = 'http://localhost:3001'

const HeroFigure = () => (
  <img
    src="/images/hero-worker.png"
    alt="Kynd professional"
    className="h-full w-auto object-contain object-bottom select-none pointer-events-none"
    draggable="false"
  />
)

export default function Hero() {
  const [dbCities, setDbCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cities`)
      const json = await response.json()
      if (json.data) {
        setDbCities(json.data)
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
      setError('Failed to load cities')
    } finally {
      setLoading(false)
    }
  }

  // Use database cities if available, otherwise fallback to hardcoded cities
  const displayCities = dbCities.length > 0 ? dbCities.slice(0, 7) : [
    { slug: 'bangalore', name: 'Bangalore' },
    { slug: 'delhi', name: 'Delhi' },
    { slug: 'noida', name: 'Noida' },
    { slug: 'gurgaon', name: 'Gurgaon' },
    { slug: 'mumbai', name: 'Mumbai' },
    { slug: 'pune', name: 'Pune' },
    { slug: 'hyderabad', name: 'Hyderabad' }
  ]

  const remainingCount = dbCities.length > 0 ? Math.max(0, dbCities.length - 7) : 8

  return (
    <section className="relative overflow-hidden bg-cream pt-32 md:pt-36 pb-16">
      <div className="hidden md:block absolute right-0 bottom-0 h-[80%] z-0">
        <HeroFigure />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto md:ml-12 md:mr-auto px-6 md:px-10 md:text-left text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-cocoa leading-[1.05]">
          Trusted help,<br />kindly done.
        </h1>
        <p className="mt-4 text-base md:text-lg text-cocoa-600 max-w-md md:mx-0 mx-auto">
          Reliable professionals for your home, business and loved ones — delivered with care, respect and proper standards.
        </p>

        <div className="mt-7 flex flex-wrap items-center md:justify-start justify-center gap-3">
          <Link to="/services" className="inline-flex items-center justify-center rounded-full bg-brand-400 hover:bg-brand-500 text-cocoa font-semibold px-6 py-3 shadow-soft transition">
            Book a Service
          </Link>
          <a href="#how" className="inline-flex items-center justify-center rounded-full bg-white ring-1 ring-oat hover:bg-cream text-cocoa font-semibold px-6 py-3 transition">
            Learn More
          </a>
        </div>
        <StoreButtons className="mt-4 md:!justify-start" />

        <div className="mt-6 flex flex-wrap items-center md:justify-start justify-center gap-2 max-w-xl">
          {loading ? (
            <span className="text-xs text-neutral-500">Loading cities...</span>
          ) : error ? (
            <span className="text-xs text-red-500">{error}</span>
          ) : (
            <>
              {displayCities.map(city => {
                // Use cityName from API or name from fallback
                const cityName = city.cityName || city.name
                // Create slug from cityName if not present
                const slug = city.slug || cityName.toLowerCase().replace(/\s+/g, '-')
                return (
                  <Link key={slug} to={`/cities/${slug}`} className="px-3 py-1.5 rounded-full bg-white ring-1 ring-oat text-cocoa text-xs font-medium hover:bg-brand-50">
                    {cityName}
                  </Link>
                )
              })}
              {remainingCount > 0 && (
                <Link to="/cities" className="px-3 py-1.5 rounded-full bg-brand-400 text-cocoa text-xs font-semibold hover:bg-brand-500">
                  + {remainingCount} more cities
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
