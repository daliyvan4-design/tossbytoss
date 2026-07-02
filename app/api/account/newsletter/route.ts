import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const sub = await db.subscriber.findUnique({ where: { email } });
  return NextResponse.json({ active: !!sub?.active });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { active } = await req.json();
  const wantActive = !!active;

  await db.subscriber.upsert({
    where: { email },
    update: { active: wantActive },
    create: { email, source: "NEWSLETTER", active: wantActive },
  });

  return NextResponse.json({ ok: true, active: wantActive });
}
