alter table public.categories
  add column if not exists image_url text;

alter table public.categories
  drop column if exists icone;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'categorias',
  'categorias',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "imagens categorias: leitura pública" on storage.objects
  for select using (bucket_id = 'categorias');
