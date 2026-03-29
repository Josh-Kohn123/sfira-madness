"use client";

import { useState, useRef } from "react";

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({ currentUrl, onUploaded }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(false);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (!data.url) throw new Error("No URL returned");
      setPreview(data.url);
      onUploaded(data.url);
    } catch {
      setError(true);
      // Show local preview as fallback
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="relative mx-auto w-20 h-20 rounded-full border-2 border-dashed border-cosmos-border flex items-center justify-center cursor-pointer overflow-hidden hover:border-gold/40 hover:bg-gold/5 transition-all"
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
      {error && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-stopped">
          Upload failed — photo won&apos;t be saved
        </div>
      )}
    </div>
  );
}
