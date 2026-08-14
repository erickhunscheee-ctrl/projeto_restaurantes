alter table public.profiles
  add column if not exists role text not null default 'cliente';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('cliente', 'restaurante'));

alter table public.establishments
  add column if not exists whatsapp_telefone text;

drop policy if exists "dishes: exclusão do dono" on public.dishes;
create policy "dishes: exclusão do dono" on public.dishes
  for delete to authenticated
  using (
    exists (
      select 1 from public.establishments e
      where e.id = establishment_id and e.owner_id = auth.uid()
    )
  );

grant delete on public.dishes to authenticated;
