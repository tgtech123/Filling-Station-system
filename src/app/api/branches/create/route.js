import { NextResponse } from "next/server";

export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/branches/create`, {
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
    console.error("❌ POST /api/branches/create proxy error:", err.message);
    return NextResponse.json({ message: "Failed to create branch" }, { status: 500 });
  }
}
