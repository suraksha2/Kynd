import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT month, revenue FROM analytics ORDER BY FIELD(month, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')`
    );
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/analytics]", err);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}
