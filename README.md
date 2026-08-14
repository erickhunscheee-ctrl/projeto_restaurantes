# Marmita Já

Aplicação web em Next.js 15 conectada ao Supabase.

## Configuração local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env.local` e preencha as chaves.
3. Vincule o projeto com `npx supabase link --project-ref SEU_PROJECT_REF`.
4. Aplique o banco com `npx supabase db push`.
5. Inicie com `npm run dev`.

Para atualizar os tipos após uma migration, autentique a CLI com
`npx supabase login` e execute `npm run types:supabase`. O script identifica o
project ref pela `NEXT_PUBLIC_SUPABASE_URL` e grava
`lib/supabase/database.types.ts`.

## Organização interna

As rotas HTTP fazem apenas autenticação, validação e tradução da resposta.
Regras compartilhadas ficam em `lib/services`, contratos de entrada em
`lib/contracts` e carregamento das telas administrativas em `hooks`. Dessa
forma, admin e restaurante reutilizam as mesmas operações de cardápio e
WhatsApp sem duplicar regras de negócio.

A chave `SUPABASE_SERVICE_ROLE_KEY` é usada somente no servidor e nunca deve ser exposta no navegador.

## Banco

As migrations criam perfis, estabelecimentos, pratos, pedidos, carteiras,
transações e o sistema próprio de OTP. O OTP fica na tabela
`phone_otp_challenges`, com expiração e limite de tentativas.

## OTP pelo WhatsApp

O login usa OTP próprio, sem provider ou hook de SMS do Supabase.
`/api/auth/request-code` gera e envia o código pela API configurada em
`WHATSAPP_API_URL`; `/api/auth/verify-code` valida o código, cria o usuário e
inicia a sessão.

Configure no servidor `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_API_KEY`,
`WHATSAPP_API_URL` e `WHATSAPP_TELEFONE_ORIGEM`.

O acesso ao painel administrativo usa `ADMIN_USUARIO` e `ADMIN_SENHA` definidos
somente no servidor. `ADMIN_EMAIL` identifica a conta técnica criada no
Supabase para manter a sessão administrativa.

Em produção, use HTTPS também na API do WhatsApp para não transmitir a
`X-API-Key` em texto claro.

## Painel do restaurante

O administrador da plataforma cria o acesso do responsável dentro do cadastro
do restaurante. O responsável entra em `/restaurante/login` e pode administrar
seus próprios pratos, componentes e a sessão do WhatsApp. A autorização usa o
campo `establishments.owner_id`; o navegador nunca escolhe o estabelecimento
das operações.

Além de `WHATSAPP_API_URL`, configure `WHATSAPP_API_BASE_URL` com a raiz da API,
sem `/enviar`. Essa URL é usada pelos endpoints de criação, status, reconexão,
QR Code e remoção das sessões.

## Docker / VPS

Com o `.env` preenchido, execute:

```bash
docker compose up -d --build
```

As variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são
passadas como argumentos de build. As demais permanecem somente no ambiente do
container em execução. O serviço fica disponível na porta `3000`.
