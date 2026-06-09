import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');
    const slugs = searchParams.get('slugs');

    let query = `SELECT id, name, category, price, availability, status, image FROM services`;
    const params: any[] = [];

    if (ids) {
      const idArray = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (idArray.length > 0) {
        query += ` WHERE id IN (${idArray.map(() => '?').join(',')})`;
        params.push(...idArray);
      }
    } else if (slugs) {
      const slugArray = slugs.split(',').map(slug => slug.trim()).filter(slug => slug.length > 0);
      if (slugArray.length > 0) {
        // Convert slugs to names (slug is name lowercase with hyphens)
        const nameArray = slugArray.map(slug => slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
        query += ` WHERE name IN (${nameArray.map(() => '?').join(',')})`;
        params.push(...nameArray);
      }
    }

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/services]", err);
    return NextResponse.json({ error: "Failed to fetch services." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, category, price, availability, status, image } = await req.json();
    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required." }, { status: 400 });
    }
    const [result] = await pool.query(
      `INSERT INTO services (name, category, price, availability, status, image) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category || "General", price, availability || "Available", status || "Available", image || null]
    );
    return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/services]", err);
    return NextResponse.json({ error: "Failed to create service." }, { status: 500 });
  }
}
