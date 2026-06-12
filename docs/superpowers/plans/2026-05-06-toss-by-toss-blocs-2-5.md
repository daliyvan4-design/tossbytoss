# Toss by Toss — Blocs 2–5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement checkout + Genius Pay payments, admin product/order management, stock tracking + analytics + accounting, and newsletter admin for the Toss by Toss e-commerce platform.

**Architecture:** Next.js 15 App Router on Vercel; Neon PostgreSQL via Prisma; Cloudinary image upload; Resend transactional email; Genius Pay payment gateway for Francophone Africa. Public checkout is server-form + client polish; admin is a separate layout using Tailwind with inline styles, all server components where possible.

**Tech Stack:** Next.js 15, React 19, Prisma 6 + Neon PostgreSQL, Cloudinary 2, Resend 4, Genius Pay REST API, Tailwind CSS 3.4.

---

## File Map

### Bloc 2 — Checkout + Genius Pay
| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/genius-pay.ts` | Genius Pay API client (initiate, verify) |
| Create | `lib/order.ts` | Order ref generator, order creation helper |
| Create | `app/api/checkout/route.ts` | POST: validate cart → create PENDING order → initiate payment |
| Create | `app/api/webhook/genius-pay/route.ts` | POST: verify signature → mark PAID → send invoice → decrement stock → upsert subscriber |
| Create | `app/(site)/checkout/page.tsx` | Client page: cart summary + customer form + Genius Pay redirect |
| Create | `app/(site)/confirmation/page.tsx` | Static success page (ref from query param) |

### Bloc 3 — Admin Produits + Commandes
| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/api/admin/upload/route.ts` | POST multipart → Cloudinary upload → return url + public_id |
| Create | `app/api/admin/produits/route.ts` | GET list, POST create |
| Create | `app/api/admin/produits/[ref]/route.ts` | GET one, PUT update, DELETE |
| Create | `app/api/admin/commandes/route.ts` | GET paginated list with filters |
| Create | `app/api/admin/commandes/[ref]/route.ts` | GET one, PATCH status |
| Create | `components/admin/ImageUpload.tsx` | Client: drag-drop → POST /api/admin/upload → preview |
| Create | `components/admin/ProductForm.tsx` | Client: form for create/edit product with ImageUpload |
| Create | `app/admin/produits/page.tsx` | Server: product list with search |
| Create | `app/admin/produits/nouveau/page.tsx` | Server shell + ProductForm client |
| Create | `app/admin/produits/[ref]/page.tsx` | Server shell + ProductForm client (edit) |
| Create | `app/admin/commandes/page.tsx` | Server: order list, status filter |
| Create | `app/admin/commandes/[ref]/page.tsx` | Server: order detail + status update form |

### Bloc 4 — Stock, Analytiques, Comptabilité
| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/admin/analytiques/page.tsx` | Server: best sellers, revenue by month, top products chart data |
| Create | `app/admin/comptabilite/page.tsx` | Server: accounting entries table, totals |
| Create | `app/api/admin/comptabilite/export/route.ts` | GET → stream CSV of AccountingEntry rows |

### Bloc 5 — Newsletter Admin
| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/admin/newsletter/page.tsx` | Server: subscriber list (active/inactive), send campaign form |
| Create | `app/api/admin/newsletter/send/route.ts` | POST: send broadcast via Resend batch |
| Create | `app/api/newsletter/unsubscribe/route.ts` | GET: token-based unsubscribe |
| Modify | `lib/resend.ts` | Add `sendBroadcast(emails, subject, html)` and `buildUnsubscribeUrl(email)` |
| Modify | `prisma/schema.prisma` | Add `unsubToken String @unique @default(cuid())` to Subscriber |

---

## Task 1 — Genius Pay client + order helper

**Files:**
- Create: `lib/genius-pay.ts`
- Create: `lib/order.ts`

- [ ] **Step 1: Write `lib/order.ts`**

```typescript
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

export function generateOrderRef(): string {
  return `TBT-${nanoid()}`;
}
```

- [ ] **Step 2: Install nanoid**

```bash
npm install nanoid
```

Expected: `nanoid` appears in `package.json` dependencies.

- [ ] **Step 3: Write `lib/genius-pay.ts`**

```typescript
const BASE = "https://api.geniuspay.io/v1"; // adjust if sandbox differs

interface InitiateParams {
  amount: number;       // XOF integer
  currency: "XOF";
  orderRef: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  returnUrl: string;
  webhookUrl: string;
}

interface InitiateResponse {
  paymentUrl: string;
  paymentRef: string;
}

export async function initiatePayment(params: InitiateParams): Promise<InitiateResponse> {
  const res = await fetch(`${BASE}/payments/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GENIUSPAY_SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      order_ref: params.orderRef,
      customer: {
        email: params.customerEmail,
        name: params.customerName,
        phone: params.customerPhone,
      },
      return_url: params.returnUrl,
      webhook_url: params.webhookUrl,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GeniusPay initiate failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return { paymentUrl: data.payment_url, paymentRef: data.payment_ref };
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", process.env.GENIUSPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return expected === signatureHeader;
}
```

- [ ] **Step 4: Add env vars to `.env.local.example`**

Open `.env.local.example`, ensure these lines exist (they should from Bloc 1):
```
GENIUSPAY_SECRET_KEY=
GENIUSPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 5: Commit**

```bash
git add lib/genius-pay.ts lib/order.ts package.json package-lock.json
git commit -m "feat: add Genius Pay client and order ref generator"
```

---

## Task 2 — Checkout API route

**Files:**
- Create: `app/api/checkout/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOrderRef } from "@/lib/order";
import { initiatePayment } from "@/lib/genius-pay";

export async function POST(req: NextRequest) {
  try {
    const { items, customerName, customerEmail, customerPhone } = await req.json();

    if (!items?.length || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    // Fetch products & validate stock
    const refs: string[] = items.map((i: { ref: string }) => i.ref);
    const products = await db.product.findMany({
      where: { ref: { in: refs }, active: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 400 });
    }

    let total = 0;
    const orderItems = items.map((item: { ref: string; qty: number }) => {
      const product = products.find((p) => p.ref === item.ref)!;
      if (product.stock < item.qty) {
        throw new Error(`Stock insuffisant pour ${product.name}`);
      }
      total += product.price * item.qty;
      return {
        qty: item.qty,
        unitPrice: product.price,
        productId: product.id,
      };
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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/checkout/route.ts
git commit -m "feat: checkout API — create order + initiate Genius Pay"
```

---

## Task 3 — Genius Pay webhook

**Files:**
- Create: `app/api/webhook/genius-pay/route.ts`

- [ ] **Step 1: Write the webhook handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/genius-pay";
import { sendInvoice } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-geniuspay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, sig)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "payment.success") {
    return NextResponse.json({ ok: true });
  }

  const orderRef: string = event.order_ref;

  const order = await db.order.findUnique({
    where: { ref: orderRef },
    include: { items: { include: { product: { select: { id: true, name: true, ref: true } } } } },
  });

  if (!order || order.status !== "PENDING") {
    return NextResponse.json({ ok: true });
  }

  // Mark paid + decrement stock + create accounting entry (all in transaction)
  await db.$transaction([
    db.order.update({ where: { ref: orderRef }, data: { status: "PAID" } }),
    ...order.items.map((item) =>
      db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      })
    ),
    db.accountingEntry.create({
      data: {
        amount: order.total,
        type: "SALE",
        ref: `ACC-${orderRef}`,
        orderId: order.id,
      },
    }),
  ]);

  // Upsert subscriber (CHECKOUT source, silently)
  await db.subscriber
    .upsert({
      where: { email: order.customerEmail },
      update: {},
      create: { email: order.customerEmail, source: "CHECKOUT" },
    })
    .catch(console.error);

  // Send invoice email — interface: InvoiceData from lib/resend.ts
  await sendInvoice({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    orderRef,
    orderDate: order.createdAt.toLocaleDateString("fr-FR"),
    items: order.items.map((i) => ({
      name: i.product.name,
      ref: i.product.ref,
      qty: i.qty,
      unitPrice: i.unitPrice,
    })),
    total: order.total,
  }).catch(console.error);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/webhook/genius-pay/route.ts
git commit -m "feat: Genius Pay webhook — mark paid, decrement stock, invoice email"
```

---

## Task 4 — Checkout page (client)

**Files:**
- Create: `app/(site)/checkout/page.tsx`
- Create: `app/(site)/confirmation/page.tsx`

- [ ] **Step 1: Write the checkout page**

```typescript
"use client";

import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { products } from "@/lib/products";

function fmt(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

export default function CheckoutPage() {
  const { cart, totalCount } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cartItems = Array.from(cart.entries())
    .filter(([, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId)!;
      return { ref: product.ref, qty, name: product.name, price: product.price };
    });

  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(({ ref, qty }) => ({ ref, qty })),
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur.");
      window.location.href = data.paymentUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur serveur.");
      setLoading(false);
    }
  }

  if (totalCount === 0) {
    return (
      <main style={{ padding: "120px 48px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 24, opacity: 0.5, textAlign: "center" }}>
        Votre panier est vide.
      </main>
    );
  }

  return (
    <main style={{ padding: "100px 48px 80px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.4, marginBottom: 12 }}>
        Commande
      </div>
      <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1, marginBottom: 48 }}>
        Finaliser ma commande
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 48 }}>
        {/* Customer form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { field: "name", label: "Nom complet", type: "text", placeholder: "Aminata Diallo" },
            { field: "email", label: "Email", type: "email", placeholder: "aminata@exemple.com" },
            { field: "phone", label: "Téléphone (Mobile Money)", type: "tel", placeholder: "+225 07 00 00 00 00" },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.55 }}>
                {label}
              </label>
              <input
                type={type}
                required
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                style={{ background: "transparent", border: "1px solid rgba(245,242,236,0.18)", padding: "12px 16px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 17, color: "inherit", outline: "none", width: "100%" }}
              />
            </div>
          ))}

          {error && (
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(245,100,100,0.9)", letterSpacing: "0.1em" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, padding: "16px 32px", background: loading ? "rgba(245,242,236,0.08)" : "var(--fg)", color: "var(--bg)", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", border: "none", cursor: loading ? "default" : "pointer", transition: "opacity 0.2s", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "Redirection..." : "Payer avec Genius Pay"}
          </button>
        </form>

        {/* Order summary */}
        <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: "28px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 20 }}>
            Récapitulatif
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cartItems.map((item) => (
              <div key={item.ref} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{item.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4, marginTop: 2 }}>× {item.qty}</div>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11 }}>{fmt(item.price * item.qty)}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(245,242,236,0.10)", marginTop: 20, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.45 }}>Total</div>
            <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 28 }}>{fmt(total)}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Write the confirmation page**

```typescript
export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  return (
    <main style={{ padding: "120px 48px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.4, marginBottom: 12 }}>
        Confirmation
      </div>
      <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 56, lineHeight: 1, marginBottom: 24 }}>
        Merci.
      </h1>
      <p style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 20, opacity: 0.65, lineHeight: 1.6, marginBottom: 32 }}>
        Votre commande a bien été reçue. Un email de confirmation vous a été envoyé avec votre facture.
      </p>
      {searchParams.ref && (
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.4 }}>
          Réf. {searchParams.ref}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Wire CartDrawer checkout button to /checkout**

Open `components/CartDrawer.tsx`. Replace the `onClick={() => alert("Genius Pay — Bloc 2")}` button with:

```typescript
import { useRouter } from "next/navigation";
// inside component:
const router = useRouter();
// button:
<button onClick={() => { closeDrawer(); router.push("/checkout"); }} ...>
  Passer la commande
</button>
```

- [ ] **Step 4: Commit**

```bash
git add app/\(site\)/checkout/page.tsx app/\(site\)/confirmation/page.tsx components/CartDrawer.tsx
git commit -m "feat: checkout page, confirmation page, wire cart drawer"
```

---

## Task 5 — Admin image upload API

**Files:**
- Create: `app/api/admin/upload/route.ts`

- [ ] **Step 1: Write upload route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "tossbytoss/products", resource_type: "image" }, (err, res) => {
            if (err || !res) reject(err ?? new Error("Upload failed"));
            else resolve(res as { secure_url: string; public_id: string });
          })
          .end(buffer);
      }
    );

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Erreur upload." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/upload/route.ts
git commit -m "feat: Cloudinary upload API for admin"
```

---

## Task 6 — Products API (admin)

**Files:**
- Create: `app/api/admin/produits/route.ts`
- Create: `app/api/admin/produits/[ref]/route.ts`

- [ ] **Step 1: Write list + create route**

```typescript
// app/api/admin/produits/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, ref, category, price, stock, imageUrl, imagePos } = data;

  if (!name || !ref || !price) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  const product = await db.product.create({
    data: { name, ref, category: category ?? "", price: Number(price), stock: Number(stock ?? 0), imageUrl: imageUrl ?? "", imagePos: imagePos ?? "center" },
  });

  return NextResponse.json(product, { status: 201 });
}
```

- [ ] **Step 2: Write single-product route (get, update, delete)**

```typescript
// app/api/admin/produits/[ref]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { ref: string } }) {
  const product = await db.product.findUnique({ where: { ref: params.ref } });
  if (!product) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { ref: string } }) {
  const data = await req.json();
  const product = await db.product.update({
    where: { ref: params.ref },
    data: {
      name: data.name,
      category: data.category,
      price: Number(data.price),
      stock: Number(data.stock),
      imageUrl: data.imageUrl,
      imagePos: data.imagePos,
      active: data.active,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(_: NextRequest, { params }: { params: { ref: string } }) {
  await db.product.update({ where: { ref: params.ref }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/produits/route.ts app/api/admin/produits/\[ref\]/route.ts
git commit -m "feat: admin products API (list, create, update, delete)"
```

---

## Task 7 — Orders API (admin)

**Files:**
- Create: `app/api/admin/commandes/route.ts`
- Create: `app/api/admin/commandes/[ref]/route.ts`

- [ ] **Step 1: Write orders list route**

```typescript
// app/api/admin/commandes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const take = 20;

  const where = status ? { status: status as "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" } : {};

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      take,
      skip: (page - 1) * take,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { name: true, ref: true } } } } },
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, pages: Math.ceil(total / take) });
}
```

- [ ] **Step 2: Write single-order route**

```typescript
// app/api/admin/commandes/[ref]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { ref: string } }) {
  const order = await db.order.findUnique({
    where: { ref: params.ref },
    include: { items: { include: { product: { select: { name: true, ref: true } } } } },
  });
  if (!order) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: { ref: string } }) {
  const { status } = await req.json();
  const order = await db.order.update({
    where: { ref: params.ref },
    data: { status },
  });
  return NextResponse.json(order);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/commandes/route.ts app/api/admin/commandes/\[ref\]/route.ts
git commit -m "feat: admin orders API (list, detail, status update)"
```

---

## Task 8 — Admin Produits UI

**Files:**
- Create: `components/admin/ImageUpload.tsx`
- Create: `components/admin/ProductForm.tsx`
- Create: `app/admin/produits/page.tsx`
- Create: `app/admin/produits/nouveau/page.tsx`
- Create: `app/admin/produits/[ref]/page.tsx`

- [ ] **Step 1: Write `ImageUpload.tsx`**

```typescript
"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) onChange(data.url);
    setUploading(false);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      style={{ border: "1px dashed rgba(245,242,236,0.2)", padding: 24, cursor: "pointer", textAlign: "center", position: "relative", minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {uploading && <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.5 }}>Envoi en cours...</span>}
      {!uploading && value && <Image src={value} alt="preview" fill style={{ objectFit: "contain" }} />}
      {!uploading && !value && <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4 }}>Glisser une image ou cliquer</span>}
    </div>
  );
}
```

- [ ] **Step 2: Write `ProductForm.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";

interface ProductData {
  name: string;
  ref: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  imagePos: string;
  active: boolean;
}

interface Props {
  initial?: Partial<ProductData> & { ref?: string };
  isEdit?: boolean;
}

const INPUT_STYLE = { background: "transparent", border: "1px solid rgba(245,242,236,0.18)", padding: "10px 14px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 17, color: "inherit", outline: "none", width: "100%" };
const LABEL_STYLE = { fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase" as const, opacity: 0.55 };

export function ProductForm({ initial, isEdit }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductData>({
    name: initial?.name ?? "",
    ref: initial?.ref ?? "",
    category: initial?.category ?? "",
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    imageUrl: initial?.imageUrl ?? "",
    imagePos: initial?.imagePos ?? "center",
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/admin/produits/${initial?.ref}` : "/api/admin/produits";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      router.push("/admin/produits");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur.");
      setSaving(false);
    }
  }

  const field = (key: keyof ProductData, label: string, type = "text") => (
    <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={LABEL_STYLE}>{label}</label>
      <input
        type={type}
        value={String(form[key])}
        onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
        style={INPUT_STYLE}
        disabled={isEdit && key === "ref"}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>
      {field("name", "Nom du produit")}
      {field("ref", "Référence (SKU)")}
      {field("category", "Catégorie")}
      {field("price", "Prix (XOF)", "number")}
      {field("stock", "Stock", "number")}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={LABEL_STYLE}>Image</label>
        <ImageUpload value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
      </div>

      {field("imagePos", "Position image (center, top, bottom...)")}

      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
        <span style={LABEL_STYLE}>Actif (visible en boutique)</span>
      </label>

      {error && <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(245,100,100,0.9)" }}>{error}</div>}

      <button type="submit" disabled={saving} style={{ padding: "14px 28px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1, alignSelf: "flex-start" }}>
        {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le produit"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write `app/admin/produits/page.tsx`**

```typescript
import { db } from "@/lib/db";
import Link from "next/link";

function fmt(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

export default async function AdminProduitsPage() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 02 — Catalogue</div>
          <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Produits</h1>
        </div>
        <Link href="/admin/produits/nouveau" style={{ padding: "12px 24px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", textDecoration: "none" }}>
          + Nouveau
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
            {["Réf.", "Nom", "Prix", "Stock", "Statut", ""].map((h) => (
              <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.ref} style={{ borderBottom: "1px solid rgba(245,242,236,0.06)" }}>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.6 }}>{p.ref}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{p.name}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10 }}>{fmt(p.price)}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 14, color: p.stock === 0 ? "rgba(245,100,100,0.9)" : p.stock <= 5 ? "rgba(245,190,60,0.9)" : "inherit" }}>{p.stock}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", opacity: p.active ? 0.7 : 0.3 }}>{p.active ? "Actif" : "Inactif"}</td>
              <td style={{ padding: "14px 20px" }}>
                <Link href={`/admin/produits/${p.ref}`} style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none" }}>
                  Modifier →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
```

- [ ] **Step 4: Write `nouveau/page.tsx` and `[ref]/page.tsx`**

```typescript
// app/admin/produits/nouveau/page.tsx
import { ProductForm } from "@/components/admin/ProductForm";

export default function NouveauProduitPage() {
  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 02 — Catalogue</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Nouveau produit</h1>
      </div>
      <ProductForm />
    </>
  );
}
```

```typescript
// app/admin/produits/[ref]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProduitPage({ params }: { params: { ref: string } }) {
  const product = await db.product.findUnique({ where: { ref: params.ref } });
  if (!product) notFound();

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 02 — Catalogue</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>{product.name}</h1>
      </div>
      <ProductForm initial={product} isEdit />
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/admin/ImageUpload.tsx components/admin/ProductForm.tsx app/admin/produits/
git commit -m "feat: admin products UI (list, create, edit)"
```

---

## Task 9 — Admin Commandes UI

**Files:**
- Create: `app/admin/commandes/page.tsx`
- Create: `app/admin/commandes/[ref]/page.tsx`

- [ ] **Step 1: Write orders list page**

```typescript
// app/admin/commandes/page.tsx
import { db } from "@/lib/db";
import Link from "next/link";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "En attente",  color: "rgba(245,190,60,0.9)" },
  PAID:      { label: "Payée",       color: "rgba(100,190,100,0.9)" },
  SHIPPED:   { label: "Expédiée",    color: "rgba(100,160,245,0.9)" },
  DELIVERED: { label: "Livrée",      color: "rgba(150,245,150,0.9)" },
  CANCELLED: { label: "Annulée",     color: "rgba(245,100,100,0.7)" },
};

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const page = Number(searchParams.page ?? 1);
  const take = 20;
  const where = searchParams.status ? { status: searchParams.status as "PENDING" } : {};

  const [orders, total] = await Promise.all([
    db.order.findMany({ where, take, skip: (page - 1) * take, orderBy: { createdAt: "desc" }, select: { ref: true, customerName: true, total: true, status: true, createdAt: true } }),
    db.order.count({ where }),
  ]);

  const pages = Math.ceil(total / take);

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 03 — Commandes</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Commandes</h1>
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        {[undefined, "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
          <Link key={s ?? "all"} href={s ? `/admin/commandes?status=${s}` : "/admin/commandes"}
            style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 14px", border: "1px solid rgba(245,242,236,0.15)", textDecoration: "none", opacity: searchParams.status === s || (!searchParams.status && !s) ? 1 : 0.4 }}>
            {s ? STATUS_LABELS[s].label : "Toutes"}
          </Link>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
            {["Réf.", "Client", "Montant", "Statut", "Date", ""].map((h) => (
              <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const s = STATUS_LABELS[o.status] ?? { label: o.status, color: "white" };
            return (
              <tr key={o.ref} style={{ borderBottom: "1px solid rgba(245,242,236,0.06)" }}>
                <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.6 }}>{o.ref}</td>
                <td style={{ padding: "14px 20px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{o.customerName}</td>
                <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10 }}>{fmt(o.total)}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: s.color }}>{s.label}</span>
                </td>
                <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4 }}>{o.createdAt.toLocaleDateString("fr-FR")}</td>
                <td style={{ padding: "14px 20px" }}>
                  <Link href={`/admin/commandes/${o.ref}`} style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none" }}>
                    Voir →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {pages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/admin/commandes?page=${p}${searchParams.status ? `&status=${searchParams.status}` : ""}`}
              style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, padding: "6px 12px", border: "1px solid rgba(245,242,236,0.15)", textDecoration: "none", opacity: p === page ? 1 : 0.4 }}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Write order detail page with status update**

```typescript
// app/admin/commandes/[ref]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusForm } from "@/components/admin/StatusForm";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

export default async function CommandeDetailPage({ params }: { params: { ref: string } }) {
  const order = await db.order.findUnique({
    where: { ref: params.ref },
    include: { items: { include: { product: { select: { name: true, ref: true } } } } },
  });
  if (!order) notFound();

  return (
    <>
      <div style={{ marginBottom: 40, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 03 — Commandes</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>{order.ref}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 16 }}>Articles</div>
          {order.items.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(245,242,236,0.07)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{item.product.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4, marginTop: 2 }}>× {item.qty} · {fmt(item.unitPrice)} / unité</div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11 }}>{fmt(item.unitPrice * item.qty)}</div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16 }}>
            <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 28 }}>{fmt(order.total)}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: 24 }}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>Client</div>
            <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 18 }}>{order.customerName}</div>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.5, marginTop: 6 }}>{order.customerEmail}</div>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.5, marginTop: 4 }}>{order.customerPhone}</div>
          </div>

          <StatusForm orderRef={order.ref} currentStatus={order.status} />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Write `StatusForm` client component**

```typescript
// components/admin/StatusForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "PENDING",   label: "En attente" },
  { value: "PAID",      label: "Payée" },
  { value: "SHIPPED",   label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

export function StatusForm({ orderRef, currentStatus }: { orderRef: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/commandes/${orderRef}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setSaving(false);
  }

  return (
    <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: 24 }}>
      <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>Statut</div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}
        style={{ width: "100%", background: "transparent", border: "1px solid rgba(245,242,236,0.18)", padding: "10px 14px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "inherit", marginBottom: 14 }}>
        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <button onClick={handleSave} disabled={saving || status === currentStatus}
        style={{ width: "100%", padding: "10px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: saving || status === currentStatus ? 0.4 : 1 }}>
        {saving ? "Enregistrement..." : "Mettre à jour"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/commandes/ components/admin/StatusForm.tsx
git commit -m "feat: admin orders UI (list, detail, status update)"
```

---

## Task 10 — Analytiques admin page

**Files:**
- Create: `app/admin/analytiques/page.tsx`

- [ ] **Step 1: Write the analytics page**

```typescript
import { db } from "@/lib/db";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

export default async function AnalytiquesPage() {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 1), label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) };
  });

  const [bestSellers, revenueByMonth] = await Promise.all([
    db.orderItem.groupBy({
      by: ["productId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 8,
    }),
    Promise.all(
      months.map((m) =>
        db.accountingEntry.aggregate({
          _sum: { amount: true },
          where: { createdAt: { gte: m.start, lt: m.end }, type: "SALE" },
        }).then((r) => ({ label: m.label, amount: r._sum.amount ?? 0 }))
      )
    ),
  ]);

  const productIds = bestSellers.map((b) => b.productId);
  const products = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, ref: true, price: true } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.amount), 1);

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 04 — Analytiques</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Analytiques</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Revenue chart */}
        <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: 28 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 24 }}>Revenus 6 derniers mois</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
            {revenueByMonth.map((m) => (
              <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", background: "rgba(245,242,236,0.15)", height: Math.max(4, (m.amount / maxRevenue) * 140) }} />
                <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 8, letterSpacing: "0.1em", opacity: 0.4, textTransform: "uppercase" }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Best sellers */}
        <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: 28 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 20 }}>Meilleures ventes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bestSellers.map((b, i) => {
              const p = productMap.get(b.productId);
              if (!p) return null;
              return (
                <div key={b.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(245,242,236,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, opacity: 0.25, minWidth: 20 }}>0{i + 1}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{p.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 8, opacity: 0.35, marginTop: 2, letterSpacing: "0.15em" }}>{p.ref}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 12, opacity: 0.8 }}>{b._sum.qty ?? 0} vendus</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/analytiques/page.tsx
git commit -m "feat: admin analytics — revenue chart + best sellers"
```

---

## Task 11 — Comptabilité admin + CSV export

**Files:**
- Create: `app/admin/comptabilite/page.tsx`
- Create: `app/api/admin/comptabilite/export/route.ts`

- [ ] **Step 1: Write the accounting page**

```typescript
// app/admin/comptabilite/page.tsx
import { db } from "@/lib/db";
import Link from "next/link";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

export default async function ComptabilitePage() {
  const entries = await db.accountingEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { order: { select: { customerName: true } } },
  });

  const totalSales = entries.filter((e) => e.type === "SALE").reduce((s, e) => s + e.amount, 0);
  const totalRefunds = entries.filter((e) => e.type === "REFUND").reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 05 — Comptabilité</div>
          <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Comptabilité</h1>
        </div>
        <a href="/api/admin/comptabilite/export" download="comptabilite.csv"
          style={{ padding: "12px 24px", border: "1px solid rgba(245,242,236,0.2)", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", opacity: 0.7 }}>
          Exporter CSV
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
        {[
          { label: "Total ventes", value: fmt(totalSales) },
          { label: "Total remboursements", value: fmt(totalRefunds) },
          { label: "Net", value: fmt(totalSales - totalRefunds) },
        ].map(({ label, value }) => (
          <div key={label} style={{ border: "1px solid rgba(245,242,236,0.10)", padding: "24px 28px" }}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 28 }}>{value}</div>
          </div>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
            {["Réf.", "Type", "Montant", "Client", "Date"].map((h) => (
              <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} style={{ borderBottom: "1px solid rgba(245,242,236,0.06)" }}>
              <td style={{ padding: "12px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.6 }}>{e.ref}</td>
              <td style={{ padding: "12px 20px" }}>
                <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: e.type === "SALE" ? "rgba(100,190,100,0.9)" : "rgba(245,100,100,0.7)" }}>{e.type === "SALE" ? "Vente" : "Remboursement"}</span>
              </td>
              <td style={{ padding: "12px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11 }}>{fmt(e.amount)}</td>
              <td style={{ padding: "12px 20px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 16 }}>{e.order?.customerName ?? "—"}</td>
              <td style={{ padding: "12px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4 }}>{e.createdAt.toLocaleDateString("fr-FR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
```

- [ ] **Step 2: Write the CSV export route**

```typescript
// app/api/admin/comptabilite/export/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const entries = await db.accountingEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { select: { customerName: true, customerEmail: true, ref: true } } },
  });

  const header = "Référence,Type,Montant (XOF),Commande,Client,Email,Date\n";
  const rows = entries
    .map((e) =>
      [
        e.ref,
        e.type,
        e.amount,
        e.order?.ref ?? "",
        `"${e.order?.customerName ?? ""}"`,
        e.order?.customerEmail ?? "",
        e.createdAt.toISOString().split("T")[0],
      ].join(",")
    )
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="comptabilite-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/comptabilite/page.tsx app/api/admin/comptabilite/export/route.ts
git commit -m "feat: admin accounting page + CSV export"
```

---

## Task 12 — Unsubscribe token (schema migration)

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `unsubToken` to Subscriber model**

Open `prisma/schema.prisma`. Find the `Subscriber` model. Add:

```prisma
model Subscriber {
  id           String            @id @default(cuid())
  email        String            @unique
  source       SubscriberSource
  active       Boolean           @default(true)
  unsubToken   String            @unique @default(cuid())
  createdAt    DateTime          @default(now())
}
```

- [ ] **Step 2: Generate and run migration**

```bash
npx prisma migrate dev --name add-subscriber-unsub-token
```

Expected: Migration created and applied, `unsubToken` column exists.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add unsubToken to Subscriber for safe unsubscribe"
```

---

## Task 13 — Newsletter admin + send + unsubscribe

**Files:**
- Modify: `lib/resend.ts`
- Create: `app/admin/newsletter/page.tsx`
- Create: `app/api/admin/newsletter/send/route.ts`
- Create: `app/api/newsletter/unsubscribe/route.ts`

- [ ] **Step 1: Add helpers to `lib/resend.ts`**

Append to the bottom of `lib/resend.ts`:

```typescript
export function buildUnsubscribeUrl(token: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${token}`;
}

export async function sendBroadcast(
  subscribers: { email: string; unsubToken: string }[],
  subject: string,
  htmlTemplate: string
): Promise<void> {
  // Resend supports up to 100 emails per batch call
  const chunks: typeof subscribers[] = [];
  for (let i = 0; i < subscribers.length; i += 100) {
    chunks.push(subscribers.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    const emails = chunk.map((sub) => ({
      from: "Toss by Toss <lettre@tossbytoss.ci>",
      to: sub.email,
      subject,
      html: htmlTemplate.replace("{{UNSUB_URL}}", buildUnsubscribeUrl(sub.unsubToken)),
    }));

    await resend.batch.send(emails);
  }
}
```

- [ ] **Step 2: Write the newsletter admin page**

```typescript
// app/admin/newsletter/page.tsx
import { db } from "@/lib/db";
import { NewsletterSendForm } from "@/components/admin/NewsletterSendForm";

export default async function NewsletterPage() {
  const [activeCount, recentSubscribers] = await Promise.all([
    db.subscriber.count({ where: { active: true } }),
    db.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { email: true, source: true, active: true, createdAt: true } }),
  ]);

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 06 — Newsletter</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Newsletter</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 16 }}>
            {activeCount} abonné{activeCount > 1 ? "s" : ""} actif{activeCount > 1 ? "s" : ""}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
                {["Email", "Source", "Statut", "Date"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSubscribers.map((s) => (
                <tr key={s.email} style={{ borderBottom: "1px solid rgba(245,242,236,0.06)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 16 }}>{s.email}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5 }}>{s.source}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: s.active ? 0.7 : 0.3 }}>{s.active ? "Actif" : "Désabonné"}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4 }}>{s.createdAt.toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <NewsletterSendForm />
      </div>
    </>
  );
}
```

- [ ] **Step 3: Write `NewsletterSendForm` client component**

```typescript
// components/admin/NewsletterSendForm.tsx
"use client";

import { useState } from "react";

export function NewsletterSendForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; count?: number; error?: string } | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    const res = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setResult(data);
    setSending(false);
  }

  const INPUT_STYLE = { background: "transparent", border: "1px solid rgba(245,242,236,0.18)", padding: "10px 14px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 17, color: "inherit", outline: "none", width: "100%" };
  const LABEL_STYLE = { fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase" as const, opacity: 0.55 };

  return (
    <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: 28 }}>
      <div style={{ ...LABEL_STYLE, marginBottom: 20 }}>Envoyer une campagne</div>
      <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={LABEL_STYLE}>Objet</label>
          <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} style={INPUT_STYLE} placeholder="Nouvelle collection..." />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={LABEL_STYLE}>Corps (HTML autorisé)</label>
          <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={8}
            style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 13 }}
            placeholder="<p>Bonjour,</p>..." />
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4, letterSpacing: "0.12em" }}>
          Utilisez {"{{UNSUB_URL}}"} pour le lien de désabonnement.
        </div>
        {result?.ok && <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(100,190,100,0.9)" }}>{result.count} email{(result.count ?? 0) > 1 ? "s" : ""} envoyé{(result.count ?? 0) > 1 ? "s" : ""}.</div>}
        {result?.error && <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(245,100,100,0.9)" }}>{result.error}</div>}
        <button type="submit" disabled={sending}
          style={{ padding: "12px 24px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: sending ? 0.5 : 1 }}>
          {sending ? "Envoi..." : "Envoyer à tous les abonnés"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Write the send API route**

```typescript
// app/api/admin/newsletter/send/route.ts
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
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #f5f2ec; background: #0a0a0a; padding: 48px;">
        ${body}
        <hr style="margin: 40px 0; border: none; border-top: 1px solid rgba(245,242,236,0.1);" />
        <p style="font-family: 'Courier New', monospace; font-size: 10px; opacity: 0.4; letter-spacing: 0.1em;">
          Vous recevez cet email car vous êtes abonné(e) à la newsletter Toss by Toss.<br/>
          <a href="{{UNSUB_URL}}" style="color: rgba(245,242,236,0.5);">Se désabonner</a>
        </p>
      </div>`;

    await sendBroadcast(subscribers, subject, html);

    return NextResponse.json({ ok: true, count: subscribers.length });
  } catch (err) {
    console.error("[newsletter/send]", err);
    return NextResponse.json({ error: "Erreur envoi." }, { status: 500 });
  }
}
```

- [ ] **Step 5: Write the unsubscribe endpoint**

```typescript
// app/api/newsletter/unsubscribe/route.ts
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
    `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Désabonnement</title></head><body style="font-family:Georgia,serif;background:#0a0a0a;color:#f5f2ec;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;"><div><h1 style="font-style:italic;font-weight:300;font-size:48px;margin-bottom:16px;">Désinscription confirmée.</h1><p style="opacity:0.5;font-size:18px;">Vous ne recevrez plus d'emails de notre part.</p></div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
```

- [ ] **Step 6: Update admin layout nav to include all sections**

Open `app/admin/layout.tsx`. The nav links array should be:

```typescript
const navLinks = [
  { href: "/admin",            label: "Dashboard",      num: "01" },
  { href: "/admin/produits",   label: "Produits",        num: "02" },
  { href: "/admin/commandes",  label: "Commandes",       num: "03" },
  { href: "/admin/analytiques",label: "Analytiques",     num: "04" },
  { href: "/admin/comptabilite",label: "Comptabilité",   num: "05" },
  { href: "/admin/newsletter", label: "Newsletter",      num: "06" },
];
```

- [ ] **Step 7: Commit**

```bash
git add lib/resend.ts app/admin/newsletter/ app/api/admin/newsletter/ app/api/newsletter/unsubscribe/ components/admin/NewsletterSendForm.tsx app/admin/layout.tsx
git commit -m "feat: newsletter admin — send campaign, subscriber list, unsubscribe endpoint"
```

---

## Setup Instructions (before any task)

1. Copy `.env.local.example` to `.env.local` and fill in all values:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `RESEND_API_KEY`
   - `GENIUSPAY_SECRET_KEY`, `GENIUSPAY_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (dev) / `https://tossbytoss.ci` (prod)

2. Move static assets into Next.js public folder if not already done:
   ```bash
   mv assets/ public/assets/
   mv uploads/ public/uploads/  # if it exists
   ```

3. Run initial Prisma migration:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

---

## Genius Pay API Note

The Genius Pay API endpoints (`BASE_URL`, exact field names, webhook signature header) in `lib/genius-pay.ts` use assumed conventions. Before running Task 2+, check the official Genius Pay developer documentation and update:
- `BASE` URL in `lib/genius-pay.ts`
- Field names in the initiate request body (`order_ref`, `payment_url`, `payment_ref`)
- Webhook signature header name (`x-geniuspay-signature`)
- Webhook event name (`payment.success`)
