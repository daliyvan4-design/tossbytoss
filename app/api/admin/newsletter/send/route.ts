import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBroadcast } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { subject, body } = await req.json();

    if (!subject || !body) {
      return NextResponse.json({ error: "Objet et corps requis." }, { status: 400 });
    }

    const subscribers = await db.subscriber.findMany({
      where: { active: true },
      select: { email: true, unsubToken: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    const html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#f5f2ec;background:#0a0a0a;padding:48px;">
        ${body}
        <hr style="margin:40px 0;border:none;border-top:1px solid rgba(245,242,236,0.1);" />
        <p style="font-family:'Courier New',monospace;font-size:10px;opacity:0.4;letter-spacing:0.1em;">
          Vous recevez cet email car vous êtes abonné(e) à la newsletter Toss by Toss.<br/>
          <a href="{{UNSUB_URL}}" style="color:rgba(245,242,236,0.5);">Se désabonner</a>
        </p>
      </div>`;

    await sendBroadcast(subscribers, subject, html);

    return NextResponse.json({ ok: true, count: subscribers.length });
  } catch (err) {
    console.error("[newsletter/send]", err);
    return NextResponse.json({ error: "Erreur envoi." }, { status: 500 });
  }
}
