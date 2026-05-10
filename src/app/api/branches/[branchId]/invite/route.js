import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { branchId } = await params;
  const auth = request.headers.get("authorization") || "";
  try {
    const body = await request.json();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/branches/${branchId}/invite`,
      {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`❌ POST /api/branches/${branchId}/invite proxy error:`, err.message);
    return NextResponse.json({ message: "Failed to send invite" }, { status: 500 });
  }
}
