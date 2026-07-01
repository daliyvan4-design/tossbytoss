import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULTS = {
  id:       "main",
  active:   false,
  badge:    "Édition Fête",
  title:    "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "Découvrir la collection",
  ctaUrl:   "/marketplace",
};

export async function GET() {
  const popup = await db.popup.findUnique({ where: { id: "main" } });
  return NextResponse.json(popup ?? DEFAULTS);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const popup = await db.popup.upsert({
    where:  { id: "main" },
    create: { ...DEFAULTS, ...data, id: "main" },
    update: data,
  });
  return NextResponse.json(popup);
}
