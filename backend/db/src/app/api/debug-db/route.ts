import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    const [desc] = await pool.query("DESCRIBE service_categories");
    return NextResponse.json({ tables, service_categories: desc }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
