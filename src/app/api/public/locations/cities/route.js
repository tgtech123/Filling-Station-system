import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const state = searchParams.get("state");
  if (!country || !state) {
    return NextResponse.json({ error: "country and state query params are required" }, { status: 400 });
  }
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, state }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const json = await res.json();
    const cities = (json.data || []).filter(Boolean).sort();
    return NextResponse.json({ data: cities });
  } catch (err) {
    console.error("❌ /api/public/locations/cities error:", err.message);
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}
