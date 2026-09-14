import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:4000";
export const dynamic = "force-dynamic";

async function handler(req: NextRequest, path: string[]) {
  const url = new URL(`${BACKEND_URL}/${path.join("/")}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers(req.headers);
  headers.set("host", new URL(BACKEND_URL).host);

  const res = await fetch(url.toString(), {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method)
      ? undefined
      : await req.text(),
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";

  if (
    contentType.startsWith("image/") ||
    contentType === "application/pdf"
  ) {
    return new NextResponse(res.body, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  }

  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: {
      "Content-Type": contentType || "application/json",
    },
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handler(req, path);
}
export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handler(req, path);
}
export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handler(req, path);
}
export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handler(req, path);
}
