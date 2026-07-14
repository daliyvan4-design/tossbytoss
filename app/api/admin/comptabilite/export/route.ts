import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const format = new URL(req.url).searchParams.get("format");

  const entries = await db.accountingEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { customerName: true, customerEmail: true, ref: true } },
    },
  });

  // Format JSON — consommé par l'export PDF côté client
  if (format === "json") {
    return NextResponse.json(
      entries.map((e) => ({
        ref: e.ref,
        type: e.type,
        amount: e.amount,
        orderRef: e.order?.ref ?? "",
        customerName: e.order?.customerName ?? "",
        customerEmail: e.order?.customerEmail ?? "",
        date: e.createdAt.toISOString().split("T")[0],
      }))
    );
  }

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
