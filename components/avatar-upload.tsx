"use client";

import { useState, useRef } from "react";

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({ currentUrl, onUploaded }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const res = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });
      const data = await res.json();
      setPreview(data.url);
      onUploaded(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="mx-auto w-20 h-20 rounded-full border-2 border-dashed border-cosmos-border flex items-center justify-center cursor-pointer overflow-hidden hover:border-gold/40 hover:bg-gold/5 transition-all"
      onClick={() => inputRef.current?.click()}
    >
      {preview ? (
        <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="text-center">
          <div className="text-2xl">{uploading ? "⏳" : "📷"}</div>
          <div className="text-[9px] text-cosmos-muted mt-0.5">Add photo</div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
