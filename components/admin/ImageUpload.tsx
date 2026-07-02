"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) onChange(data.url);
    setUploading(false);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      style={{
        border: "1px dashed rgba(17,17,17,0.2)",
        padding: 24,
        cursor: "pointer",
        textAlign: "center",
        position: "relative",
        minHeight: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {uploading && (
        <span style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, opacity: 0.5 }}>
          Envoi en cours…
        </span>
      )}
      {!uploading && value && (
        <Image src={value} alt="preview" fill style={{ objectFit: "contain" }} />
      )}
      {!uploading && !value && (
        <span style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4 }}>
          Glisser une image ou cliquer
        </span>
      )}
    </div>
  );
}
