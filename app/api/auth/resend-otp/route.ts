import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOtp, hashOtp, otpExpiry } from "@/lib/otp";
import { otpLimiter } from "@/lib/rate-limit";
import { sendWelcomeOtp } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
    const { success } = await otpLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    }

    const { email } = await req.json();
    const cleanEmail = String(email ?? "").toLowerCase().trim();

    const user = await db.user.findUnique({ where: { email: cleanEmail } });
    // Réponse identique que le compte existe ou non (pas de fuite d'info)
    if (!user || user.emailVerified) {
      return NextResponse.json({ ok: true });
    }

    const code = generateOtp();
    await db.user.update({
      where: { id: user.id },
      data: { otpHash: await hashOtp(code), otpExpiresAt: otpExpiry(), otpAttempts: 0 },
    });
    await sendWelcomeOtp({ name: user.name, email: cleanEmail, code }).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[resend-otp]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
