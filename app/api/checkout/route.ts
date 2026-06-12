import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOrderRef } from "@/lib/order";
import { initiatePayment } from "@/lib/genius-pay";
import { checkoutLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
    const { success } = await checkoutLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429 });
    }

    const { items, customerName, customerEmail, customerPhone } = await req.json();

    if (!items?.length || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    const refs: string[] = items.map((i: { ref: string }) => i.ref);
    const products = await db.product.findMany({
      where: { ref: { in: refs }, active: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json({ error: "Produit introuvable ou indisponible." }, { status: 400 });
    }

    let total = 0;
    const orderItems = items.map((item: { ref: string; qty: number }) => {
      const product = products.find((p) => p.ref === item.ref)!;
      if (product.stock < item.qty) {
        throw new Error(`Stock insuffisant pour ${product.name}`);
      }
      total += product.price * item.qty;
      return { qty: item.qty, unitPrice: product.price, productId: product.id };
    });

    const ref = generateOrderRef();

    const order = await db.order.create({
      data: {
        ref,
        status: "PENDING",
        total,
        customerName,
        customerEmail,
        customerPhone,
        items: { create: orderItems },
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const { paymentUrl, paymentRef } = await initiatePayment({
      amount: total,
      currency: "XOF",
      orderRef: ref,
      customerEmail,
      customerName,
      customerPhone,
      returnUrl: `${siteUrl}/confirmation?ref=${ref}`,
      webhookUrl: `${siteUrl}/api/webhook/genius-pay`,
    });

    await db.order.update({ where: { id: order.id }, data: { paymentRef } });

    return NextResponse.json({ paymentUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur.";
    console.error("[checkout]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
