
import { NextRequest, NextResponse } from "next/server";
import { createCity, getCities } from "@/lib/cities-db";
import { getCityAreas } from "@/lib/city-areas-db";
import { CreateCityInput } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const cities = await getCities();
    // Fetch areas from city_areas table for each city, falling back to pinCode JSON
    const citiesWithAreas = await Promise.all(
      cities.map(async (city: any) => {
        const areas = await getCityAreas(city.id);
        const areaNames = areas.map((a: any) => a.areaName);

        let fallbackCount = 0;
        if (areaNames.length === 0 && city.pinCode) {
          try {
            const parsed = JSON.parse(city.pinCode);
            if (Array.isArray(parsed)) {
              fallbackCount = parsed.length;
            }
          } catch {
            // pinCode is not valid JSON; treat as a single area
            fallbackCount = city.pinCode ? 1 : 0;
          }
        }

        return {
          ...city,
          areas: areaNames.length > 0 ? areaNames : undefined,
          areaCount: areaNames.length > 0 ? areaNames.length : fallbackCount
        };
      })
    );
    return NextResponse.json({ data: citiesWithAreas }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/cities]", err);
    return NextResponse.json({ error: "Failed to fetch cities." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateCityInput = await req.json();
    if (!body.cityName?.trim() || !body.pinCode?.trim()) {
      return NextResponse.json(
        { error: "City name and pin code are required." },
        { status: 400 }
      );
    }

    const city = await createCity({
      cityName: body.cityName.trim(),
      pinCode: body.pinCode.trim(),
      serviceCategoryId: body.serviceCategoryId,
    });
    return NextResponse.json({ data: city }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/cities]", err);
    return NextResponse.json({ error: "Failed to create city." }, { status: 500 });
  }
}

