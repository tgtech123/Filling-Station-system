import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/tank`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/tank proxy error:", err.message);
    return NextResponse.json({ message: "Failed to fetch tanks", data: [] }, { status: 500 });
  }
}
