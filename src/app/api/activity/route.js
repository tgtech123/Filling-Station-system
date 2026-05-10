import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/activity`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({ activities: [] }));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("âŒ /api/activity proxy error:", err.message);
    return NextResponse.json({ error: "Failed to fetch activity", activities: [] }, { status: 500 });
  }
}
