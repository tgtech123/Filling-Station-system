import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { tankId } = await params;
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/tank/delete-tank/${tankId}`,
      {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          ...(auth && { Authorization: auth }),
        },
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/tank/delete-tank proxy error:", err.message);
    return NextResponse.json({ message: "Failed to delete tank" }, { status: 500 });
  }
}
