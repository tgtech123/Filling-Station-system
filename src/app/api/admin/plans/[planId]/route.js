import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { planId } = await params;
    const auth = request.headers.get("authorization") || "";
    const body = await request.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/admin/plans/${planId}`, {
      method: "PATCH",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/admin/plans PATCH proxy error:", err.message);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { planId } = await params;
    const auth = request.headers.get("authorization") || "";
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/admin/plans/${planId}`, {
      method: "DELETE",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: auth,
      },
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/admin/plans DELETE proxy error:", err.message);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
