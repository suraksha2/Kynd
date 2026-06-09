
import { NextRequest, NextResponse } from "next/server";
import { createCity, getCities } from "@/lib/cities-db";
import { CreateCityInput } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const cities = await getCities();
    // Parse areas from pinCode field for each city
    const citiesWithAreas = cities.map((city: any) => {
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
      return {
        ...city,
        areas
      };
    });
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

