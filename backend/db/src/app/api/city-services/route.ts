import { NextRequest, NextResponse } from "next/server";
import {
  getCityServices,
  createCityService,
} from "@/lib/city-services-db";
import { CreateCityServiceInput } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const services = await getCityServices();
    return NextResponse.json({ data: services }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/city-services]", err);
    return NextResponse.json(
      { error: "Failed to fetch city services." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateCityServiceInput = await req.json();

    // Basic validation
    const required: (keyof CreateCityServiceInput)[] = [
      "cityId",
      "name",
      "category",
      "description",
      "status",
      "provider",
      "contactEmail",
      "contactPhone",
      "budget",
      "startDate",
    ];
    for (const field of required) {
      if (body[field] === undefined || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (typeof body.budget !== "number" || body.budget < 0) {
      return NextResponse.json(
        { error: "Budget must be a non-negative number." },
        { status: 400 }
      );
    }

    const service = await createCityService(body);
    return NextResponse.json({ data: service }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/city-services]", err);
    return NextResponse.json(
      { error: "Failed to create city service." },
      { status: 500 }
    );
  }
}


