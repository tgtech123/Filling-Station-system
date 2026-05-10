import { NextResponse } from "next/server";

export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/emergency/deactivate`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
        ...(auth && { Authorization: auth }),
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("âŒ /api/emergency/deactivate proxy error:", err.message);
    return NextResponse.json({ message: "Failed to deactivate emergency" }, { status: 500 });
  }
}
