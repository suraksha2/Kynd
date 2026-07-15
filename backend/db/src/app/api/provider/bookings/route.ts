export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  hasAdminAccess,
} from '@/lib/auth';

function getSessionToken(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return request.cookies.get(SESSION_COOKIE_NAME)?.value;
}

// GET bookings assigned to the authenticated service provider.
export async function GET(request: NextRequest) {
  try {
    const session = await verifySessionToken(getSessionToken(request));
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    if (session.role !== 'provider' && !hasAdminAccess(session.role)) {
      return NextResponse.json({ error: 'Provider access required.' }, { status: 403 });
    }

    const [rows] = await pool.query(
      `SELECT id, booking_id, items, total, schedule, scheduled_at, cadence,
              contact_name, contact_phone, contact_address, contact_city,
              contact_pincode, contact_area, payment, placed_at, status,
              provider_id, assigned_at
       FROM bookings
       WHERE provider_id = ?
       ORDER BY
         CASE status WHEN 'upcoming' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END,
         COALESCE(scheduled_at, placed_at) ASC`,
      [session.id]
    );

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/provider/bookings]', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned bookings' },
      { status: 500 }
    );
  }
}
