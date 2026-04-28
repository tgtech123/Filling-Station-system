import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/branches/overview`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: auth,
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ GET /api/branches/overview proxy error:", err.message);
    return NextResponse.json({ message: "Failed to fetch branch overview" }, { status: 500 });
  }
}
