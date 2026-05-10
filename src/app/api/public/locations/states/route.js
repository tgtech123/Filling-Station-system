import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  if (!country) {
    return NextResponse.json({ error: "country query param is required" }, { status: 400 });
  }
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const json = await res.json();
    const states = (json.data?.states || [])
      .map((s) => s.name)
      .filter(Boolean)
      .sort();
    return NextResponse.json({ data: states });
  } catch (err) {
    console.error("❌ /api/public/locations/states error:", err.message);
    return NextResponse.json({ error: "Failed to fetch states" }, { status: 500 });
  }
}
