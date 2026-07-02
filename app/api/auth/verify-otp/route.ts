import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { otpLimiter } from "@/lib/rate-limit";
import { sendNewsletterWelcome } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
    const { success } = await otpLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    }

    const { email, code } = await req.json();
    const cleanEmail = String(email ?? "").toLowerCase().trim();
    const cleanCode = String(code ?? "").trim();

    if (!cleanEmail || !/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json({ error: "Code invalide." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: cleanEmail } });
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return NextResponse.json({ error: "Aucune vérification en attente." }, { status: 400 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }
    if (user.otpExpiresAt < new Date()) {
      return NextResponse.json({ error: "Code expiré. Demandez-en un nouveau." }, { status: 400 });
    }
    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Trop d'essais. Demandez un nouveau code." }, { status: 429 });
    }

    const ok = await verifyOtp(cleanCode, user.otpHash);
    if (!ok) {
      await db.user.update({ where: { id: user.id }, data: { otpAttempts: { increment: 1 } } });
      const left = OTP_MAX_ATTEMPTS - user.otpAttempts - 1;
      return NextResponse.json({ error: left > 0 ? `Code incorrect. ${left} essai(s) restant(s).` : "Code incorrect." }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), otpHash: null, otpExpiresAt: null, otpAttempts: 0 },
    });

    // Email de bienvenue newsletter si l'utilisateur s'est abonné à l'inscription
    const sub = await db.subscriber.findUnique({ where: { email: cleanEmail } });
    if (sub?.active) await sendNewsletterWelcome(cleanEmail).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
