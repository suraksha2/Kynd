import { NextRequest, NextResponse } from "next/server";
import { getCitiesByServiceId } from "@/lib/city-services-db";

export async function GET(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { serviceId } = params;
    const cityServices = await getCitiesByServiceId(serviceId);
    
    return NextResponse.json({ data: cityServices }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/city-services/by-service/[serviceId]]", err);
    return NextResponse.json(
      { error: "Failed to fetch cities for service." },
      { status: 500 }
    );
  }
}
