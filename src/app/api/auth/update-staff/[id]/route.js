import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { id } = await params;
  const auth = request.headers.get("authorization") || "";
  try {
    const body = await request.json();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/auth/update-staff/${id}`,
      {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          ...(auth && { Authorization: auth }),
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/auth/update-staff proxy error:", err.message);
    return NextResponse.json({ message: "Failed to update staff" }, { status: 500 });
  }
}
