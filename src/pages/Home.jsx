import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Star, Plus } from 'lucide-react'
import StoreButtons from '../components/StoreButtons'
import PhoneMockup from '../components/PhoneMockup'
import { services } from '../data/services'
import { cities } from '../data/cities'
import { useCart } from '../context/CartContext'

/* ---------- Worker photo (single, on the right) ---------- */
const HeroFigure = () => (
  <img
    src="/images/hero-worker.png"
    alt="Helpr professional"
    className="h-full w-auto object-contain object-bottom select-none pointer-events-none"
    draggable="false"
  />
)

const heroCities = ['bangalore', 'delhi', 'noida', 'gurgaon', 'mumbai', 'pune', 'hyderabad']

const Hero = () => (
  <section className="relative overflow-hidden bg-[#eaf6ee] pt-32 md:pt-36 pb-16">
    {/* single figure on right */}
    <div className="hidden md:block absolute right-0 bottom-0 h-[80%] z-0">
      <HeroFigure />
    </div>

    <div className="relative z-10 max-w-3xl mx-auto md:ml-12 md:mr-auto px-6 md:px-10 md:text-left text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
        Trusted house help<br />in minutes!
      </h1>
      <p className="mt-4 text-base md:text-lg text-neutral-700 max-w-md md:mx-0 mx-auto">
        Your home, professionally cleaned — exactly when you need it.
      </p>

      <div className="mt-7 flex flex-wrap items-center md:justify-start justify-center gap-3">
        <Link to="/services" className="inline-flex items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 shadow-soft transition">
          Book a service
        </Link>
        <a href="#how" className="inline-flex items-center justify-center rounded-full bg-white ring-1 ring-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold px-6 py-3 transition">
          How it works
        </a>
      </div>
      <StoreButtons className="mt-4 md:!justify-start" />

      <div className="mt-6 flex flex-wrap items-center md:justify-start justify-center gap-2 max-w-xl">
        {heroCities.map(slug => {
          const c = cities.find(x => x.slug === slug)
          return (
            <Link key={slug} to={`/cities/${slug}`} className="px-3 py-1.5 rounded-full bg-white ring-1 ring-brand-200 text-brand-800 text-xs font-medium hover:bg-brand-50">
              {c?.name}
            </Link>
          )
        })}
        <Link to="/cities" className="px-3 py-1.5 rounded-full bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700">+ 8 more cities</Link>
      </div>
    </div>
  </section>
)

/* ---------- Press / featured-in logos strip ---------- */


/* ---------- Stats: small pills row ---------- */
export const Stats = () => (
  <section id="why" className="py-16">
    <div className="max-w-3xl mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">
        No more planning<br />around your house help.
      </h2>
      <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
        Our team of verified Helpr Professionals are always on time.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {[
          { n: '15,000+', l: 'Homes' },
          { n: '40,000+', l: 'Hours saved' },
          { n: '1,500+',  l: 'Pros' }
        ].map((s, i) => (
          <div key={i} className="rounded-full bg-brand-50 ring-1 ring-brand-200 px-5 py-2.5 flex items-baseline gap-2">
            <span className="text-base md:text-lg font-extrabold text-brand-700">{s.n}</span>
            <span className="text-xs text-neutral-600">{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ---------- Services: monochrome icon tiles (6 cols) ---------- */
const ServiceTile = ({ s }) => {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation()
    addItem(s); setAdded(true); setTimeout(() => setAdded(false), 1200)
  }
  return (
    <Link
      to={`/services/${s.slug}`}
      className="group relative flex flex-col items-center text-center p-3"
    >
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-neutral-100 group-hover:bg-brand-50 overflow-hidden grid place-items-center transition">
        <img
          src={s.img}
          alt={s.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${s.name} to cart`}
          className={`absolute bottom-1 right-1 w-6 h-6 rounded-full grid place-items-center shadow-soft transition ${added ? 'bg-brand-600 text-white scale-110' : 'bg-white text-neutral-700 hover:bg-brand-600 hover:text-white opacity-0 group-hover:opacity-100'}`}
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

export const Services = () => (
  <section id="services" className="py-12 md:py-16">
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">Book trusted house<br />help.</h2>
        <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
          From hourly bookings to express cleans to daily upkeep, Helpr's got you covered. 18 services, transparent flat pricing.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
        {services.map(s => <ServiceTile key={s.slug} s={s} />)}
      </div>

      <div className="mt-10 text-center">
        <Link to="/cart" className="inline-flex items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 transition">
          View cart & checkout
        </Link>
      </div>
    </div>
  </section>
)

/* ---------- Steps: white cards w/ phone mockups ---------- */
export const Steps = () => {
  const steps = [
    { n: 'STEP 1', t: 'Pick from 18 trusted services', d: 'Browse 18 services in the Helpr app — from hourly bookings to per-task jobs to express cleans.', screen: 'list' },
    { n: 'STEP 2', t: 'Add it to your cart', d: 'Stack multiple tasks into one booking. Your Pro handles them all in a single visit.', screen: 'book' },
    { n: 'STEP 3', t: 'Choose instant, scheduled, or recurring. Pay & done!', d: 'Get a Pro in minutes, book for later, or set up a recurring slot.', screen: 'track' }
  ]
  return (
    <section id="how" className="py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">Simple steps to a<br />cleaner home.</h2>
          <p className="mt-3 text-neutral-500">Follow these simple steps to get house help in 15 minutes.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="rounded-3xl bg-white p-6 flex flex-col items-center text-center shadow-soft border border-neutral-100">
              <div className="rounded-2xl bg-brand-50 p-4 w-full flex items-center justify-center">
                <PhoneMockup screen={s.screen} size="sm" />
              </div>
              <div className="mt-5 text-[11px] font-bold tracking-widest text-brand-700">{s.n}</div>
              <h3 className="mt-1 text-base font-bold text-neutral-900">{s.t}</h3>
              <p className="mt-1 text-sm text-neutral-500 max-w-[260px]">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Reviews: light card grid ---------- */
export const Reviews = () => {
  const data = [
    { n: 'Kirti', loc: 'Sector 56', r: "I'd say it was great value for money. The urgency was handled well, without compromising quality. Really satisfied with the experience." },
    { n: 'Neha', loc: 'Sector 57', r: 'The service was simple and effective. It met my expectations without any hassle. Good overall experience.' },
    { n: 'Pradnyesh', loc: 'Suncity', r: 'Great work, my home was left spotless and fresh. The cleaning was thorough, and I appreciated the attention to detail. 👍🏼' },
    { n: 'Ridhi Saluja', loc: 'Sector 56', r: 'The services have definitely improved from the first time. Preferences are kept as top priority. Thank you for making our lives easier with Helpr!' },
    { n: 'Ritika', loc: 'Sector 57', r: 'Seamless experience from booking to completion. The staff was courteous, punctual, and did a fantastic job.' },
    { n: 'Sameer', loc: 'Sector 57', r: 'Really liked your service, it was smooth, efficient, and just what I needed. Would definitely recommend to others. 🌟' },
    { n: 'Karishma', loc: 'Suncity', r: 'Absolutely excellent service! The team was prompt and professional throughout. Would love to use it again.' },
    { n: 'Rabia', loc: 'Suncity', r: 'Really impressive compared to other platforms. The service was reliable and professional. Communication was clear and fast — very pleased!' }
  ]
  return (
    <section id="reviews" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">Loved by Helpr<br />homes.</h2>
          <p className="mt-3 text-neutral-500">Real reviews from real homes across India.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.map((u, i) => (
            <div key={i} className="rounded-2xl bg-neutral-50 p-5">
              <div className="flex gap-0.5 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
              <p className="text-[13px] text-neutral-700 leading-relaxed">"{u.r}"</p>
              <div className="mt-4">
                <div className="font-semibold text-sm text-neutral-900">{u.n}</div>
                <div className="text-xs text-neutral-500">{u.loc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- FAQ ---------- */
export const Faq = () => {
  const items = [
    { q: 'What is Helpr?', a: 'Helpr is an on-demand and subscription-based house help platform. We connect trained, background-verified professionals with urban homes — for cleaning, laundry, kitchen and bathroom upkeep. Schedule for later or get instant service in 15 minutes.' },
    { q: 'How is Helpr different from existing options?', a: "Trained background-verified Pros, transparent in-app pricing, on-demand booking within 15 minutes, and the ability to pause or reschedule without awkward conversations. No advance payment, no informal commitments, and no risk of a no-show with no recourse." },
    { q: 'How do I download the Helpr app?', a: 'On Google Play Store or Apple App Store — search "Helpr - house help". Sign up takes under a minute with phone number, address, and OTP.' },
    { q: 'How do I book a service?', a: 'Open the app, select chores, pick a time and we send a verified professional.' },
    { q: 'How fast can I get a Pro?', a: 'Within 15 minutes for instant bookings. Or schedule for later or set up a recurring slot.' },
    { q: 'Can I stack multiple tasks?', a: 'Yes — sweeping, mopping, utensils, ironing — combined into one booking handled by a single Pro in one visit.' },
    { q: 'Do you support recurring bookings?', a: 'Yes — daily, weekly, or a custom cadence. The system auto-assigns the best available trained Pro for every visit.' },
    { q: 'Are the Pros verified?', a: 'Every Helpr Pro completes a formal training program and a thorough background check before their first booking.' },
    { q: 'How is pricing calculated?', a: 'Transparent and shown upfront in the app — per visit, no per-bedroom multipliers, no hidden charges, no advance deposits.' },
    { q: 'Which cities is Helpr in?', a: '15 Indian cities: Ahmedabad, Bangalore, Chennai, Delhi, Faridabad, Ghaziabad, Gurgaon, Hyderabad, Jaipur, Kolkata, Mumbai, Navi Mumbai, Noida, Pune, and Thane.' }
  ]
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="py-16 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-neutral-900">Frequently Asked<br />Questions</h2>
        <div className="mt-8 space-y-3">
          {items.map((it, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="rounded-2xl bg-white border border-neutral-100">
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-medium text-neutral-900 text-sm">{it.q}</span>
                  <span className={`w-7 h-7 grid place-items-center rounded-full bg-neutral-900 text-white transition ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                {isOpen && <div className="px-5 pb-5 text-sm text-neutral-600 -mt-1">{it.a}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- Big green CTA ---------- */
export const DownloadCta = () => (
  <section id="download" className="py-16">
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="rounded-[36px] bg-brand-600 text-white px-6 md:px-10 py-14 md:py-16 text-center relative overflow-hidden">
        <div className="flex justify-center -mb-2">
          <div className="flex items-end -space-x-8">
            <PhoneMockup screen="home" size="sm" className="-rotate-[8deg]" />
            <PhoneMockup screen="track" size="sm" className="rotate-[8deg] translate-y-2" />
          </div>
        </div>
        <h2 className="mt-10 text-3xl md:text-4xl font-extrabold tracking-tight">
          Get trusted house help in<br />minutes.
        </h2>
        <p className="mt-3 text-white/85">Download the Helpr app and book your first service today.</p>
        <StoreButtons className="mt-6" />
      </div>
    </div>
  </section>
)

export default function Home() {
  return (
    <>
      <Hero />

      <Stats />
      <Services />
      <Steps />
      <Reviews />
      <Faq />
      <DownloadCta />
    </>
  )
}
