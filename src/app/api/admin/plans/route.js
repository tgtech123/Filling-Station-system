import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/admin/plans`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: auth,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/admin/plans proxy error:", err.message);
    return NextResponse.json({ error: "Failed to fetch plans", plans: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const body = await request.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/admin/plans`, {
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
    console.error("❌ /api/admin/plans POST proxy error:", err.message);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
