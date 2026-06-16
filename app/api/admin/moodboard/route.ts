import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.galleryItem.findMany({
    orderBy: [{ section: "asc" }, { position: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, name, note, section, aspect, position } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "Image requise." }, { status: 400 });

    const item = await db.galleryItem.create({
      data: { imageUrl, name: name ?? "", note: note ?? "", section: section ?? "CLIENTS", aspect: aspect ?? "SQUARE", position: position ?? 0 },
    });
    return NextResponse.json(item);
  } catch (err) {
    console.error("[moodboard POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requis." }, { status: 400 });
    await db.galleryItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[moodboard DELETE]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requis." }, { status: 400 });
    const item = await db.galleryItem.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (err) {
    console.error("[moodboard PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
