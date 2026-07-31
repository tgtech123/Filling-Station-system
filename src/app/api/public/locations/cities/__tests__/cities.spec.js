import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) },
}));

import { GET } from "../route";

const call = (country, state) =>
  GET({ url: `http://x/api?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}` });

beforeEach(() => {
  global.fetch = vi.fn();
});

describe("city lookup", () => {
  it("returns what the upstream dataset provides", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ data: ["Ikeja", "Lekki"] }) });
    const res = await call("Nigeria", "Lagos");
    expect(res.body.data).toEqual(["Ikeja", "Lekki"]);
  });

  it("falls back to the local list when upstream returns none for FCT", async () => {
    // The reported bug: the upstream dataset has no cities for the Federal
    // Capital Territory, leaving a REQUIRED dropdown with nothing to pick and
    // no way to finish signing up.
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });

    const res = await call("Nigeria", "FCT - Abuja");
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data).toContain("Abuja");
    expect(res.body.source).toBe("local");
  });

  it("recognises the territory under every name it is given", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });

    for (const name of ["FCT", "Federal Capital Territory", "Abuja", "fct - abuja"]) {
      const res = await call("Nigeria", name);
      expect(res.body.data, `"${name}" should resolve to FCT`).toContain("Abuja");
    }
  });

  it("serves the local list when the upstream service is down", async () => {
    global.fetch.mockRejectedValue(new Error("network down"));
    const res = await call("Nigeria", "Lagos");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("reports a genuine failure for a country with no local fallback", async () => {
    global.fetch.mockRejectedValue(new Error("network down"));
    const res = await call("Ghana", "Greater Accra");
    expect(res.status).toBe(500);
  });

  it("requires both parameters", async () => {
    const res = await GET({ url: "http://x/api?country=Nigeria" });
    expect(res.status).toBe(400);
  });
});
