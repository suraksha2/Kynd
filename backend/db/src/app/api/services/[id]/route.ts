import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

type RouteContext = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { name, category, price, availability, status, image } = await req.json();
    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required." }, { status: 400 });
    }

    const [result] = await pool.query(
      `UPDATE services SET name = ?, category = ?, price = ?, availability = ?, status = ?, image = ? WHERE id = ?`,
      [name, category || "General", price, availability || "Available", status || "Available", image || null, params.id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Service updated successfully." }, { status: 200 });
  } catch (err) {
    console.error("[PUT /api/services/[id]]", err);
    return NextResponse.json({ error: "Failed to update service." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const [result] = await pool.query(`DELETE FROM services WHERE id = ?`, [params.id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Service deleted successfully." }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/services/[id]]", err);
    return NextResponse.json({ error: "Failed to delete service." }, { status: 500 });
  }
}
