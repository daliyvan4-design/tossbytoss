import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const entries = await db.accountingEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { customerName: true, customerEmail: true, ref: true } },
    },
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
