import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      items,
      total,
      schedule,
      scheduledAt,
      cadence,
      contact,
      payment,
      placedAt,
      status = 'upcoming'
    } = body;

    if (!bookingId || !items || !total || !contact || !payment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert ISO datetime to MySQL datetime format
    const formatDateTime = (isoString: string | null) => {
      if (!isoString) return null;
      return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
    };

    const [result] = await pool.query(
      `INSERT INTO bookings (
        booking_id, items, total, schedule, scheduled_at, cadence,
        contact_name, contact_phone, contact_address, contact_city, contact_pincode, contact_area,
        payment, placed_at, status, history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        JSON.stringify(items),
        total,
        schedule,
        formatDateTime(scheduledAt),
        cadence || null,
        contact.name,
        contact.phone,
        contact.address,
        contact.city,
        contact.pincode,
        contact.area || null,
        payment,
        formatDateTime(placedAt),
        status,
        JSON.stringify([{ at: formatDateTime(placedAt), type: 'created', note: 'Booking placed' }])
      ]
    );

    return NextResponse.json(
      { 
        success: true, 
        bookingId,
        id: (result as any).insertId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/bookings]', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings ORDER BY placed_at DESC');
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/bookings]', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
