"use client";

import { useEffect, useRef, useState } from "react";

type GalleryAspect = "TALL" | "WIDE" | "SQUARE";
type GallerySection = "CLIENTS" | "CONCEPTION";

interface GalleryItem {
  id: string;
  imageUrl: string;
  name: string;
  note: string;
  section: GallerySection;
  aspect: GalleryAspect;
  position: number;
  active: boolean;
}

const ASPECT_LABELS: Record<GalleryAspect, string> = { TALL: "Portrait 9:16", WIDE: "Paysage 16:9", SQUARE: "Carré 1:1" };
const SECTION_LABELS: Record<GallerySection, string> = { CLIENTS: "Clients réguliers", CONCEPTION: "Carnets de conception" };

export default function MoodboardAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", note: "", section: "CLIENTS" as GallerySection, aspect: "SQUARE" as GalleryAspect, position: 0 });
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/admin/moodboard");
    setItems(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleUploadAndCreate(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setStatus("Sélectionnez une image."); return; }
    setUploading(true); setStatus("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const { url, error: upErr } = await upRes.json();
      if (upErr || !url) throw new Error(upErr ?? "Upload échoué.");

      await fetch("/api/admin/moodboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, ...form }),
      });
      setForm({ name: "", note: "", section: "CLIENTS", aspect: "SQUARE", position: 0 });
      setPreviewUrl("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
      setStatus("Photo ajoutée ✓");
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/admin/moodboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleToggle(item: GalleryItem) {
    const res = await fetch("/api/admin/moodboard", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, active: !item.active }) });
    const updated = await res.json();
    setItems((prev) => prev.map((i) => i.id === updated.id ? updated : i));
  }

  const clients = items.filter((i) => i.section === "CLIENTS");
  const conception = items.filter((i) => i.section === "CONCEPTION");

  const ROW: React.CSSProperties = { display: "flex", gap: 8, flexDirection: "column" };
  const LABEL: React.CSSProperties = { fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(245,242,236,0.5)" };
  const INPUT: React.CSSProperties = { background: "#111", border: "1px solid rgba(245,242,236,0.15)", padding: "10px 12px", color: "#f5f2ec", fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 16, borderRadius: 0, outline: "none", width: "100%", boxSizing: "border-box" };
  const SELECT: React.CSSProperties = { ...INPUT, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11 };

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 07 — Galerie</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Moodboard</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 48, alignItems: "start" }}>

        {/* Formulaire ajout */}
        <form onSubmit={handleUploadAndCreate} style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 32 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.5, marginBottom: 4 }}>Ajouter une photo</div>

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: "1px dashed rgba(245,242,236,0.2)", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden" }}
          >
            {previewUrl
              ? <img src={previewUrl} alt="" style={{ width: "100%", height: 180, objectFit: "cover" }} />
              : <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.35 }}>Cliquer pour choisir</span>
            }
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPreviewUrl(URL.createObjectURL(f));
              }}
            />
          </div>

          <div style={ROW}>
            <label style={LABEL}>Nom / personne</label>
            <input style={INPUT} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Aminata D." />
          </div>
          <div style={ROW}>
            <label style={LABEL}>Note (lieu, produit…)</label>
            <input style={INPUT} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Sac Toundra · Abidjan" />
          </div>
          <div style={ROW}>
            <label style={LABEL}>Section</label>
            <select style={SELECT} value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value as GallerySection }))}>
              <option value="CLIENTS">Clients réguliers</option>
              <option value="CONCEPTION">Carnets de conception</option>
            </select>
          </div>
          <div style={ROW}>
            <label style={LABEL}>Format du cadre</label>
            <select style={SELECT} value={form.aspect} onChange={(e) => setForm((p) => ({ ...p, aspect: e.target.value as GalleryAspect }))}>
              <option value="SQUARE">Carré 1:1</option>
              <option value="TALL">Portrait 9:16</option>
              <option value="WIDE">Paysage 16:9</option>
            </select>
          </div>
          <div style={ROW}>
            <label style={LABEL}>Position (ordre d'affichage)</label>
            <input type="number" style={INPUT} value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: Number(e.target.value) }))} />
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{ padding: "14px 28px", background: uploading ? "rgba(245,242,236,0.1)" : "#f5f2ec", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", border: "none", cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.5 : 1 }}
          >
            {uploading ? "Upload…" : "Ajouter à la galerie"}
          </button>

          {status && (
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.15em", opacity: 0.7 }}>{status}</div>
          )}
        </form>

        {/* Liste */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {([["CLIENTS", clients], ["CONCEPTION", conception]] as [GallerySection, GalleryItem[]][]).map(([section, sectionItems]) => (
            <div key={section}>
              <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.4, marginBottom: 16 }}>
                {SECTION_LABELS[section]} · {sectionItems.length} photo{sectionItems.length !== 1 ? "s" : ""}
              </div>
              {sectionItems.length === 0 && (
                <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", opacity: 0.3, fontSize: 17 }}>Aucune photo dans cette section.</div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {sectionItems.map((item) => (
                  <div key={item.id} style={{ border: "1px solid rgba(245,242,236,0.1)", overflow: "hidden", opacity: item.active ? 1 : 0.35 }}>
                    <div style={{ position: "relative", height: item.aspect === "TALL" ? 240 : item.aspect === "WIDE" ? 100 : 160, overflow: "hidden" }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4 }}>
                        <button
                          onClick={() => handleToggle(item)}
                          title={item.active ? "Masquer" : "Afficher"}
                          style={{ width: 26, height: 26, border: "1px solid rgba(245,242,236,0.3)", background: "rgba(10,10,10,0.8)", color: "#f5f2ec", fontSize: 12, cursor: "pointer", display: "grid", placeItems: "center" }}
                        >{item.active ? "●" : "○"}</button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Supprimer"
                          style={{ width: 26, height: 26, border: "1px solid rgba(200,80,60,0.4)", background: "rgba(10,10,10,0.8)", color: "rgba(200,80,60,0.9)", fontSize: 14, cursor: "pointer", display: "grid", placeItems: "center" }}
                        >×</button>
                      </div>
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 14, lineHeight: 1.3, marginBottom: 4 }}>{item.name || "—"}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 8, letterSpacing: "0.15em", opacity: 0.4, textTransform: "uppercase" }}>{ASPECT_LABELS[item.aspect]} · #{item.position}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
