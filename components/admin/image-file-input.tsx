"use client";

import { ImagePlus } from "lucide-react";

export function ImageFileInput({ file, onChange, label = "Selecionar imagem" }: { file: File | null; onChange: (file: File | null) => void; label?: string }) {
  return <label className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-border-strong bg-neutral-000 px-3 py-3 text-sm text-neutral-600"><ImagePlus size={17} /><span className="min-w-0 truncate">{file?.name ?? label}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></label>;
}
