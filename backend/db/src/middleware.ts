import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME, hasAdminAccess, verifySessionToken } from '@/lib/auth'

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']

// Page routes that anyone may reach without an admin session.
const PUBLIC_PAGES = ['/login']

// Extract a session token from either the httpOnly cookie (same-origin admin
// panel) or an Authorization: Bearer header (cross-origin customer app).
function getSessionToken(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim()
  }
  return request.cookies.get(SESSION_COOKIE_NAME)?.value
}

function applyCors(response: NextResponse, origin: string | null): NextResponse {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Endpoints that the public customer storefront legitimately needs without
// an admin session. Everything else under /api is admin-only.
function isPublicApi(pathname: string, method: string): boolean {
  // Auth flows validate credentials themselves.
  if (pathname.startsWith('/api/auth/')) return true

  if (method === 'GET') {
    if (/^\/api\/services(\/[^/]+)?$/.test(pathname)) return true
    if (/^\/api\/cities(\/.+)?$/.test(pathname)) return true
    if (/^\/api\/city-services(\/.+)?$/.test(pathname)) return true
    if (/^\/api\/city-areas$/.test(pathname)) return true
    if (/^\/api\/service-categories(\/[^/]+)?$/.test(pathname)) return true
  }

  // Customers create bookings without an admin session.
  if (method === 'POST' && pathname === '/api/bookings') return true

  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method
  const origin = request.headers.get('origin')
  const isApi = pathname.startsWith('/api/')

  // Always let CORS preflight through.
  if (method === 'OPTIONS') {
    return applyCors(new NextResponse(null, { status: 204 }), origin)
  }

  // ---- API routes ----
  if (isApi) {
    if (isPublicApi(pathname, method)) {
      return applyCors(NextResponse.next(), origin)
    }

    const session = await verifySessionToken(getSessionToken(request))

    if (!session) {
      return applyCors(
        NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
        origin
      )
    }
    if (!hasAdminAccess(session.role)) {
      return applyCors(
        NextResponse.json({ error: 'Admin access required.' }, { status: 403 }),
        origin
      )
    }
    return applyCors(NextResponse.next(), origin)
  }

  // ---- Admin page routes ----
  if (PUBLIC_PAGES.includes(pathname)) {
    return NextResponse.next()
  }

  const token = getSessionToken(request)
  console.log('Middleware: pathname=', pathname, 'token=', token ? 'present' : 'missing')
  const session = await verifySessionToken(token)
  console.log('Middleware: session=', session ? JSON.stringify(session) : 'null')

  if (!session || !hasAdminAccess(session.role)) {
    console.log('Middleware: redirecting to login')
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
