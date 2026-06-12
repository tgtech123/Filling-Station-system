import { NextResponse } from "next/server";

// Same-origin proxy for the accounting suite. The browser only ever talks to
// this app's own origin (no CORS, no cross-origin failures on mobile); this
// route forwards server-side to the backend like the other /api/* proxies.
const BACKEND =
  process.env.NEXT_PUBLIC_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fueldesk-station-server.onrender.com";

async function handler(req, { params }) {
  const { path } = await params;
  const slug = Array.isArray(path) ? path.join("/") : path;
  const { search } = new URL(req.url);
  const url = `${BACKEND}/api/accounting/${slug}${search}`;

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const isBodyMethod = ["POST", "PUT", "PATCH"].includes(req.method);
  const body = isBodyMethod ? await req.text() : undefined;

  try {
    const res = await fetch(url, { method: req.method, headers, body });
    const contentType = res.headers.get("content-type") || "";

    // CSV downloads (chart export, EFT/ACH files) must pass through as text
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: {
          "Content-Type": contentType || "text/plain",
          "Content-Disposition": res.headers.get("content-disposition") || "",
        },
      });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: `Accounting service unreachable: ${err.message}` },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
