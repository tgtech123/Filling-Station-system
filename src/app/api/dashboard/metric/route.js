import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/dashboard/metric`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("âŒ /api/dashboard/metric proxy error:", err.message);
    return NextResponse.json({ message: "Failed to fetch metrics" }, { status: 500 });
  }
}
