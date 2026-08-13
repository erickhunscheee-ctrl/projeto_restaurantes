create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 2 and 50),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  image_url text,
  ordem integer not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.establishment_categories (
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (establishment_id, category_id)
);

create index if not exists idx_establishment_categories_category
  on public.establishment_categories(category_id, establishment_id);

insert into public.categories (nome, slug, ordem)
values
  ('Marmitas', 'marmitas', 10),
  ('Comida caseira', 'comida-caseira', 20),
  ('Lanches', 'lanches', 30),
  ('Pizzas', 'pizzas', 40),
  ('Saudável', 'saudavel', 50),
  ('Brasileira', 'brasileira', 60),
  ('Japonesa', 'japonesa', 70),
  ('Doces', 'doces', 80),
  ('Bebidas', 'bebidas', 90)
on conflict (slug) do update set
  nome = excluded.nome,
  ordem = excluded.ordem;

alter table public.categories enable row level security;
alter table public.establishment_categories enable row level security;

create policy "categories: leitura pública" on public.categories
  for select using (ativo = true);

create policy "establishment categories: leitura pública" on public.establishment_categories
  for select using (true);

revoke all on public.categories from anon, authenticated;
revoke all on public.establishment_categories from anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.establishment_categories to anon, authenticated;
