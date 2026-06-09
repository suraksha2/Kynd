import { NextRequest, NextResponse } from "next/server";
import { deleteCity, updateCity } from "@/lib/cities-db";
import { UpdateCityInput } from "@/lib/types";


type RouteContext = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const body: UpdateCityInput = await req.json();
    if ((body.cityName !== undefined && !body.cityName.trim()) || (body.pinCode !== undefined && !body.pinCode.trim())) {
      return NextResponse.json(
        { error: "City name and pin code cannot be empty." },
        { status: 400 }
      );
    }

    const city = await updateCity(params.id, {
      cityName: body.cityName?.trim(),
      pinCode: body.pinCode?.trim(),
      serviceCategoryId: body.serviceCategoryId,
    });
    if (!city) {
      return NextResponse.json({ error: "City not found." }, { status: 404 });
    }

    return NextResponse.json({ data: city }, { status: 200 });
  } catch (err) {
    console.error("[PUT /api/cities/[id]]", err);
    return NextResponse.json({ error: "Failed to update city." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const deleted = await deleteCity(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "City not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "City deleted successfully." }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/cities/[id]]", err);
    return NextResponse.json({ error: "Failed to delete city." }, { status: 500 });
  }
}

