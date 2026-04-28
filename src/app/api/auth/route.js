import { NextResponse } from "next/server";

// GET — fetch all staff
export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/auth`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ GET /api/auth proxy error:", err.message);
    return NextResponse.json({ message: "Failed to fetch staff" }, { status: 500 });
  }
}

// POST — create new staff
export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/auth`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
        ...(auth && { Authorization: auth }),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ POST /api/auth proxy error:", err.message);
    return NextResponse.json({ message: "Failed to create staff" }, { status: 500 });
  }
}
