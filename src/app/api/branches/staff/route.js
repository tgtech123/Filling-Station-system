import { NextResponse } from "next/server";

// GET — all staff across branches
export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/branches/staff`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: auth,
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ GET /api/branches/staff proxy error:", err.message);
    return NextResponse.json({ message: "Failed to fetch branch staff" }, { status: 500 });
  }
}

// POST — transfer staff between branches
export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/branches/staff/transfer`, {
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
    console.error("❌ POST /api/branches/staff/transfer proxy error:", err.message);
    return NextResponse.json({ message: "Failed to transfer staff" }, { status: 500 });
  }
}
