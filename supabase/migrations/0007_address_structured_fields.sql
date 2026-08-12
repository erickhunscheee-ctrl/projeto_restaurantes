alter table public.addresses
  add column if not exists rua text,
  add column if not exists complemento text;
