import { NextRequest, NextResponse } from "next/server";
import { getCityAreas, createCityArea } from "@/lib/city-areas-db";
import { getCityById } from "@/lib/cities-db";
import { CreateCityAreaInput } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const cityId = searchParams.get("city_id");

    const areas = await getCityAreas(cityId || undefined);

    // Fall back to areas stored as JSON in the cities.pinCode column
    if (areas.length === 0 && cityId) {
      const city = await getCityById(cityId);
      if (city?.pinCode) {
        try {
          const parsed = JSON.parse(city.pinCode);
          if (Array.isArray(parsed)) {
            return NextResponse.json({
              data: parsed.map((a: any, idx: number) => ({
                id: `legacy-${idx}`,
                cityId: city.id,
                areaName: a.areaName || a.area,
                pincode: a.pinCode || a.pincode || "",
                status: "active",
                createdAt: city.createdAt,
                updatedAt: city.updatedAt,
              })),
            }, { status: 200 });
          }
        } catch {
          // pinCode is not JSON; ignore fallback
        }
      }
    }

    return NextResponse.json({ data: areas }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/city-areas]", err);
    return NextResponse.json({ error: "Failed to fetch city areas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateCityAreaInput = await req.json();
    if (!body.cityId?.trim() || !body.areaName?.trim()) {
      return NextResponse.json(
        { error: "City ID and area name are required." },
        { status: 400 }
      );
    }

    const area = await createCityArea({
      cityId: body.cityId.trim(),
      areaName: body.areaName.trim(),
      pincode: body.pincode?.trim(),
      status: body.status || "active",
    });
    return NextResponse.json({ data: area }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/city-areas]", err);
    return NextResponse.json({ error: "Failed to create city area." }, { status: 500 });
  }
}
