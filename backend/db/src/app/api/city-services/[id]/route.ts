import { NextRequest, NextResponse } from "next/server";
import {
  getCityServiceById,
  updateCityService,
  deleteCityService,
} from "@/lib/city-services-db";
import { UpdateCityServiceInput } from "@/lib/types";


type RouteContext = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const service = await getCityServiceById(params.id);
    if (!service) {
      return NextResponse.json(
        { error: "City service not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: service }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/city-services/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch city service." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const body: UpdateCityServiceInput = await req.json();

    if (body.budget !== undefined && (typeof body.budget !== "number" || body.budget < 0)) {
      return NextResponse.json(
        { error: "Budget must be a non-negative number." },
        { status: 400 }
      );
    }

    const updated = await updateCityService(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "City service not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    console.error("[PUT /api/city-services/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update city service." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const deleted = await deleteCityService(params.id);
    if (!deleted) {
      return NextResponse.json(
        { error: "City service not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "City service deleted successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("[DELETE /api/city-services/[id]]", err);
    return NextResponse.json(
      { error: "Failed to delete city service." },
      { status: 500 }
    );
  }
}


