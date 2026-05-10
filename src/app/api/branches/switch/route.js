import { NextResponse } from "next/server";

export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/branches/switch`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("âŒ POST /api/branches/switch proxy error:", err.message);
    return NextResponse.json({ message: "Failed to switch station" }, { status: 500 });
  }
}
