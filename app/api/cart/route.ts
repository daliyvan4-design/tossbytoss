import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const TTL = 60 * 60 * 24 * 14; // 14 jours

function getSessionId(req: NextRequest): string | null {
  return req.cookies.get("tbt_sid")?.value ?? null;
}

export async function GET(req: NextRequest) {
  const sid = getSessionId(req);
  if (!sid) return NextResponse.json({ cart: [] });

  const cart = await redis.get<[number, number][]>(`cart:${sid}`).catch(() => null);
  return NextResponse.json({ cart: cart ?? [] });
}

export async function PUT(req: NextRequest) {
  const sid = getSessionId(req);
  if (!sid) return NextResponse.json({ ok: false });

  const { cart } = await req.json();
  await redis.set(`cart:${sid}`, cart, { ex: TTL }).catch(() => null);
  return NextResponse.json({ ok: true });
}
