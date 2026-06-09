import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="pt-28 md:pt-32 pb-16 min-h-screen">
      <div className="max-w-md mx-auto px-5 sm:px-6">
        <div className="bg-white rounded-3xl ring-1 ring-neutral-100 shadow-soft p-6 sm:p-8">
          <div className="text-center">
            <Link to="/" className="text-brand-500 font-extrabold text-3xl tracking-tight">Helpr</Link>
            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-neutral-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-neutral-500">Sign in to manage your bookings.</p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-2.5 ring-1 ring-red-100">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-neutral-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-neutral-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-brand-700 hover:text-brand-800">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-600 select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-600"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 transition"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            New to Helpr?{' '}
            <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-800">Create an account</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-neutral-400 px-4">
          By continuing, you agree to our{' '}
          <Link to="/tnc" className="underline">Terms</Link> and{' '}
          <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </section>
  )
}
