import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "monthly";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API}/api/dashboard/analytics/revenue?period=${period}`,
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
    console.error("❌ /api/dashboard/analytics/revenue proxy error:", err.message);
    return NextResponse.json({ message: "Failed to fetch revenue trend" }, { status: 500 });
  }
}
