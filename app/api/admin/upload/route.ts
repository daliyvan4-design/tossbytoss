import { NextRequest, NextResponse } from "next/server";
import { uploadProductImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadProductImage(buffer, `upload-${Date.now()}`);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Erreur upload." }, { status: 500 });
  }
}
