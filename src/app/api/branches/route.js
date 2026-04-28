import { NextResponse } from "next/server";

// GET — fetch all branches for this manager
export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/branches`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: auth,
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ GET /api/branches proxy error:", err.message);
    return NextResponse.json({ message: "Failed to fetch branches" }, { status: 500 });
  }
}
