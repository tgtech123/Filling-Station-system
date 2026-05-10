import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "monthly";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/branches/consolidated-report?period=${period}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: auth,
        },
        cache: "no-store",
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("âŒ GET /api/branches/consolidated-report proxy error:", err.message);
    return NextResponse.json({ message: "Failed to fetch consolidated report" }, { status: 500 });
  }
}
