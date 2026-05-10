import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/public/settings`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store",
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("âŒ /api/public/settings proxy error:", err.message);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
