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

const INPUT_STYLE = {
  background: "transparent",
  border: "1px solid rgba(245,242,236,0.18)",
  padding: "10px 14px",
  fontFamily: "var(--font-cormorant, Georgia, serif)",
  fontSize: 17,
  color: "inherit",
  outline: "none",
  width: "100%",
};

const LABEL_STYLE = {
  fontFamily: "var(--font-jetbrains, monospace)",
  fontSize: 9,
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  opacity: 0.55,
};

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
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
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
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [key]: type === "number" ? Number(e.target.value) : e.target.value,
          }))
        }
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
        <ImageUpload
          value={form.imageUrl}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
        />
      </div>

      {field("imagePos", "Position image (center, top, bottom…)")}

      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
        />
        <span style={LABEL_STYLE}>Actif (visible en boutique)</span>
      </label>

      {error && (
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(245,100,100,0.9)" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{ padding: "14px 28px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1, alignSelf: "flex-start" }}
      >
        {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le produit"}
      </button>
    </form>
  );
}
