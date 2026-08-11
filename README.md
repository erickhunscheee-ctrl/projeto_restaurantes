# Marmita Já

Aplicação web em Next.js 15 conectada ao Supabase.

## Configuração local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env.local` e preencha as três chaves do Supabase.
3. Vincule o projeto com `npx supabase link --project-ref SEU_PROJECT_REF`.
4. Aplique o banco com `npx supabase db push`.
5. Inicie com `npm run dev`.

A chave `SUPABASE_SERVICE_ROLE_KEY` é usada apenas no Route Handler que cria o
estabelecimento e sua carteira. Ela nunca deve ser exposta no navegador.

## Banco

A migration `supabase/migrations/0001_init.sql` cria:

- perfis, estabelecimentos, pratos e opções;
- pedidos e itens com validação de estabelecimento e preços no banco;
- carteiras e transações;
- RLS e privilégios mínimos;
- crédito automático ao entregar um pedido e saque atômico via RPC;
- bucket público `estabelecimentos` com upload restrito ao dono;
- publicação Realtime da tabela `orders`.

Para sacar saldo no servidor, invoque `supabase.rpc("sacar_saldo", {
valor_saque: valor })` usando a sessão autenticada do dono.

## OTP pelo WhatsApp

O endpoint `/api/auth/send-sms` implementa o Send SMS Hook do Supabase e encaminha
o OTP para a API configurada em `WHATSAPP_API_URL`. Depois de publicar o app:

1. Configure `SUPABASE_SEND_SMS_HOOK_SECRET`, `WHATSAPP_API_KEY`,
   `WHATSAPP_API_URL` e `WHATSAPP_TELEFONE_ORIGEM` no servidor.
2. Em **Supabase > Authentication > Hooks > Send SMS**, selecione HTTP e informe
   `https://SEU-DOMINIO/api/auth/send-sms`.
3. Use no Supabase o mesmo segredo base64 definido em
   `SUPABASE_SEND_SMS_HOOK_SECRET`.

O hook precisa estar em uma URL pública. O Supabase hospedado não consegue chamar
`localhost`. Em produção, use HTTPS também na API do WhatsApp para não transmitir
a `X-API-Key` em texto claro.

## Docker / VPS

Com o `.env` preenchido, execute:

```bash
docker compose up -d --build
```

As variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são
passadas também como argumentos de build. As demais permanecem somente no
ambiente do container em execução. O serviço fica disponível na porta `3000`.
