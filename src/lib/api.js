// Central API base configuration for the customer app.
//
// Set VITE_API_BASE in the environment (e.g. .env.production) to the live
// backend URL including the "/api" suffix, e.g. "https://api.helpr.com/api".
// Falls back to the local Next.js backend during development.
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

// Same host without the trailing "/api" — useful for callers that build their
// own "/api/..." paths or need static asset URLs.
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '')
