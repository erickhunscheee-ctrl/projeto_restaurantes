create table public.phone_otp_challenges (
  telefone text primary key,
  codigo_hash text not null,
  nome text not null,
  expira_em timestamptz not null,
  tentativas integer not null default 0,
  enviado_em timestamptz not null default now(),
  criado_em timestamptz not null default now()
);

alter table public.phone_otp_challenges enable row level security;

