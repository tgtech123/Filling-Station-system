import { NextResponse } from "next/server";
import { NIGERIAN_CITIES } from "@/lib/nigeriaLocations";

/**
 * The upstream dataset has gaps — most notably it returns NO cities for
 * Nigeria's Federal Capital Territory, which left FCT users staring at an empty
 * dropdown on a required field with no way to finish signing up.
 *
 * So: try upstream, and fall back to the local Nigerian list when it comes back
 * empty. The client additionally allows free text when both are empty, so no
 * state anywhere can trap a user.
 */

// Match a state name across naming styles: "FCT - Abuja", "Federal Capital
// Territory", "fct", "Abuja" all have to resolve to the same local entry.
const normalise = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");

const ALIASES = {
  federalcapitalterritory: "FCT - Abuja",
  fct: "FCT - Abuja",
  fctabuja: "FCT - Abuja",
  abuja: "FCT - Abuja",
  abujafederalcapitalterritory: "FCT - Abuja",
};

function localCities(state) {
  const key = normalise(state);

  const aliased = ALIASES[key];
  if (aliased && NIGERIAN_CITIES[aliased]) return NIGERIAN_CITIES[aliased];

  const match = Object.keys(NIGERIAN_CITIES).find((k) => normalise(k) === key);
  return match ? NIGERIAN_CITIES[match] : [];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const state = searchParams.get("state");
  if (!country || !state) {
    return NextResponse.json({ error: "country and state query params are required" }, { status: 400 });
  }

  const isNigeria = normalise(country) === "nigeria";

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

    if (cities.length > 0) return NextResponse.json({ data: cities });

    // Upstream knows the state but has no cities for it — FCT is the case that
    // prompted this. Serve the local list rather than an empty dropdown.
    if (isNigeria) {
      const fallback = localCities(state);
      if (fallback.length > 0) {
        return NextResponse.json({ data: [...fallback].sort(), source: "local" });
      }
    }

    return NextResponse.json({ data: [] });
  } catch (err) {
    console.error("❌ /api/public/locations/cities error:", err.message);

    // Upstream down: Nigerian signups still work off the local list instead of
    // failing outright.
    if (isNigeria) {
      const fallback = localCities(state);
      if (fallback.length > 0) {
        return NextResponse.json({ data: [...fallback].sort(), source: "local" });
      }
    }

    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}
