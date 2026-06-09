import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

// Fetch all orders (from bookings table for user-side bookings)
export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT 
        b.id,
        b.booking_id,
        b.total as amount,
        b.status,
        b.placed_at as date,
        b.scheduled_at,
        b.contact_name as clientName,
        b.contact_phone as clientMobile,
        b.contact_city as city,
        b.contact_address as address,
        b.items,
        b.schedule,
        b.payment
      FROM bookings b
      ORDER BY b.placed_at DESC`
    );
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

// Insert a new order
export async function POST(req: NextRequest) {
  try {
    const { client_id, service_id, amount, status, date } = await req.json();
    if (!client_id || !service_id || !amount || !status || !date) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    const [result] = await pool.query(
      `INSERT INTO orders (client_id, service_id, amount, status, date) VALUES (?, ?, ?, ?, ?)`,
      [client_id, service_id, amount, status, date]
    );
    return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
