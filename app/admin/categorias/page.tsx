"use client";

import { useState } from "react";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { ImageFileInput } from "@/components/admin/image-file-input";
import { useAdminCategories } from "@/hooks/use-admin-resources";

type Category = { id: string; nome: string; image_url: string | null; ordem: number; ativo: boolean };
const inputClass = "w-full rounded-xl border border-border-strong bg-neutral-000 px-3 py-3 text-sm text-neutral-900 outline-none";

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading: loading, refetch } = useAdminCategories();
  const [name, setName] = useState("");
  const [order, setOrder] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(method: "POST" | "PATCH") {
    const selectedImage = method === "POST" ? image : editImage;
    const selectedName = method === "POST" ? name : editName;
    const form = new FormData();
    if (editing) form.set("id", editing.id);
    form.set("nome", selectedName.trim());
    form.set("ordem", method === "POST" ? order || "0" : editOrder || "0");
    form.set("ativo", String(method === "POST" ? true : editActive));
    if (selectedImage) form.set("image", selectedImage);
    const response = await fetch("/api/admin/categories", { method, body: form });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setName(""); setOrder(""); setImage(null); setEditing(null); setEditImage(null); setError(null);
    await refetch();
  }

  async function remove(id: string) {
    const response = await fetch("/api/admin/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    await refetch();
  }

  return <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
    <AdminPageHeading title="Categorias" description="Organize as categorias exibidas para os clientes." />
    <section className="rounded-2xl border border-border bg-neutral-000 p-4 sm:p-5">
      <h2 className="text-base font-semibold">Nova categoria</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_120px_1fr_auto]">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome" className={inputClass} />
        <input value={order} onChange={(event) => setOrder(event.target.value)} type="number" placeholder="Ordem" className={inputClass} />
        <ImageFileInput file={image} onChange={setImage} />
        <Button className="w-full lg:w-auto" onClick={() => submit("POST")} disabled={!name.trim() || !image}>Adicionar</Button>
      </div>
      {error && <p className="mt-3 text-xs text-red-dark">{error}</p>}
    </section>

    <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {loading && <p className="text-sm text-ink-soft">Carregando...</p>}
      {categories.map((category) => <article key={category.id} className="rounded-2xl border border-border bg-neutral-000 p-4">
        {editing?.id === category.id ? <div className="space-y-3">
          <input value={editName} onChange={(event) => setEditName(event.target.value)} className={inputClass} />
          <input value={editOrder} onChange={(event) => setEditOrder(event.target.value)} type="number" placeholder="Ordem" className={inputClass} />
          <ImageFileInput file={editImage} onChange={setEditImage} label="Trocar imagem" />
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editActive} onChange={(event) => setEditActive(event.target.checked)} /> Categoria ativa</label>
          <div className="flex gap-3"><button onClick={() => submit("PATCH")} className="text-xs font-semibold text-primary-700">Salvar</button><button onClick={() => setEditing(null)} className="text-xs text-ink-soft">Cancelar</button></div>
        </div> : <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-050">{category.image_url ? <img src={category.image_url} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={20} className="text-neutral-300" />}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{category.nome}</p><p className="mt-1 text-[11px] text-ink-soft">Ordem {category.ordem} · {category.ativo ? "Ativa" : "Inativa"}</p></div>
          <div className="flex gap-2"><button onClick={() => { setEditing(category); setEditName(category.nome); setEditOrder(String(category.ordem)); setEditActive(category.ativo); }} aria-label="Editar"><Pencil size={15} className="text-primary-700" /></button><button onClick={() => remove(category.id)} aria-label="Excluir"><Trash2 size={15} className="text-red-dark" /></button></div>
        </div>}
      </article>)}
    </section>
  </main>;
}
