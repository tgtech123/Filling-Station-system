import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/auth/login`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("âŒ POST /api/auth/login proxy error:", err.message);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
