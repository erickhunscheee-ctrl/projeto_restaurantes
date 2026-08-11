create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rotulo text not null check (char_length(trim(rotulo)) between 1 and 40),
  endereco text not null check (char_length(trim(endereco)) between 3 and 300),
  padrao boolean not null default false,
  criado_em timestamptz not null default now()
);

create index idx_addresses_user on public.addresses(user_id, criado_em);
create unique index uq_addresses_default_per_user
  on public.addresses(user_id) where padrao = true;

alter table public.profiles
  add column notificacoes_ativas boolean not null default true;

create or replace function public.ensure_single_default_address()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.padrao then
    update public.addresses
       set padrao = false
     where user_id = new.user_id
       and id <> new.id
       and padrao = true;
  end if;
  return new;
end;
$$;

create trigger trg_ensure_single_default_address
before insert or update of padrao on public.addresses
for each row
when (new.padrao = true)
execute function public.ensure_single_default_address();

-- Aproveita endereços cadastrados no campo legado sem removê-lo.
insert into public.addresses(user_id, rotulo, endereco, padrao)
select p.id, 'Casa', trim(p.endereco_padrao), true
from public.profiles p
where nullif(trim(p.endereco_padrao), '') is not null
  and not exists (select 1 from public.addresses a where a.user_id = p.id);

alter table public.addresses enable row level security;

create policy "addresses: select próprio" on public.addresses
  for select to authenticated using (auth.uid() = user_id);
create policy "addresses: insert próprio" on public.addresses
  for insert to authenticated with check (auth.uid() = user_id);
create policy "addresses: update próprio" on public.addresses
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "addresses: delete próprio" on public.addresses
  for delete to authenticated using (auth.uid() = user_id);

revoke all on public.addresses from anon, authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
