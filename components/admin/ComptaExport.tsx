"use client";

import { useState } from "react";

interface Entry {
  ref: string;
  type: string;
  amount: number;
  orderRef: string;
  customerName: string;
  customerEmail: string;
  date: string;
}

const FONT = "var(--font-montserrat, sans-serif)";

const BTN = {
  padding: "12px 24px",
  border: "1px solid rgba(17,17,17,0.2)",
  fontFamily: FONT,
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase" as const,
  textDecoration: "none",
  color: "#111111",
  background: "transparent",
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
};

// Les polices PDF standard ne gèrent pas l'espace insécable fine (U+202F) du
// format fr-FR : elle se rendait en "/". On la remplace par une espace normale.
function fmtXOF(n: number) {
  return n.toLocaleString("fr-FR").replace(/[  ]/g, " ") + " XOF";
}

export function ComptaExport() {
  const [busy, setBusy] = useState(false);

  async function handlePdf() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/comptabilite/export?format=json");
      const rows: Entry[] = await res.json();

      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const today = new Date();
      const dateStr = today.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

      const totalSales = rows.filter((r) => r.type === "SALE").reduce((s, r) => s + r.amount, 0);
      const totalRefunds = rows.filter((r) => r.type === "REFUND").reduce((s, r) => s + r.amount, 0);
      const net = totalSales - totalRefunds;

      // ── Bandeau de marque ──
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, W, 92, "F");
      doc.setTextColor(245, 242, 236);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("TOSS BY TOSS", 48, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(180, 176, 168);
      doc.text("L'art du cuir, fait à Abidjan", 48, 60);
      doc.setFontSize(8);
      doc.text("RELEVÉ COMPTABLE", W - 48, 42, { align: "right" });
      doc.text(dateStr, W - 48, 60, { align: "right" });

      // ── Cartouches de synthèse ──
      const cards = [
        { label: "Total ventes", value: fmtXOF(totalSales) },
        { label: "Remboursements", value: fmtXOF(totalRefunds) },
        { label: "Net", value: fmtXOF(net) },
      ];
      const cardW = (W - 96 - 24) / 3;
      cards.forEach((c, i) => {
        const x = 48 + i * (cardW + 12);
        doc.setDrawColor(220, 218, 214);
        doc.setLineWidth(0.8);
        doc.rect(x, 120, cardW, 58);
        doc.setTextColor(130, 128, 124);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(c.label.toUpperCase(), x + 12, 140);
        doc.setTextColor(17, 17, 17);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(c.value, x + 12, 162);
      });

      // ── Tableau des écritures ──
      autoTable(doc, {
        startY: 200,
        head: [["Référence", "Type", "Montant", "Commande", "Client", "Date"]],
        body: rows.map((r) => [
          r.ref,
          r.type === "SALE" ? "Vente" : "Remboursement",
          fmtXOF(r.amount),
          r.orderRef || "—",
          r.customerName || "—",
          r.date,
        ]),
        theme: "grid",
        styles: { font: "helvetica", fontSize: 8, cellPadding: 6, textColor: [40, 40, 40], lineColor: [228, 226, 222], lineWidth: 0.5 },
        headStyles: { fillColor: [17, 17, 17], textColor: [245, 242, 236], fontStyle: "bold", fontSize: 7.5 },
        alternateRowStyles: { fillColor: [249, 249, 247] },
        margin: { left: 48, right: 48, bottom: 56 },
      });

      // ── Pied de page ──
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        const H = doc.internal.pageSize.getHeight();
        doc.setDrawColor(228, 226, 222);
        doc.setLineWidth(0.5);
        doc.line(48, H - 44, W - 48, H - 44);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(140, 138, 134);
        doc.text(`${rows.length} écriture(s) — Abidjan, Côte d'Ivoire`, 48, H - 28);
        doc.text(`Page ${i} / ${pages}`, W - 48, H - 28, { align: "right" });
      }

      doc.save(`comptabilite-${today.toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("[export-pdf]", err);
      alert("Erreur lors de la génération du PDF.");
    }
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <a href="/api/admin/comptabilite/export" download style={{ ...BTN, opacity: 0.7 }}>
        Exporter CSV
      </a>
      <button
        onClick={handlePdf}
        disabled={busy}
        style={{
          ...BTN,
          background: "#111111",
          color: "#ffffff",
          border: "1px solid #111111",
          opacity: busy ? 0.5 : 1,
        }}
      >
        {busy ? "Génération…" : "Exporter PDF"}
      </button>
    </div>
  );
}
