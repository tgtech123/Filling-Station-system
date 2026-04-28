import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/public/plans`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Backend returned an error", plans: [] },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ /api/public/plans proxy error:", err.message);
    return NextResponse.json({ error: "Failed to fetch plans", plans: [] }, { status: 500 });
  }
}
