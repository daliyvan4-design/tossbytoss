import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Quand le domaine Zoho sera vérifié dans Resend, changer RESEND_FROM dans les env Vercel.
// Ex: "Toss by Toss <contact@tossbytoss.ci>"
const FROM = process.env.RESEND_FROM ?? "Toss by Toss <onboarding@resend.dev>";
const REPLY_TO = process.env.RESEND_REPLY_TO ?? "bobdali127@gmail.com";

export interface InvoiceItem {
  name: string;
  ref: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceData {
  customerName: string;
  customerEmail: string;
  orderRef: string;
  orderDate: string;
  items: InvoiceItem[];
  total: number;
}

function fmt(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ /g, " ") + " XOF";
}

function buildItemRows(items: InvoiceItem[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:18px 0;border-bottom:1px solid rgba(245,242,236,0.08);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:19px;line-height:1.2;color:#f5f2ec;">${item.name}</p>
                <p style="margin:5px 0 0;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,242,236,0.42);">${item.ref} &nbsp;·&nbsp; Qté ${item.qty}</p>
              </td>
              <td align="right" style="vertical-align:top;padding-top:3px;white-space:nowrap;">
                <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:12px;letter-spacing:0.1em;color:rgba(245,242,236,0.75);">${fmt(item.unitPrice * item.qty)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");
}

export function buildInvoiceHtml(data: InvoiceData): string {
  const firstName = data.customerName.split(" ")[0];

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Confirmation de commande — Toss by Toss</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;">
  <tr>
    <td align="center" style="padding:48px 20px 64px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- EN-TÊTE -->
        <tr>
          <td style="padding:52px 52px 44px;border-bottom:1px solid rgba(245,242,236,0.13);">
            <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.36em;text-transform:uppercase;color:#f5f2ec;">Toss by Toss</p>
            <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13px;letter-spacing:0.04em;color:rgba(245,242,236,0.48);">L'art du cuir, fait à Abidjan.</p>
          </td>
        </tr>

        <!-- MESSAGE PRINCIPAL -->
        <tr>
          <td style="padding:52px 52px 16px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:400;font-size:48px;line-height:1.0;letter-spacing:-0.01em;color:#f5f2ec;">Merci, ${firstName}.</p>
            <p style="margin:18px 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:300;font-size:15px;line-height:1.65;letter-spacing:0.02em;color:rgba(245,242,236,0.75);">Votre commande est confirmée — nous la préparons avec soin.</p>
          </td>
        </tr>

        <!-- RÉFÉRENCE COMMANDE -->
        <tr>
          <td style="padding:0 52px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(245,242,236,0.13);border-bottom:1px solid rgba(245,242,236,0.13);margin-top:32px;">
              <tr>
                <td style="padding:16px 0;">
                  <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(245,242,236,0.48);">Réf.&nbsp;${data.orderRef}&nbsp;&nbsp;·&nbsp;&nbsp;${data.orderDate}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ARTICLES -->
        <tr>
          <td style="padding:0 52px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${buildItemRows(data.items)}
            </table>
          </td>
        </tr>

        <!-- TOTAL -->
        <tr>
          <td style="padding:0 52px 52px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(245,242,236,0.22);">
              <tr>
                <td style="padding:24px 0 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.34em;text-transform:uppercase;color:rgba(245,242,236,0.48);vertical-align:middle;">Total</td>
                      <td align="right">
                        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:38px;line-height:1;color:#f5f2ec;">${fmt(data.total)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- LIVRAISON -->
        <tr>
          <td style="padding:0 52px 52px;border-top:1px solid rgba(245,242,236,0.08);">
            <p style="margin:28px 0 0;font-family:'Courier New',Courier,monospace;font-size:9.5px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,242,236,0.4);">Livraison Abidjan&nbsp;: 1–2 jours &nbsp;·&nbsp; International&nbsp;: 5–10 jours</p>
            <p style="margin:10px 0 0;font-family:'Courier New',Courier,monospace;font-size:9.5px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,242,236,0.4);">Un suivi vous sera envoyé dès l'expédition</p>
          </td>
        </tr>

        <!-- PIED -->
        <tr>
          <td style="padding:32px 52px 52px;border-top:1px solid rgba(245,242,236,0.08);">
            <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,242,236,0.35);">@tossbytoss &nbsp;·&nbsp; Atelier № 04, Plateau, Abidjan, Côte d'Ivoire</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export async function sendInvoice(data: InvoiceData) {
  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: data.customerEmail,
    subject: `Confirmation · Réf. ${data.orderRef} — Toss by Toss`,
    html: buildInvoiceHtml(data),
  });
}

export function buildUnsubscribeUrl(token: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${token}`;
}

export async function sendBroadcast(
  subscribers: { email: string; unsubToken: string }[],
  subject: string,
  htmlTemplate: string
): Promise<void> {
  const chunks: typeof subscribers[] = [];
  for (let i = 0; i < subscribers.length; i += 100) {
    chunks.push(subscribers.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    const emails = chunk.map((sub) => ({
      from: FROM,
      replyTo: REPLY_TO,
      to: sub.email,
      subject,
      html: htmlTemplate.replace("{{UNSUB_URL}}", buildUnsubscribeUrl(sub.unsubToken)),
    }));

    await resend.batch.send(emails);
  }
}

export async function sendStatusUpdate({
  customerName,
  customerEmail,
  orderRef,
  status,
  trackingNumber,
}: {
  customerName: string;
  customerEmail: string;
  orderRef: string;
  status: "SHIPPED" | "DELIVERED";
  trackingNumber?: string;
}) {
  const firstName = customerName.split(" ")[0];
  const isShipped = status === "SHIPPED";

  const subject = isShipped
    ? `Votre commande est en route · Réf. ${orderRef}`
    : `Votre commande est livrée · Réf. ${orderRef}`;

  const headline = isShipped ? `En route, ${firstName}.` : `Livrée, ${firstName}.`;
  const body = isShipped
    ? "Votre commande a été expédiée. Elle vous parviendra dans les prochains jours. En cas de question, répondez à cet email."
    : "Votre commande vous a été remise. Nous espérons qu'elle vous enchante. N'hésitez pas à nous partager vos impressions.";

  const trackingBlock = isShipped && trackingNumber
    ? `<tr><td style="padding:0 52px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(245,242,236,0.04);border:1px solid rgba(245,242,236,0.10);">
          <tr><td style="padding:18px 24px;">
            <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.32em;text-transform:uppercase;color:rgba(245,242,236,0.35);">Numéro de suivi</p>
            <p style="margin:0;font-family:'Courier New',monospace;font-size:14px;letter-spacing:0.12em;color:#f5f2ec;">${trackingNumber}</p>
          </td></tr>
        </table>
      </td></tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;">
  <tr><td align="center" style="padding:48px 20px 64px;">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
      <tr>
        <td style="padding:44px 52px 36px;border-bottom:1px solid rgba(245,242,236,0.12);">
          <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.36em;text-transform:uppercase;color:#f5f2ec;">Toss by Toss</p>
          <p style="margin:7px 0 0;font-family:Georgia,serif;font-style:italic;font-size:12px;color:rgba(245,242,236,0.45);">L'art du cuir, fait à Abidjan.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:48px 52px 36px;">
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:46px;line-height:1;color:#f5f2ec;">${headline}</p>
          <p style="margin:22px 0 0;font-family:'Helvetica Neue',sans-serif;font-weight:300;font-size:15px;line-height:1.7;color:rgba(245,242,236,0.75);">${body}</p>
        </td>
      </tr>
      ${trackingBlock}
      <tr>
        <td style="padding:0 52px 44px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(245,242,236,0.12);border-bottom:1px solid rgba(245,242,236,0.12);">
            <tr><td style="padding:14px 0;">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(245,242,236,0.45);">Réf. ${orderRef}</p>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 52px 52px;border-top:1px solid rgba(245,242,236,0.08);">
          <p style="margin:24px 0 0;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(245,242,236,0.3);">@tossbytoss &nbsp;·&nbsp; Atelier № 04, Plateau, Abidjan</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  return resend.emails.send({ from: FROM, replyTo: REPLY_TO, to: customerEmail, subject, html });
}

export async function sendNewsletterWelcome(email: string) {
  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: email,
    subject: "Bienvenue dans le cercle · Toss by Toss",
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/><title>Bienvenue — Toss by Toss</title></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;">
  <tr>
    <td align="center" style="padding:48px 20px 64px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:52px 52px 44px;border-bottom:1px solid rgba(245,242,236,0.13);">
            <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.36em;text-transform:uppercase;color:#f5f2ec;">Toss by Toss</p>
          </td>
        </tr>
        <tr>
          <td style="padding:52px 52px 0;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:44px;line-height:1.05;letter-spacing:-0.01em;color:#f5f2ec;">Bienvenue dans le cercle.</p>
            <p style="margin:20px 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:300;font-size:15px;line-height:1.65;color:rgba(245,242,236,0.75);">Vous recevrez nos nouveautés, éditions limitées et invitations privées — une lettre par saison. Rien de plus.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:52px 52px 52px;border-top:1px solid rgba(245,242,236,0.08);margin-top:48px;">
            <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,242,236,0.35);">@tossbytoss &nbsp;·&nbsp; Abidjan, Côte d'Ivoire</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`,
  });
}
