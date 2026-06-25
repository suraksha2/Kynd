import { NextRequest, NextResponse } from "next/server";
import { deleteCityArea, updateCityArea } from "@/lib/city-areas-db";
import { UpdateCityAreaInput } from "@/lib/types";

type RouteContext = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const body: UpdateCityAreaInput = await req.json();
    if (body.areaName !== undefined && !body.areaName.trim()) {
      return NextResponse.json(
        { error: "Area name cannot be empty." },
        { status: 400 }
      );
    }

    const area = await updateCityArea(params.id, {
      areaName: body.areaName?.trim(),
      pincode: body.pincode?.trim(),
      status: body.status,
    });
    if (!area) {
      return NextResponse.json({ error: "City area not found." }, { status: 404 });
    }

    return NextResponse.json({ data: area }, { status: 200 });
  } catch (err) {
    console.error("[PUT /api/city-areas/[id]]", err);
    return NextResponse.json({ error: "Failed to update city area." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const deleted = await deleteCityArea(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "City area not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "City area deleted successfully." }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/city-areas/[id]]", err);
    return NextResponse.json({ error: "Failed to delete city area." }, { status: 500 });
  }
}
