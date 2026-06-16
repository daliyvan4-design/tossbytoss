import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    await resend.emails.send({
      from: "Site Toss by Toss <contact@tossbytoss.ci>",
      to: "bobdali127@gmail.com",
      replyTo: email,
      subject: `Message de ${name} — Toss by Toss`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;">
  <tr><td align="center" style="padding:48px 20px;">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
      <tr>
        <td style="padding:40px 48px 32px;border-bottom:1px solid rgba(245,242,236,0.12);">
          <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.36em;text-transform:uppercase;color:#f5f2ec;">Toss by Toss</p>
          <p style="margin:6px 0 0;font-family:Georgia,serif;font-style:italic;font-size:12px;color:rgba(245,242,236,0.45);">Nouveau message depuis le site</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 48px 0;">
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:32px;line-height:1.1;color:#f5f2ec;">${name}</p>
          <p style="margin:8px 0 0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(245,242,236,0.4);">${email}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 48px 48px;">
          <div style="border-top:1px solid rgba(245,242,236,0.1);padding-top:28px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:17px;line-height:1.75;color:rgba(245,242,236,0.85);white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 48px 48px;border-top:1px solid rgba(245,242,236,0.08);">
          <p style="margin:24px 0 0;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,242,236,0.3);">Répondre directement à cet email pour contacter ${name}</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Erreur envoi." }, { status: 500 });
  }
}
