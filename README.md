# Mega Descontos Serra

Plataforma de descontos da Serra Gaúcha: site público, passaporte anual, cupom no celular,
painel dos donos, painel da empresa e blog com SEO.

## Tecnologia
- Next.js 15 (App Router) + TypeScript
- Supabase (login, banco Postgres com RLS) — projeto `mega-descontos-serra` (São Paulo)

## Rodar no computador
1. Node.js instalado em `~/.local/node` (adicione `export PATH="$HOME/.local/node/bin:$PATH"` ao `~/.zshrc`).
2. Copie `.env.example` para `.env.local` e preencha a URL e a chave pública do Supabase.
3. `npm install` e depois `npm run dev`. O site abre em http://localhost:3000.

## Perfis
- **Donos (admin):** e-mails da tabela `admin_emails` viram admin ao criar a conta.
  Os e-mails ficam só no banco (não no código). Para adicionar outro dono, use Configurações no painel `/admin`.
- **Empresa (partner):** quem cadastra a empresa em `/seja-parceiro` e é aprovado pelos donos. Painel em `/empresa`.
- **Cliente (customer):** qualquer conta. Ativa o passaporte em `/passaporte` e resgata cupons. Área em `/conta`.

## Banco
As migrações estão em `supabase/migrations` e já foram aplicadas no projeto.
Regras de acesso (RLS) garantem que cada perfil só vê e altera o que é seu.
Resgate e validação de cupom rodam em funções do banco (`redeem_coupon`, `validate_coupon`).

## Pendências antes de lançar
- **E-mail de confirmação:** configurar SMTP próprio no Supabase (ex.: Resend). O SMTP padrão só entrega para membros da equipe do Supabase.
- **Pagamento:** o passaporte está em modo de teste (`settings.payments_mode = simulado`). Integrar Mercado Pago, Asaas ou Stripe.
- **Upload de imagens:** hoje capas usam link. Próximo passo: Supabase Storage.
- **Publicação:** deploy na Vercel e apontar o domínio megadescontosserra.com.br.
- **Conteúdo:** trocar os parceiros e posts de exemplo pelos reais.
