alter table public.addresses
  add column if not exists cep text,
  add column if not exists numero text,
  add column if not exists bairro text,
  add column if not exists cidade text,
  add column if not exists estado text,
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6);
