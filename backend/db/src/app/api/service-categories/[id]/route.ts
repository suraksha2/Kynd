import { NextRequest, NextResponse } from "next/server";
import {
  getServiceCategoryById,
  updateServiceCategory,
  deleteServiceCategory,
} from "@/lib/service-categories-db";
import { UpdateServiceCategoryInput } from "@/lib/service-category-types";


type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  const category = await getServiceCategoryById(params.id);
  if (!category) {
    return NextResponse.json({ error: "Service category not found." }, { status: 404 });
  }
  return NextResponse.json({ data: category }, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const body: UpdateServiceCategoryInput = await req.json();
    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json(
        { error: "Category name cannot be empty." },
        { status: 400 }
      );
    }

    const updated = await updateServiceCategory(params.id, {
      ...body,
      name: body.name?.trim(),
      description: body.description?.trim(),
    });

    if (!updated) {
      return NextResponse.json({ error: "Service category not found." }, { status: 404 });
    }

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update service category." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const deleted = await deleteServiceCategory(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Service category not found." }, { status: 404 });
  }
  return NextResponse.json({ message: "Service category deleted." }, { status: 200 });
}
