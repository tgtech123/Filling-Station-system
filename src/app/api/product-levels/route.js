import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/product-levels`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/product-levels proxy error:", err.message);
    return NextResponse.json({ error: "Failed to fetch product levels", productLevels: [] }, { status: 500 });
  }
}
