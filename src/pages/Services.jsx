import React from 'react'
import { Link } from 'react-router-dom'
import { services } from '../data/services'

export default function Services() {
  return (
    <div className="pt-32 pb-20 bg-[#eaf6ee] min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">All Helpr services</h1>
          <p className="mt-3 text-neutral-600 max-w-xl mx-auto">18 trusted services. Transparent flat pricing. Book a Pro in minutes.</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map(s => (
            <Link key={s.slug} to={`/services/${s.slug}`} className="group rounded-2xl bg-white border border-neutral-100 overflow-hidden hover:shadow-soft transition">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-500" />
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
