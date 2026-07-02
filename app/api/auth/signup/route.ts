import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateOtp, hashOtp, otpExpiry } from "@/lib/otp";
import { sendWelcomeOtp } from "@/lib/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, newsletter } = await req.json();
    const cleanEmail = String(email ?? "").toLowerCase().trim();
    const cleanName = String(name ?? "").trim();

    if (!EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    if (!password || String(password).length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: cleanEmail } });
    if (existing?.emailVerified) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const code = generateOtp();
    const otpHash = await hashOtp(code);

    // Upsert : permet de recommencer une inscription non finalisée (non vérifiée).
    await db.user.upsert({
      where: { email: cleanEmail },
      update: { name: cleanName || null, passwordHash, otpHash, otpExpiresAt: otpExpiry(), otpAttempts: 0 },
      create: {
        email: cleanEmail,
        name: cleanName || null,
        passwordHash,
        provider: "credentials",
        otpHash,
        otpExpiresAt: otpExpiry(),
      },
    });

    // Opt-in newsletter (facultatif)
    if (newsletter) {
      await db.subscriber.upsert({
        where: { email: cleanEmail },
        update: { active: true },
        create: { email: cleanEmail, source: "NEWSLETTER" },
      }).catch(console.error);
    }

    await sendWelcomeOtp({ name: cleanName, email: cleanEmail, code }).catch(console.error);

    return NextResponse.json({ ok: true, needsVerification: true });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
