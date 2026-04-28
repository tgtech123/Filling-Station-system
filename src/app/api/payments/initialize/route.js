import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const body = await request.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/payments/initialize`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/payments/initialize proxy error:", err.message);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
