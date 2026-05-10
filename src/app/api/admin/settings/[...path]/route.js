import { NextResponse } from "next/server";

async function handler(req, { params }) {
  const { path } = await params;
  const slug = Array.isArray(path) ? path.join("/") : path;
  const { search } = new URL(req.url);
  const url = `${process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com"}/api/admin/settings/${slug}${search}`;

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const isBodyMethod = ["POST", "PUT", "PATCH"].includes(req.method);
  let body;
  if (isBodyMethod) {
    try { body = await req.text(); } catch { body = undefined; }
  }

  try {
    const res = await fetch(url, { method: req.method, headers, body, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`❌ /api/admin/settings/${slug} proxy error:`, err.message);
    return NextResponse.json({ error: err.message || "Proxy error" }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
