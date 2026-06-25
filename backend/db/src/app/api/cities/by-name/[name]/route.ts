import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const cityName = decodeURIComponent(params.name);
    
    const [rows] = await pool.query<any[]>(
      "SELECT id, cityName, pinCode, serviceCategoryId, createdAt, updatedAt FROM cities WHERE cityName = ?",
      [cityName]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "City not found." }, { status: 404 });
    }

    const city = rows[0];
    
    // Parse pinCode to get areas
    let areas: string[] = [];
    try {
      const parsed = JSON.parse(city.pinCode);
      if (Array.isArray(parsed)) {
        areas = parsed.map((a: any) => a.areaName);
      } else {
        areas = [city.pinCode];
      }
    } catch {
      areas = [city.pinCode];
    }

    return NextResponse.json({
      data: {
        id: city.id.toString(),
        name: city.cityName,
        slug: city.cityName.toLowerCase().replace(/\s+/g, '-'),
        tagline: `Professional home services in ${city.cityName}. Book trained, background-verified Pros for cleaning, laundry, kitchen and bathroom upkeep.`,
        img: `/images/cities/${city.cityName.toLowerCase()}.webp`,
        areas: areas,
        serviceCategoryId: city.serviceCategoryId,
      }
    }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/cities/by-name]", err);
    return NextResponse.json({ error: "Failed to fetch city." }, { status: 500 });
  }
}
