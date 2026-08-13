import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";

const BUCKET = "categorias";
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateImage(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  if (!IMAGE_EXTENSIONS[value.type]) {
    throw new Error("Use uma imagem JPEG, PNG, WebP ou AVIF.");
  }
  if (value.size > MAX_IMAGE_SIZE) {
    throw new Error("A imagem deve ter no máximo 3 MB.");
  }
  return value;
}

function storagePathFromUrl(url: string | null) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const path = url.split(marker)[1];
  return path ? decodeURIComponent(path) : null;
}

async function uploadImage(
  admin: NonNullable<Awaited<ReturnType<typeof requirePlatformAdmin>>>,
  categoryId: string,
  image: File,
) {
  const extension = IMAGE_EXTENSIONS[image.type];
  const path = `${categoryId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await admin.storage.from(BUCKET).upload(
    path,
    Buffer.from(await image.arrayBuffer()),
    { contentType: image.type, upsert: false },
  );
  if (error) throw new Error(error.message);
  return {
    path,
    publicUrl: admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
  };
}

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  const { data, error } = await admin
    .from("categories")
    .select("id,nome,slug,image_url,ordem,ativo")
    .order("ordem");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  try {
    const form = await request.formData();
    const nome = String(form.get("nome") ?? "").trim();
    const ordem = Number(form.get("ordem") ?? 0);
    const image = validateImage(form.get("image"));
    const slug = slugify(nome);

    if (nome.length < 2 || !slug) {
      return NextResponse.json({ error: "Informe o nome da categoria." }, { status: 400 });
    }
    if (!image) {
      return NextResponse.json({ error: "Selecione uma imagem para a categoria." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const uploaded = await uploadImage(admin, id, image);
    const { data, error } = await admin
      .from("categories")
      .insert({ id, nome, slug, image_url: uploaded.publicUrl, ordem, ativo: true })
      .select()
      .single();

    if (error) {
      await admin.storage.from(BUCKET).remove([uploaded.path]);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível salvar a categoria." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  try {
    const form = await request.formData();
    const id = String(form.get("id") ?? "");
    const nome = String(form.get("nome") ?? "").trim();
    const ordem = Number(form.get("ordem") ?? 0);
    const ativo = String(form.get("ativo") ?? "true") === "true";
    const image = validateImage(form.get("image"));

    if (!id || nome.length < 2) {
      return NextResponse.json({ error: "Dados da categoria inválidos." }, { status: 400 });
    }

    const { data: current, error: currentError } = await admin
      .from("categories")
      .select("image_url")
      .eq("id", id)
      .single();
    if (currentError) return NextResponse.json({ error: currentError.message }, { status: 404 });

    const uploaded = image ? await uploadImage(admin, id, image) : null;
    const { data, error } = await admin
      .from("categories")
      .update({
        nome,
        slug: slugify(nome),
        ordem,
        ativo,
        ...(uploaded ? { image_url: uploaded.publicUrl } : {}),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (uploaded) await admin.storage.from(BUCKET).remove([uploaded.path]);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (uploaded) {
      const oldPath = storagePathFromUrl(current.image_url);
      if (oldPath) await admin.storage.from(BUCKET).remove([oldPath]);
    }
    return NextResponse.json({ category: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível atualizar a categoria." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  const { id } = await request.json();
  const { data: current } = await admin
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const path = storagePathFromUrl(current?.image_url ?? null);
  if (path) await admin.storage.from(BUCKET).remove([path]);
  return NextResponse.json({ ok: true });
}
