import { NextRequest, NextResponse } from "next/server";
import { getCitiesByServiceName } from "@/lib/city-services-db";

export async function GET(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const serviceName = decodeURIComponent(params.serviceId);
    const cityServices = await getCitiesByServiceName(serviceName);

    return NextResponse.json({ data: cityServices }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/city-services/by-service/[serviceId]]", err);
    return NextResponse.json(
      { error: "Failed to fetch cities for service." },
      { status: 500 }
    );
  }
}
