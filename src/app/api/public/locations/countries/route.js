import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 86400 }, // cache for 24 h at Next.js layer
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const json = await res.json();
    const countries = (json.data || [])
      .map((d) => d.country)
      .filter(Boolean)
      .sort();
    return NextResponse.json({ data: countries });
  } catch (err) {
    console.error("❌ /api/public/locations/countries error:", err.message);
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
  }
}
