import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API;

async function handler(req) {
  const { search } = new URL(req.url);
  const url = `${BACKEND}/api/lubricant${search}`;

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
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ /api/lubricant proxy error:", err.message);
    return NextResponse.json({ error: "Proxy error", data: [] }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
