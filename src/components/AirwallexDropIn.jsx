import { useEffect, useRef, useState } from 'react'
import { init, createElement } from '@airwallex/components-sdk'
import { ShieldCheck, Loader2 } from 'lucide-react'

// 'prod' (live) by default; override with VITE_AIRWALLEX_ENV=demo for testing.
const AIRWALLEX_ENV = import.meta.env.VITE_AIRWALLEX_ENV || 'prod'

// Initialize the SDK once per page load.
let initPromise = null
function ensureInit() {
  if (!initPromise) {
    initPromise = init({
      env: AIRWALLEX_ENV,
      enabledElements: ['payments'],
    })
  }
  return initPromise
}

/**
 * Renders the Airwallex Drop-in element for a given PaymentIntent.
 *
 * Props:
 *  - intentId, clientSecret, currency : from POST /api/payments/create-intent
 *  - onSuccess(detail)  : payment succeeded on the client (verify on server too)
 *  - onError(message)   : payment failed
 */
export default function AirwallexDropIn({ intentId, clientSecret, currency, onSuccess, onError }) {
  const containerRef = useRef(null)
  const elementRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    let element = null

    async function mount() {
      try {
        await ensureInit()
        if (cancelled) return

        element = await createElement('dropIn', {
          intent_id: intentId,
          client_secret: clientSecret,
          currency,
          appearance: {
            mode: 'light',
            variables: { colorBrand: '#4f46e5' },
          },
        })
        if (cancelled) {
          element?.unmount?.()
          return
        }

        elementRef.current = element
        element.mount(containerRef.current)

        element.on('ready', () => {
          if (!cancelled) setLoading(false)
        })

        element.on('success', (event) => {
          if (!cancelled) onSuccess?.(event?.detail)
        })

        element.on('error', (event) => {
          const message = event?.detail?.error?.message || 'Payment failed. Please try again.'
          if (!cancelled) {
            setError(message)
            onError?.(message)
          }
        })
      } catch (err) {
        const message = err?.message || 'Failed to load payment form.'
        if (!cancelled) {
          setLoading(false)
          setError(message)
          onError?.(message)
        }
      }
    }

    mount()

    return () => {
      cancelled = true
      try {
        elementRef.current?.unmount?.()
      } catch {}
      elementRef.current = null
    }
  }, [intentId, clientSecret, currency, onSuccess, onError])

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading secure payment…
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
      )}
      <div ref={containerRef} id="airwallex-dropin" />
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Payments are securely processed by Airwallex.
      </p>
    </div>
  )
}
