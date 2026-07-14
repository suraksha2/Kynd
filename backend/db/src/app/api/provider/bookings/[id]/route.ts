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

const ALLOWED_STATUSES = ['upcoming', 'completed', 'cancelled'] as const;

// PUT update the status of a booking assigned to the authenticated provider.
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySessionToken(getSessionToken(request));
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const isProvider = session.role === 'provider';
    if (!isProvider && !hasAdminAccess(session.role)) {
      return NextResponse.json({ error: 'Provider access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'A valid status is required.' },
        { status: 400 }
      );
    }

    // Ensure the booking exists and (for providers) belongs to this provider.
    const [rows]: any = await pool.query(
      'SELECT id, provider_id, history FROM bookings WHERE id = ?',
      [params.id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }
    const booking = rows[0];
    if (isProvider && Number(booking.provider_id) !== Number(session.id)) {
      return NextResponse.json(
        { error: 'This task is not assigned to you.' },
        { status: 403 }
      );
    }

    // Append an entry to the history JSON audit trail.
    let history: any[] = [];
    try {
      history = typeof booking.history === 'string'
        ? JSON.parse(booking.history)
        : (booking.history || []);
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    history.push({
      at: now,
      type: 'status',
      note: `Marked ${status} by ${session.role}`,
    });

    await pool.query(
      'UPDATE bookings SET status = ?, history = ? WHERE id = ?',
      [status, JSON.stringify(history), params.id]
    );

    return NextResponse.json({ success: true, status }, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/provider/bookings/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
}
