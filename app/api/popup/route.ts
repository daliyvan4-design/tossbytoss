import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 60;

export async function GET() {
  try {
    const popup = await db.popup.findUnique({ where: { id: "main" } });
    return NextResponse.json(popup ?? { active: false });
  } catch {
    return NextResponse.json({ active: false });
  }
}
