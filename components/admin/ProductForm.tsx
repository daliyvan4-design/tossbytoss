"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";

interface ColorEntry {
  name: string;
  label: string;
  hex: string;
  tex: string;
}

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
  colors: ColorEntry[];
  sizes: string;
  active: boolean;
}

interface Props {
  initial?: Partial<Omit<ProductData, "colors"> & { colors: string; ref?: string }>;
  isEdit?: boolean;
}

// ─── Palette cuir prédéfinie ───────────────────────────────────────────────
const PALETTE: ColorEntry[] = [
  { name: "noir-ebene",    label: "Noir Ébène",    hex: "#1A1A1A", tex: "leather-black"      },
  { name: "charbon",       label: "Charbon",       hex: "#2E2E2E", tex: "leather-black"      },
  { name: "brun-fonce",    label: "Brun Foncé",    hex: "#3D2314", tex: "leather-dark-brown" },
  { name: "tabac",         label: "Tabac",         hex: "#6F4020", tex: "leather-dark-brown" },
  { name: "cognac",        label: "Cognac",        hex: "#8B4E2B", tex: "leather-cognac"     },
  { name: "caramel",       label: "Caramel",       hex: "#C07840", tex: "leather-cognac"     },
  { name: "miel",          label: "Miel",          hex: "#D4A040", tex: "leather-cognac"     },
  { name: "naturel",       label: "Naturel",       hex: "#C8A882", tex: "leather-natural"    },
  { name: "sable",         label: "Sable",         hex: "#C4A060", tex: "leather-natural"    },
  { name: "creme",         label: "Crème",         hex: "#EFE4CC", tex: "leather-natural"    },
  { name: "bordeaux",      label: "Bordeaux",      hex: "#6B1F27", tex: "leather-burgundy"   },
  { name: "prune",         label: "Prune",         hex: "#5C2A4A", tex: "leather-burgundy"   },
  { name: "bleu-marine",   label: "Bleu Marine",   hex: "#1B2A47", tex: "leather-navy"       },
  { name: "vert-chasseur", label: "Vert Chasseur", hex: "#2E4835", tex: "leather-dark-brown" },
  { name: "gris-ardoise",  label: "Gris Ardoise",  hex: "#4A4E5C", tex: "leather-black"      },
  { name: "rose-poudre",   label: "Rose Poudré",   hex: "#C8948A", tex: "leather-natural"    },
];

// ─── Tailles chaussures EU ────────────────────────────────────────────────
const EU_SIZES = ["35","36","37","38","39","40","41","42","43","44","45","46","47","48"];

const SHOE_KEYWORDS = ["soulier","chaussure","shoe","basket","botte","mocassin","derby","oxford","sneaker","escarpin","sandale","loafer","mule","ballerine"];

function isShoe(category: string): boolean {
  const normalized = category.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return SHOE_KEYWORDS.some((kw) => normalized.includes(kw));
}

// ─── Styles ───────────────────────────────────────────────────────────────
const INPUT_STYLE = {
  background: "transparent",
  border: "1px solid rgba(245,242,236,0.18)",
  padding: "10px 14px",
  fontFamily: "var(--font-cormorant, Georgia, serif)",
  fontSize: 17,
  color: "inherit",
  outline: "none",
  width: "100%",
} as const;

const LABEL_STYLE = {
  fontFamily: "var(--font-jetbrains, monospace)",
  fontSize: 9,
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  opacity: 0.55,
};

const TEX_OPTIONS = [
  "leather-black","leather-cognac","leather-dark-brown",
  "leather-navy","leather-burgundy","leather-natural",
];

function parseColors(raw: string | undefined): ColorEntry[] {
  try { return JSON.parse(raw ?? "[]") as ColorEntry[]; } catch { return []; }
}

function slugify(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductForm({ initial, isEdit }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductData>({
    name:        initial?.name        ?? "",
    ref:         initial?.ref         ?? "",
    slug:        initial?.slug        ?? "",
    category:    initial?.category    ?? "",
    price:       initial?.price       ?? 0,
    stock:       initial?.stock       ?? 0,
    imageUrl:    initial?.imageUrl    ?? "",
    imagePos:    initial?.imagePos    ?? "center",
    texKey:      initial?.texKey      ?? "leather-black",
    description: initial?.description ?? "",
    details:     initial?.details     ?? "",
    colors:      parseColors(initial?.colors),
    sizes:       initial?.sizes       ?? "",
    active:      initial?.active      ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Color toggle ──────────────────────────────────────────────────────
  function toggleColor(entry: ColorEntry) {
    setForm((f) => {
      const exists = f.colors.some((c) => c.name === entry.name);
      return {
        ...f,
        colors: exists
          ? f.colors.filter((c) => c.name !== entry.name)
          : [...f.colors, entry],
      };
    });
  }

  // ── Size toggle (shoes) ───────────────────────────────────────────────
  function toggleSize(size: string) {
    setForm((f) => {
      const current = f.sizes.split(",").map((s) => s.trim()).filter(Boolean);
      const next = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size].sort((a, b) => Number(a) - Number(b));
      return { ...f, sizes: next.join(", ") };
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name:        form.name,
      ref:         form.ref,
      slug:        form.slug || slugify(form.name),
      category:    form.category,
      price:       Number(form.price),
      stock:       Number(form.stock),
      imageUrl:    form.imageUrl,
      imagePos:    form.imagePos,
      texKey:      form.texKey,
      description: form.description,
      details:     form.details.split("\n").map((s) => s.trim()).filter(Boolean),
      colors:      form.colors,
      sizes:       isShoe(form.category)
                     ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
                     : [],
      active:      form.active,
    };

    try {
      const url = isEdit ? `/api/admin/produits/${initial?.ref}` : "/api/admin/produits";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
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

  const selectedSizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
  const shoe = isShoe(form.category);

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
      {field("name", "Nom du produit")}
      {field("ref", "Référence (SKU) — ex: TBT-001")}
      {field("slug", "Slug URL (auto-généré si vide)")}
      {field("category", "Catégorie — ex: Sac, Ceinture, Soulier, Chaussure…")}
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

      {/* ── Palette coloris ─────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label style={LABEL_STYLE}>Coloris disponibles</label>
          {form.colors.length > 0 && (
            <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4, letterSpacing: "0.15em" }}>
              {form.colors.length} sélectionné{form.colors.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Grille de swatches */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
          {PALETTE.map((entry) => {
            const selected = form.colors.some((c) => c.name === entry.name);
            return (
              <button
                key={entry.name}
                type="button"
                title={entry.label}
                onClick={() => toggleColor(entry)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 0",
                }}
              >
                {/* Swatch circulaire */}
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: entry.hex,
                  border: selected
                    ? "3px solid #f5f2ec"
                    : "2px solid rgba(245,242,236,0.15)",
                  boxShadow: selected
                    ? "0 0 0 1px rgba(245,242,236,0.5)"
                    : "none",
                  transition: "border 150ms, box-shadow 150ms",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {selected && (
                    <span style={{
                      fontSize: 14,
                      color: entry.hex < "#888" ? "#f5f2ec" : "#0a0a0a",
                      lineHeight: 1,
                    }}>✓</span>
                  )}
                </div>
                {/* Label sous le swatch */}
                <span style={{
                  fontFamily: "var(--font-jetbrains, monospace)",
                  fontSize: 7,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  opacity: selected ? 0.9 : 0.35,
                  textAlign: "center",
                  lineHeight: 1.2,
                  maxWidth: 44,
                  display: "block",
                }}>
                  {entry.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sélection résumée */}
        {form.colors.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 14px", border: "1px solid rgba(245,242,236,0.10)", background: "rgba(245,242,236,0.03)" }}>
            {form.colors.map((c) => (
              <span
                key={c.name}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  border: "1px solid rgba(245,242,236,0.18)",
                  fontFamily: "var(--font-jetbrains, monospace)",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.hex, flexShrink: 0, display: "inline-block" }} />
                {c.label}
                <button
                  type="button"
                  onClick={() => toggleColor(c)}
                  style={{ background: "transparent", border: "none", color: "rgba(245,100,100,0.7)", fontSize: 14, cursor: "pointer", lineHeight: 1, padding: 0, marginLeft: 2 }}
                >×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Pointures — uniquement pour les chaussures ──────────────── */}
      {shoe && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label style={LABEL_STYLE}>Pointures disponibles (EU)</label>
            {selectedSizes.length > 0 && (
              <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4, letterSpacing: "0.15em" }}>
                {selectedSizes.join(", ")}
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EU_SIZES.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  style={{
                    padding: "8px 14px",
                    background: active ? "rgba(245,242,236,0.12)" : "transparent",
                    border: active ? "1px solid rgba(245,242,236,0.6)" : "1px solid rgba(245,242,236,0.18)",
                    color: "#f5f2ec",
                    fontFamily: "var(--font-jetbrains, monospace)",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    cursor: "pointer",
                    opacity: active ? 1 : 0.5,
                    transition: "all 150ms",
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
