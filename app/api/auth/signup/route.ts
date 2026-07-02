import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const cleanEmail = String(email ?? "").toLowerCase().trim();
    const cleanName = String(name ?? "").trim();

    if (!EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    if (!password || String(password).length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    await db.user.create({
      data: { email: cleanEmail, name: cleanName || null, passwordHash, provider: "credentials" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
