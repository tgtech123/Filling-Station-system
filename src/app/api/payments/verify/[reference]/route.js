import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { reference } = await params;
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/payments/verify/${reference}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
          ...(auth && { Authorization: auth }),
        },
        cache: "no-store",
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/payments/verify proxy error:", err.message);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
