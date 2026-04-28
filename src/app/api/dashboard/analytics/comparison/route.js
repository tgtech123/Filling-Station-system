import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API}/api/dashboard/analytics/comparison`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
          ...(auth && { Authorization: auth }),
        },
        cache: "no-store",
      }
    );
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/dashboard/analytics/comparison proxy error:", err.message);
    return NextResponse.json({ message: "Failed to fetch comparison data" }, { status: 500 });
  }
}
