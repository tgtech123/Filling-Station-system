import { NextResponse } from "next/server";

// GET — invites for a specific branch
export async function GET(request, { params }) {
  const auth = request.headers.get("authorization") || "";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API}/api/branches/${params.branchId}/invites`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: auth,
        },
        cache: "no-store",
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`❌ GET /api/branches/${params.branchId} proxy error:`, err.message);
    return NextResponse.json({ message: "Failed to fetch branch data" }, { status: 500 });
  }
}
