-- Marmita Já — schema inicial
-- Execute com `supabase db push` ou pelo SQL Editor em um projeto vazio.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 120),
  telefone text,
  endereco_padrao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.establishments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 160),
  tipo_cozinha text not null default 'caseira'
    check (tipo_cozinha in ('caseira', 'fit', 'vegana', 'outra')),
  distancia_km numeric(6,2) check (distancia_km is null or distancia_km >= 0),
  nota_media numeric(2,1) not null default 0 check (nota_media between 0 and 5),
  horario_abertura time,
  horario_fechamento time,
  status text not null default 'aberto' check (status in ('aberto', 'fechado')),
  foto_url text,
  avatar_iniciais text,
  avatar_cor text default '#C0392B',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 160),
  preco_base numeric(12,2) not null check (preco_base >= 0),
  categoria text,
  disponivel_hoje boolean not null default true,
  icone_split numeric(4,3) not null default 0.5 check (icone_split between 0 and 1),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.dish_options (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references public.dishes(id) on delete cascade,
  grupo text not null check (grupo in ('proteina', 'acompanhamento', 'extra')),
  nome text not null check (char_length(trim(nome)) between 1 and 120),
  preco_adicional numeric(12,2) not null default 0 check (preco_adicional >= 0),
  selecao_min integer not null default 0 check (selecao_min >= 0),
  selecao_max integer not null default 1 check (selecao_max >= selecao_min),
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  establishment_id uuid not null references public.establishments(id) on delete restrict,
  status text not null default 'recebido'
    check (status in ('recebido', 'preparando', 'a_caminho', 'entregue')),
  endereco_entrega text not null check (char_length(trim(endereco_entrega)) > 0),
  forma_pagamento text not null default 'pix' check (forma_pagamento in ('pix')),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  taxa_entrega numeric(12,2) not null default 0 check (taxa_entrega >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  previsao_entrega timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  dish_id uuid not null references public.dishes(id) on delete restrict,
  quantidade integer not null default 1 check (quantidade > 0 and quantidade <= 99),
  opcoes_selecionadas jsonb not null default '[]'::jsonb
    check (jsonb_typeof(opcoes_selecionadas) = 'array'),
  observacoes text check (observacoes is null or char_length(observacoes) <= 500),
  preco_unitario numeric(12,2) not null check (preco_unitario >= 0),
  criado_em timestamptz not null default now()
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null unique references public.establishments(id) on delete cascade,
  saldo_disponivel numeric(12,2) not null default 0 check (saldo_disponivel >= 0),
  recebido_hoje numeric(12,2) not null default 0 check (recebido_hoje >= 0),
  a_receber numeric(12,2) not null default 0 check (a_receber >= 0),
  atualizado_em timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete restrict,
  order_id uuid references public.orders(id) on delete restrict,
  tipo text not null check (tipo in ('venda', 'saque', 'ajuste')),
  valor numeric(12,2) not null check (valor > 0),
  status text not null check (status in ('pendente', 'disponivel', 'sacado', 'cancelado')),
  descricao text,
  criado_em timestamptz not null default now()
);

create index idx_dishes_establishment on public.dishes(establishment_id);
create index idx_dish_options_dish on public.dish_options(dish_id);
create index idx_orders_user on public.orders(user_id, criado_em desc);
create index idx_orders_establishment on public.orders(establishment_id, criado_em desc);
create index idx_order_items_order on public.order_items(order_id);
create index idx_wallet_transactions_wallet on public.wallet_transactions(wallet_id, criado_em desc);
create unique index uq_wallet_sale_per_order
  on public.wallet_transactions(order_id) where tipo = 'venda';

create or replace function public.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger profiles_set_atualizado_em before update on public.profiles
for each row execute function public.set_atualizado_em();
create trigger establishments_set_atualizado_em before update on public.establishments
for each row execute function public.set_atualizado_em();
create trigger dishes_set_atualizado_em before update on public.dishes
for each row execute function public.set_atualizado_em();
create trigger orders_set_atualizado_em before update on public.orders
for each row execute function public.set_atualizado_em();
create trigger wallets_set_atualizado_em before update on public.wallets
for each row execute function public.set_atualizado_em();

create or replace function public.create_establishment_wallet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.wallets(establishment_id) values (new.id)
  on conflict (establishment_id) do nothing;
  return new;
end;
$$;

create trigger trg_create_establishment_wallet
after insert on public.establishments for each row
execute function public.create_establishment_wallet();

-- O cliente nunca define preços. O banco confere o restaurante do prato e
-- substitui preço/opções pelos valores canônicos do cardápio.
create or replace function public.check_order_item_establishment()
returns trigger language plpgsql set search_path = public as $$
declare
  dish_establishment uuid;
  order_establishment uuid;
  dish_price numeric(12,2);
  canonical_options jsonb;
  supplied_count integer;
  matched_count integer;
begin
  select establishment_id, preco_base into dish_establishment, dish_price
  from public.dishes where id = new.dish_id;
  select establishment_id into order_establishment
  from public.orders where id = new.order_id;

  if dish_establishment is null or order_establishment is null then
    raise exception 'Pedido ou prato inexistente';
  end if;
  if dish_establishment <> order_establishment then
    raise exception 'Um pedido não pode misturar pratos de estabelecimentos diferentes';
  end if;

  supplied_count := jsonb_array_length(new.opcoes_selecionadas);
  select count(*), coalesce(
    jsonb_agg(jsonb_build_object(
      'dish_option_id', opt.id,
      'nome', opt.nome,
      'preco_adicional', opt.preco_adicional
    ) order by supplied.ord), '[]'::jsonb)
  into matched_count, canonical_options
  from jsonb_array_elements(new.opcoes_selecionadas) with ordinality supplied(value, ord)
  join public.dish_options opt
    on opt.id = (supplied.value->>'dish_option_id')::uuid
   and opt.dish_id = new.dish_id;

  if matched_count <> supplied_count then
    raise exception 'Uma ou mais opções não pertencem ao prato';
  end if;

  new.preco_unitario := dish_price;
  new.opcoes_selecionadas := canonical_options;
  return new;
end;
$$;

create trigger trg_check_order_item_establishment
before insert or update on public.order_items for each row
execute function public.check_order_item_establishment();

create or replace function public.prepare_order_totals()
returns trigger language plpgsql as $$
begin
  new.subtotal := 0;
  new.taxa_entrega := 0;
  new.total := 0;
  return new;
end;
$$;

create trigger trg_prepare_order_totals before insert on public.orders
for each row execute function public.prepare_order_totals();

create or replace function public.protect_order_fields()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and (
    new.user_id is distinct from old.user_id or
    new.establishment_id is distinct from old.establishment_id or
    new.endereco_entrega is distinct from old.endereco_entrega or
    new.forma_pagamento is distinct from old.forma_pagamento or
    new.subtotal is distinct from old.subtotal or
    new.taxa_entrega is distinct from old.taxa_entrega or
    new.total is distinct from old.total or
    new.criado_em is distinct from old.criado_em
  ) then
    raise exception 'Somente o status e a previsão de entrega podem ser alterados';
  end if;
  return new;
end;
$$;

create trigger trg_protect_order_fields before update on public.orders
for each row execute function public.protect_order_fields();

create or replace function public.recalculate_order_totals()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_order uuid := coalesce(new.order_id, old.order_id);
  calculated numeric(12,2);
begin
  select coalesce(sum(
    item.quantidade * (item.preco_unitario + coalesce((
      select sum((option->>'preco_adicional')::numeric)
      from jsonb_array_elements(item.opcoes_selecionadas) option
    ), 0))
  ), 0) into calculated
  from public.order_items item where item.order_id = target_order;

  update public.orders
  set subtotal = calculated, total = calculated + taxa_entrega
  where id = target_order;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger trg_recalculate_order_totals
after insert or update or delete on public.order_items for each row
execute function public.recalculate_order_totals();

create or replace function public.validate_order_status_transition()
returns trigger language plpgsql as $$
begin
  if new.status = old.status then return new; end if;
  if not (
    (old.status = 'recebido' and new.status = 'preparando') or
    (old.status = 'preparando' and new.status = 'a_caminho') or
    (old.status = 'a_caminho' and new.status = 'entregue')
  ) then
    raise exception 'Transição de status inválida: % -> %', old.status, new.status;
  end if;
  return new;
end;
$$;

create trigger trg_validate_order_status before update of status on public.orders
for each row execute function public.validate_order_status_transition();

-- Mantém a_receber sincronizado quando o banco recalcula o pedido.
create or replace function public.sync_wallet_receivable()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'entregue' and new.total <> old.total then
    update public.wallets
    set a_receber = greatest(0, a_receber + (new.total - old.total))
    where establishment_id = new.establishment_id;
  end if;
  return new;
end;
$$;

create trigger trg_sync_wallet_receivable after update of total on public.orders
for each row execute function public.sync_wallet_receivable();

create or replace function public.credit_wallet_on_delivered()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_wallet uuid;
begin
  if old.status <> 'entregue' and new.status = 'entregue' then
    select id into target_wallet from public.wallets
    where establishment_id = new.establishment_id for update;

    insert into public.wallet_transactions(wallet_id, order_id, tipo, valor, status, descricao)
    values (target_wallet, new.id, 'venda', new.total, 'disponivel', 'Crédito do pedido #' || left(new.id::text, 8))
    on conflict (order_id) where tipo = 'venda' do nothing;

    if found then
      update public.wallets
      set saldo_disponivel = saldo_disponivel + new.total,
          recebido_hoje = recebido_hoje + new.total,
          a_receber = greatest(0, a_receber - new.total)
      where id = target_wallet;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_credit_wallet_on_delivered after update of status on public.orders
for each row execute function public.credit_wallet_on_delivered();

create or replace function public.sacar_saldo(valor_saque numeric)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  target_wallet public.wallets%rowtype;
  transaction_id uuid;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  if valor_saque is null or valor_saque <= 0 then raise exception 'Valor de saque inválido'; end if;

  select w.* into target_wallet
  from public.wallets w
  join public.establishments e on e.id = w.establishment_id
  where e.owner_id = auth.uid()
  for update of w;

  if not found then raise exception 'Carteira não encontrada'; end if;
  if target_wallet.saldo_disponivel < valor_saque then raise exception 'Saldo insuficiente'; end if;

  update public.wallets
  set saldo_disponivel = saldo_disponivel - valor_saque
  where id = target_wallet.id;

  insert into public.wallet_transactions(wallet_id, tipo, valor, status, descricao)
  values (target_wallet.id, 'saque', valor_saque, 'sacado', 'Saque solicitado pelo estabelecimento')
  returning id into transaction_id;
  return transaction_id;
end;
$$;

revoke all on function public.sacar_saldo(numeric) from public;
grant execute on function public.sacar_saldo(numeric) to authenticated;

alter table public.profiles enable row level security;
alter table public.establishments enable row level security;
alter table public.dishes enable row level security;
alter table public.dish_options enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;

create policy "profiles: leitura própria" on public.profiles for select
using (id = auth.uid());
create policy "profiles: cadastro próprio" on public.profiles for insert
with check (id = auth.uid());
create policy "profiles: atualização própria" on public.profiles for update
using (id = auth.uid()) with check (id = auth.uid());

create policy "establishments: leitura pública" on public.establishments for select
using (true);
create policy "establishments: cadastro do dono" on public.establishments for insert to authenticated
with check (owner_id = auth.uid());
create policy "establishments: atualização do dono" on public.establishments for update to authenticated
using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "dishes: cardápio público" on public.dishes for select using (true);
create policy "dishes: cadastro do dono" on public.dishes for insert to authenticated
with check (exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid()));
create policy "dishes: atualização do dono" on public.dishes for update to authenticated
using (exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid()))
with check (exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid()));

create policy "dish_options: leitura pública" on public.dish_options for select using (true);
create policy "dish_options: cadastro do dono" on public.dish_options for insert to authenticated
with check (exists (select 1 from public.dishes d join public.establishments e on e.id = d.establishment_id where d.id = dish_id and e.owner_id = auth.uid()));
create policy "dish_options: atualização do dono" on public.dish_options for update to authenticated
using (exists (select 1 from public.dishes d join public.establishments e on e.id = d.establishment_id where d.id = dish_id and e.owner_id = auth.uid()));
create policy "dish_options: exclusão do dono" on public.dish_options for delete to authenticated
using (exists (select 1 from public.dishes d join public.establishments e on e.id = d.establishment_id where d.id = dish_id and e.owner_id = auth.uid()));

create policy "orders: leitura do cliente ou dono" on public.orders for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid()));
create policy "orders: criação do cliente" on public.orders for insert to authenticated
with check (user_id = auth.uid() and exists (select 1 from public.establishments e where e.id = establishment_id));
create policy "orders: update do dono (status)" on public.orders for update to authenticated
using (exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid()))
with check (exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid()));

create policy "order_items: leitura do cliente ou dono" on public.order_items for select to authenticated
using (exists (select 1 from public.orders o left join public.establishments e on e.id = o.establishment_id where o.id = order_id and (o.user_id = auth.uid() or e.owner_id = auth.uid())));
create policy "order_items: criação pelo cliente" on public.order_items for insert to authenticated
with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'recebido'));

create policy "wallets: leitura do dono" on public.wallets for select to authenticated
using (exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid()));
create policy "wallet_transactions: leitura do dono" on public.wallet_transactions for select to authenticated
using (exists (select 1 from public.wallets w join public.establishments e on e.id = w.establishment_id where w.id = wallet_id and e.owner_id = auth.uid()));

-- Privilégios mínimos; RLS decide quais linhas cada sessão pode acessar.
revoke all on public.profiles, public.establishments, public.dishes,
  public.dish_options, public.orders, public.order_items,
  public.wallets, public.wallet_transactions from anon, authenticated;

grant select on public.establishments, public.dishes, public.dish_options to anon;
grant select on public.establishments, public.dishes, public.dish_options to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant insert, update on public.establishments to authenticated;
grant insert, update on public.dishes to authenticated;
grant insert, update, delete on public.dish_options to authenticated;
grant select, insert on public.orders to authenticated;
grant update(status, previsao_entrega) on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select on public.wallets, public.wallet_transactions to authenticated;

-- Bucket público para fotos dos estabelecimentos. Uploads continuam limitados ao dono.
insert into storage.buckets(id, name, public)
values ('estabelecimentos', 'estabelecimentos', true)
on conflict (id) do update set public = excluded.public;

create policy "fotos estabelecimentos: leitura pública" on storage.objects for select
using (bucket_id = 'estabelecimentos');
create policy "fotos estabelecimentos: upload do dono" on storage.objects for insert to authenticated
with check (
  bucket_id = 'estabelecimentos' and exists (
    select 1 from public.establishments e
    where e.owner_id = auth.uid()
      and (storage.foldername(name))[1] = e.id::text
  )
);
create policy "fotos estabelecimentos: atualização do dono" on storage.objects for update to authenticated
using (
  bucket_id = 'estabelecimentos' and exists (
    select 1 from public.establishments e
    where e.owner_id = auth.uid()
      and (storage.foldername(name))[1] = e.id::text
  )
);
create policy "fotos estabelecimentos: exclusão do dono" on storage.objects for delete to authenticated
using (
  bucket_id = 'estabelecimentos' and exists (
    select 1 from public.establishments e
    where e.owner_id = auth.uid()
      and (storage.foldername(name))[1] = e.id::text
  )
);

-- Necessário para o acompanhamento do pedido via postgres_changes.
alter publication supabase_realtime add table public.orders;
