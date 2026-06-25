import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { sendProviderAssignmentWhatsApp } from '@/lib/whatsapp';

// PUT assign provider to booking
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const body = await req.json();
    const { provider_id } = body;

    if (!provider_id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Format datetime for MySQL
    const assignedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update booking with provider assignment
    const [result] = await pool.query(
      `UPDATE bookings 
       SET provider_id = ?, assigned_at = ?
       WHERE id = ?`,
      [provider_id, assignedAt, bookingId]
    );

    // Update provider's total_jobs count
    await pool.query(
      `UPDATE service_providers 
       SET total_jobs = total_jobs + 1 
       WHERE id = ?`,
      [provider_id]
    );

    // Fetch booking details
    const [bookingRows]: any = await pool.query(
      `SELECT b.booking_id, b.items, b.total, b.schedule, b.scheduled_at,
              b.contact_name, b.contact_phone, b.contact_address,
              b.contact_area, b.contact_city, b.contact_pincode, b.payment
       FROM bookings b
       WHERE b.id = ?`,
      [bookingId]
    );

    // Fetch provider details
    const [providerRows]: any = await pool.query(
      `SELECT name, mobile FROM service_providers WHERE id = ?`,
      [provider_id]
    );

    if (bookingRows.length > 0 && providerRows.length > 0) {
      const booking = bookingRows[0];
      const provider = providerRows[0];

      // Derive a human-readable service name from the items JSON
      let serviceName = 'Service';
      try {
        const items = typeof booking.items === 'string' ? JSON.parse(booking.items) : booking.items;
        if (Array.isArray(items) && items.length > 0) {
          serviceName = items.map((item: any) => item.name || item.serviceName || item.title || 'Service').join(', ');
        }
      } catch (_) {}

      await sendProviderAssignmentWhatsApp(provider.mobile, provider.name, {
        bookingId: booking.booking_id,
        serviceName,
        scheduledAt: booking.scheduled_at,
        schedule: booking.schedule,
        contactName: booking.contact_name,
        contactPhone: booking.contact_phone,
        contactAddress: booking.contact_address,
        contactArea: booking.contact_area,
        contactCity: booking.contact_city,
        contactPincode: booking.contact_pincode,
        total: booking.total,
        payment: booking.payment,
      });
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PUT /api/bookings/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to assign provider to booking' },
      { status: 500 }
    );
  }
}
