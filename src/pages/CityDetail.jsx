import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { findCity } from '../data/cities'
import { services } from '../data/services'
import StoreButtons from '../components/StoreButtons'
import CitiesGrid from '../components/CitiesGrid'
import { DownloadCta } from './Home'

/* ---------- City hero ---------- */
const CityHero = ({ city }) => (
  <section className="relative overflow-hidden bg-white pt-28 md:pt-32 pb-10">
    {/* soft green corner blobs */}
    <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-100/70 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-brand-100/70 blur-3xl pointer-events-none" />

    <div className="relative max-w-5xl mx-auto px-6">
      <nav className="text-xs text-neutral-500 mb-6">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-1.5">›</span>
        <Link to="/cities" className="hover:text-brand-700">Cities</Link>
        <span className="mx-1.5">›</span>
        <span className="text-neutral-700">{city.name}</span>
      </nav>

      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-brand-700">
            <MapPin className="w-3.5 h-3.5" /> Helpr in {city.name}
          </div>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
            House help in<br />{city.name}, in minutes.
          </h1>
          <p className="mt-4 text-neutral-600 max-w-md text-sm md:text-base">
            {city.tagline} Book trained, background-verified Pros for cleaning, laundry, kitchen and bathroom upkeep — across {city.areas.length}+ localities.
          </p>
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <StoreButtons />
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9 from <strong className="text-neutral-700">15,000+</strong> homes</span>
            </div>
          </div>
        </div>

        {/* city image tile */}
        <div className="w-full md:w-[260px] aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-100 shadow-soft relative">
          <img
            src={city.img}
            alt={city.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute left-3 bottom-3">
            <span className="inline-block bg-black/55 backdrop-blur-sm text-white text-sm font-semibold px-2.5 py-1 rounded-md">
              {city.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
)

/* ---------- Localities served ---------- */
const Localities = ({ city }) => (
  <section className="py-12 bg-neutral-50">
    <div className="max-w-5xl mx-auto px-6">
      <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">
        Localities we serve in {city.name}
      </h2>
      <p className="mt-2 text-sm text-neutral-500">Don't see yours? Open the app — we're adding new localities every week.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {city.areas.map(a => (
          <span key={a} className="inline-flex items-center gap-1.5 bg-white border border-neutral-200 rounded-full px-3 py-1.5 text-sm text-neutral-700">
            <MapPin className="w-3.5 h-3.5 text-brand-600" /> {a}
          </span>
        ))}
      </div>
    </div>
  </section>
)

/* ---------- Services available in this city ---------- */
const ServicesInCity = ({ city }) => (
  <section className="py-14">
    <div className="max-w-5xl mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 leading-tight">
        Services available in<br />{city.name}
      </h2>
      <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
        {services.map(s => (
          <Link
            key={s.slug}
            to={`/services/${s.slug}`}
            className="group rounded-2xl bg-neutral-50 p-3 md:p-4 hover:shadow-soft hover:bg-white transition flex flex-col items-center text-center"
          >
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-100">
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

export default function CityDetail() {
  const { slug } = useParams()
  const city = findCity(slug)
  if (!city) return <Navigate to="/cities" replace />

  return (
    <div>
      <CityHero city={city} />
      <Localities city={city} />
      <ServicesInCity city={city} />
      <CitiesGrid title="Available in 15 Indian cities" className="bg-neutral-50" />
      <DownloadCta />
    </div>
  )
}
