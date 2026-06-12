import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse("Lien invalide.", { status: 400 });
  }

  const subscriber = await db.subscriber.findUnique({ where: { unsubToken: token } });

  if (!subscriber) {
    return new NextResponse("Lien invalide ou déjà utilisé.", { status: 400 });
  }

  await db.subscriber.update({ where: { unsubToken: token }, data: { active: false } });

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Désabonnement — Toss by Toss</title></head>
<body style="font-family:Georgia,serif;background:#0a0a0a;color:#f5f2ec;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;margin:0;">
  <div>
    <p style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;opacity:0.4;margin-bottom:16px;">Toss by Toss</p>
    <h1 style="font-style:italic;font-weight:300;font-size:48px;margin:0 0 20px;">Désinscription confirmée.</h1>
    <p style="opacity:0.5;font-size:18px;margin:0;">Vous ne recevrez plus d'emails de notre part.</p>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
