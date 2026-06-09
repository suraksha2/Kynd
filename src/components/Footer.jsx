import { Link } from 'react-router-dom'
import { cities } from '../data/cities'
import { useServices } from '../context/ServicesContext'

export default function Footer() {
  const { services } = useServices()

  return (
    <footer className="bg-[#0b1f14] text-neutral-300">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2">
            <div className="text-brand-500 text-2xl font-extrabold">Helpr</div>
            <p className="mt-3 text-neutral-400 max-w-xs">
              Trusted house help in minutes. Download the app and book your first service today.
            </p>
            <p className="mt-4 text-neutral-400">
              Reach us:<br />
              <a className="text-white hover:underline" href="mailto:help@withhelpr.com">help@withhelpr.com</a><br />
              Careers: <a className="text-white hover:underline" href="mailto:careers@withhelpr.com">careers@withhelpr.com</a>
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-neutral-400">
              <li><Link to="/support" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/frequently-asked-questions" className="hover:text-white">FAQs</Link></li>
              <li><Link to="/delete-account" className="hover:text-white">Delete Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-neutral-400">
              <li><a href="#" className="hover:text-white">Become a Helpr Pro</a></li>
              <li><a href="#" className="hover:text-white">Become a Helpr Buddy</a></li>
              <li><a href="#" className="hover:text-white">Request Helpr in your locality</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-neutral-400">
              <li><Link to="/tnc" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-white">Cancellation Policy</Link></li>
              <li><Link to="/credits" className="hover:text-white">Photo Credits</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3">All services</h4>
            <ul className="grid grid-cols-2 gap-y-1.5 text-neutral-400">
              {services.map(s => (
                <li key={s.id}>
                  <Link to={`/services/${s.slug}`} className="hover:text-white">{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">All cities</h4>
            <ul className="grid grid-cols-2 gap-y-1.5 text-neutral-400">
              {cities.map(c => (
                <li key={c.slug}>
                  <Link to={`/cities/${c.slug}`} className="hover:text-white">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-neutral-500">
          Helpr © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  )
}
