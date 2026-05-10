import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/payments/current-plan`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: auth,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("âŒ /api/payments/current-plan proxy error:", err.message);
    return NextResponse.json({ error: "Failed to fetch current plan" }, { status: 500 });
  }
}
