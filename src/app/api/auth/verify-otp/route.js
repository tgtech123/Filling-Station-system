import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/auth/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("POST /api/auth/verify-otp proxy error:", err.message);
    return NextResponse.json({ message: "Verification failed" }, { status: 500 });
  }
}
