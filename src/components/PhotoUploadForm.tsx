"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function PhotoUploadForm({ itemId }: { itemId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/items/${itemId}/photos`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Upload fehlgeschlagen");
        return;
      }
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="text-sm"
      />
      <button
        type="submit"
        disabled={uploading}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {uploading ? "Lädt hoch..." : "Foto hinzufügen"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  );
}
