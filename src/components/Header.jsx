import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X, ShoppingBag } from 'lucide-react'
import { services } from '../data/services'
import { cities } from '../data/cities'
import { useCart } from '../context/CartContext'

function CartButton({ className = '' }) {
  const { count } = useCart()
  return (
    <Link to="/cart" aria-label="Cart" className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 transition ${className}`}>
      <ShoppingBag className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-brand-600 text-white text-[10px] font-bold">
          {count}
        </span>
      )}
    </Link>
  )
}

/* Hover-aware dropdown menu (open on hover for desktop, tap for mobile) */
function NavDropdown({ label, children, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const timer = useRef(null)
  const onEnter = () => { clearTimeout(timer.current); setOpen(true) }
  const onLeave = () => { timer.current = setTimeout(() => setOpen(false), 120) }

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 hover:text-brand-700 transition"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className={`absolute top-full pt-3 ${align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'} z-30`}
        >
          <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(20,83,45,0.25)] ring-1 ring-black/5 p-4 min-w-[640px]">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

const ServicesMenu = () => (
  <div>
    <div className="grid grid-cols-3 gap-x-6 gap-y-2 max-h-[60vh] overflow-y-auto">
      {services.map(s => (
        <Link
          key={s.slug}
          to={`/services/${s.slug}`}
          className="text-sm text-neutral-700 hover:text-brand-700 hover:bg-brand-50 rounded-md px-2 py-1.5 transition"
        >
          {s.name}
        </Link>
      ))}
    </div>
    <div className="mt-3 pt-3 border-t border-neutral-100">
      <Link to="/services" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
        View all services →
      </Link>
    </div>
  </div>
)

const CitiesMenu = () => (
  <div>
    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
      {cities.map(c => (
        <Link
          key={c.slug}
          to={`/cities/${c.slug}`}
          className="text-sm text-neutral-700 hover:text-brand-700 hover:bg-brand-50 rounded-md px-2 py-1.5 transition"
        >
          {c.name}
        </Link>
      ))}
    </div>
    <div className="mt-3 pt-3 border-t border-neutral-100">
      <Link to="/cities" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
        View all cities →
      </Link>
    </div>
  </div>
)

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mServices, setMServices] = useState(false)
  const [mCities, setMCities] = useState(false)
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <header className="absolute top-0 inset-x-0 z-20 pt-6">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="bg-white rounded-full shadow-[0_10px_30px_-12px_rgba(20,83,45,0.18)] ring-1 ring-black/5 px-5 md:px-7 py-3 flex items-center justify-between gap-4">
          {/* Left links */}
          <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-neutral-800 flex-1">
            <NavLink to="/" end className={({ isActive }) => `hover:text-brand-700 transition ${isActive ? 'text-brand-700' : ''}`}>
              Why us
            </NavLink>
            <NavDropdown label="Services"><ServicesMenu /></NavDropdown>
            <NavDropdown label="Cities"><CitiesMenu /></NavDropdown>
          </div>

          {/* Logo */}
          <Link to="/" className="text-brand-500 font-extrabold text-2xl md:text-3xl tracking-tight leading-none select-none">
            Helpr
          </Link>

          {/* Right links */}
          <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-neutral-800 flex-1 justify-end">
            <a href="/#how" className="hover:text-brand-700 transition">How it works</a>
            <a href="/#faq" className="hover:text-brand-700 transition">FAQs</a>
            <CartButton />
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-1">
            <CartButton className="w-9 h-9" />
            <button
              type="button"
              className="p-2 -mr-2 text-neutral-800"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden mt-3 bg-white rounded-2xl shadow-soft ring-1 ring-black/5 p-4 text-sm">
            <Link to="/" className="block py-2">Why us</Link>
            <button onClick={() => setMServices(o => !o)} className="w-full flex items-center justify-between py-2">
              <span>Services</span>
              <ChevronDown className={`w-4 h-4 transition ${mServices ? 'rotate-180' : ''}`} />
            </button>
            {mServices && (
              <div className="pl-3 grid grid-cols-1 gap-1 pb-2">
                {services.map(s => (
                  <Link key={s.slug} to={`/services/${s.slug}`} className="py-1 text-neutral-600">{s.name}</Link>
                ))}
                <Link to="/services" className="py-1 font-semibold text-brand-700">View all services →</Link>
              </div>
            )}
            <button onClick={() => setMCities(o => !o)} className="w-full flex items-center justify-between py-2">
              <span>Cities</span>
              <ChevronDown className={`w-4 h-4 transition ${mCities ? 'rotate-180' : ''}`} />
            </button>
            {mCities && (
              <div className="pl-3 grid grid-cols-2 gap-1 pb-2">
                {cities.map(c => (
                  <Link key={c.slug} to={`/cities/${c.slug}`} className="py-1 text-neutral-600">{c.name}</Link>
                ))}
                <Link to="/cities" className="py-1 font-semibold text-brand-700 col-span-2">View all cities →</Link>
              </div>
            )}
            <a href="/#how" className="block py-2">How it works</a>
            <a href="/#faq" className="block py-2">FAQs</a>
          </div>
        )}
      </div>
    </header>
  )
}
