import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendNewsletterWelcome } from "@/lib/resend";
import { newsletterLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
    const { success } = await newsletterLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();

    const existing = await db.subscriber.findUnique({ where: { email: normalized } });

    if (!existing) {
      await db.subscriber.create({
        data: { email: normalized, source: "NEWSLETTER" },
      });
      await sendNewsletterWelcome(normalized).catch(console.error);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
