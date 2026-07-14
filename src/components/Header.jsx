import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, X, ShoppingBag, User, LogOut, ShoppingBag as Package, UserCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useServices } from '../context/ServicesContext'
import { API_BASE } from '../lib/api'

function AuthButton({ compact = false }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const timer = useRef(null)
  const onEnter = () => { clearTimeout(timer.current); setOpen(true) }
  const onLeave = () => { timer.current = setTimeout(() => setOpen(false), 120) }

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className={`inline-flex items-center justify-center rounded-full bg-brand-400 hover:bg-brand-500 text-cocoa font-semibold transition ${compact ? 'px-3 h-9 text-xs' : 'px-4 py-2 text-sm'}`}
      >
        Sign in
      </Link>
    )
  }

  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Account"
        className={`inline-flex items-center justify-center rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold ${compact ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm'}`}
      >
        {initials || <User className="w-4 h-4" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full pt-3 z-30">
          <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(74,46,31,0.25)] ring-1 ring-black/5 p-3 min-w-[220px]">
            <div className="px-2 py-1.5">
              <div className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</div>
              <div className="text-xs text-neutral-500 truncate">{user?.email}</div>
            </div>
            <div className="mt-2 pt-2 border-t border-neutral-100 space-y-0.5">
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-700 rounded-md px-2 py-1.5 transition"
              >
                <UserCircle className="w-4 h-4" /> Profile
              </Link>
              <Link
                to="/bookings"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-700 rounded-md px-2 py-1.5 transition"
              >
                <Package className="w-4 h-4" /> My bookings
              </Link>
              <button
                onClick={() => { logout(); navigate('/login'); setOpen(false) }}
                className="w-full flex items-center gap-2 text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-700 rounded-md px-2 py-1.5 transition"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileAuthLinks() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  if (isAuthenticated) {
    return (
      <div className="mt-2 pt-3 border-t border-neutral-100">
        <div className="px-1 py-1">
          <div className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</div>
          <div className="text-xs text-neutral-500 truncate">{user?.email}</div>
        </div>
        <div className="mt-2 space-y-1">
          <Link to="/account" className="block py-2 text-neutral-700">Profile</Link>
          <Link to="/bookings" className="block py-2 text-neutral-700">My bookings</Link>
        </div>
        <button onClick={() => { logout(); navigate('/login') }} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-2.5 text-sm">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    )
  }
  return (
    <div className="mt-2 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2">
      <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-2.5 text-sm">
        Sign in
      </Link>
      <Link to="/signup" className="inline-flex items-center justify-center rounded-full bg-brand-400 hover:bg-brand-500 text-cocoa font-semibold py-2.5 text-sm">
        Sign up
      </Link>
    </div>
  )
}

function CartButton({ className = '' }) {
  const { count } = useCart()
  return (
    <Link to="/cart" aria-label="Cart" className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 transition ${className}`}>
      <ShoppingBag className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-cocoa text-white text-[10px] font-bold">
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
          <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(74,46,31,0.25)] ring-1 ring-black/5 p-4 min-w-[640px]">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

const ServicesMenu = ({ services }) => (
  <div>
    <div className="grid grid-cols-3 gap-x-6 gap-y-2 max-h-[60vh] overflow-y-auto">
      {services.map(s => (
        <Link
          key={s.id}
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

const CitiesMenu = ({ cities }) => (
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
  const [cities, setCities] = useState([])
  const { services } = useServices()
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${API_BASE}/cities`)
        if (!response.ok) throw new Error('Failed to fetch cities')
        const result = await response.json()
        const data = result.data || []
        const transformedCities = data.map(city => ({
          id: city.id,
          slug: city.cityName.toLowerCase().replace(/\s+/g, '-'),
          name: city.cityName,
        }))
        setCities(transformedCities)
      } catch (error) {
        console.error('Error fetching cities:', error)
      }
    }

    fetchCities()
  }, [])

  return (
    <header className="app-header">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="bg-white rounded-full shadow-[0_10px_30px_-12px_rgba(74,46,31,0.18)] ring-1 ring-black/5 px-5 md:px-7 py-3 flex items-center justify-between gap-4">
          {/* Left links */}
          <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-neutral-800 flex-1">
            <NavLink to="/" end className={({ isActive }) => `hover:text-brand-700 transition ${isActive ? 'text-brand-700' : ''}`}>
              Why us
            </NavLink>
            <NavDropdown label="Services"><ServicesMenu services={services} /></NavDropdown>
            <NavDropdown label="Cities"><CitiesMenu cities={cities} /></NavDropdown>
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-0">
            <img src="/images/logo.png" alt="Kynd" className="h-10 md:h-11 w-auto" />
          </Link>

          {/* Right links */}
          <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-neutral-800 flex-1 justify-end">
            <a href="/#how" className="hover:text-brand-700 transition">How it works</a>
            <a href="/#faq" className="hover:text-brand-700 transition">FAQs</a>
            <CartButton />
            <AuthButton />
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-1.5">
            <CartButton className="w-9 h-9" />
            <AuthButton compact />
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
                  <Link key={s.id} to={`/services/${s.slug}`} className="py-1 text-neutral-600">{s.name}</Link>
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
            <MobileAuthLinks />
          </div>
        )}
      </div>
    </header>
  )
}
