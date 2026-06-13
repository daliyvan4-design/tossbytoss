"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";

interface ProductData {
  name: string;
  ref: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  imagePos: string;
  texKey: string;
  description: string;
  details: string;
  colors: string;
  sizes: string;
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

const TEX_OPTIONS = [
  "leather-black", "leather-cognac", "leather-dark-brown",
  "leather-navy", "leather-burgundy", "leather-natural",
];

export function ProductForm({ initial, isEdit }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductData>({
    name: initial?.name ?? "",
    ref: initial?.ref ?? "",
    slug: initial?.slug ?? "",
    category: initial?.category ?? "",
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    imageUrl: initial?.imageUrl ?? "",
    imagePos: initial?.imagePos ?? "center",
    texKey: initial?.texKey ?? "leather-black",
    description: initial?.description ?? "",
    details: initial?.details ?? "",
    colors: initial?.colors ?? "[]",
    sizes: initial?.sizes ?? "",
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function slugify(name: string) {
    return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    let colorsJson: unknown[];
    try {
      colorsJson = JSON.parse(form.colors || "[]");
    } catch {
      setError("Couleurs : JSON invalide. Vérifiez le format.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      ref: form.ref,
      slug: form.slug || slugify(form.name),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl,
      imagePos: form.imagePos,
      texKey: form.texKey,
      description: form.description,
      details: form.details.split("\n").map((s) => s.trim()).filter(Boolean),
      colors: colorsJson,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      active: form.active,
    };

    try {
      const url = isEdit ? `/api/admin/produits/${initial?.ref}` : "/api/admin/produits";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 620 }}>
      {field("name", "Nom du produit")}
      {field("ref", "Référence (SKU) — ex: TBT-001")}
      {field("slug", "Slug URL — ex: sac-toundra (auto-généré si vide)")}
      {field("category", "Catégorie — ex: Sac, Ceinture, Soulier")}
      {field("price", "Prix (XOF)", "number")}
      {field("stock", "Stock", "number")}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={LABEL_STYLE}>Image principale</label>
        <ImageUpload
          value={form.imageUrl}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
        />
      </div>

      {field("imagePos", "Position image (center, top, bottom, 50% 30%…)")}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={LABEL_STYLE}>Texture cuir (texKey)</label>
        <select
          value={form.texKey}
          onChange={(e) => setForm((f) => ({ ...f, texKey: e.target.value }))}
          style={{ ...INPUT_STYLE, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 13 }}
        >
          {TEX_OPTIONS.map((t) => (
            <option key={t} value={t} style={{ background: "#0a0a0a" }}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={LABEL_STYLE}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          style={{ ...INPUT_STYLE, resize: "vertical", lineHeight: 1.6 }}
          placeholder="Cuir pleine fleur tanné végétal, confectionné à Abidjan…"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={LABEL_STYLE}>Détails (une ligne = un point)</label>
        <textarea
          value={form.details}
          onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
          rows={4}
          style={{ ...INPUT_STYLE, resize: "vertical", lineHeight: 1.8, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 13 }}
          placeholder={"Cuir pleine fleur 100% végétal\nFermeture laiton brossé\nDoublure en daim naturel"}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={LABEL_STYLE}>Couleurs (JSON)</label>
        <textarea
          value={form.colors}
          onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
          rows={5}
          style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 12, lineHeight: 1.6 }}
          placeholder={`[{"name":"noir","label":"Noir Ébène","tex":"leather-black","hex":"#1a1a1a"}]`}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={LABEL_STYLE}>Pointures (séparées par virgule — laisser vide si sans taille)</label>
        <input
          type="text"
          value={form.sizes}
          onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
          style={{ ...INPUT_STYLE, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 13 }}
          placeholder="39, 40, 41, 42, 43, 44"
        />
      </div>

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
