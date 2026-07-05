# Barber SaaS — Status do Projeto

> Documento de contexto: o que já foi construído, o que falta, e decisões/pegadinhas técnicas importantes. Ler junto com `CLAUDE.md` (convenções e roadmap original por fases).

Atualizado em: 2026-07-05

## Stack real (confira sempre antes de assumir)

- **Next.js 15.5.20** (App Router) — **atenção**: o projeto começou no Next 16.0.8, mas foi rebaixado pra 15.5.20 porque o builder da Vercel não conseguia empacotar o output do Next 16 em funções (ver "Pegadinhas técnicas" abaixo). Não atualizar para o Next 16 sem antes confirmar que a Vercel já suporta.
- React 19, TypeScript, Tailwind 4
- **Prisma 7** com **driver adapters** (`@prisma/adapter-pg`) — o `PrismaClient()` não aceita mais `url`/`datasources` direto, precisa do adapter.
- **NextAuth v5 (beta)** com três formas de login: Google OAuth, email+senha (Credentials), e link mágico via WhatsApp (mecanismo próprio, não é um provider do NextAuth).
- **Banco**: Postgres no **Supabase**, acessado via pooler (transaction-mode pra runtime, session-mode/direct pra migrations).
- **WhatsApp**: Twilio (atualmente em modo **Sandbox** — ver pendências).
- **Deploy**: Vercel, projeto `barber-saas-vkbc`.

## Status por fase (roadmap do CLAUDE.md)

- ✅ **Fase 0 — Fundação**: `.env`, cliente Prisma singleton, banco conectado (Supabase), migrations aplicadas.
- ✅ **Fase 1 — Estrutura visual**: identidade visual, layout do dashboard (sidebar/header), páginas placeholder, componentes base (Button, Card, Input, Table, EmptyState).
- ✅ **Fase 2 — Autenticação**: NextAuth (Google + email/senha + WhatsApp), proteção de rotas via middleware, papéis (USER/OWNER/ADMIN), onboarding (criar barbearia promove o usuário a OWNER).
- ✅ **Fase 3 — CRUD do núcleo**: Barbearia (via onboarding + Configurações), Serviços, Equipe — tudo via Server Actions, escopado por barbearia.
- ✅ **Fase 4 — Agendamentos**: lógica de disponibilidade (horário da barbearia + dias de folga + bloqueios pontuais por barbeiro), página pública de agendamento, login sem senha via link mágico no WhatsApp, painel do dono (agenda do dia na Visão Geral, listagem com confirmar/cancelar).
- ⬜ **Fase 5 — Comunicação** (notificações/e-mails de confirmação e lembrete): não iniciada.
- ⬜ **Fase 6 — Monetização** (Stripe/Mercado Pago, assinatura do SaaS): não iniciada.
- ⬜ **Fase 7 — Diferenciais** (IA, relatórios, deploy): deploy já feito (Vercel); IA e relatórios não iniciados.

## O que existe hoje, em detalhe

### Autenticação (`src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`)
- `auth.config.ts`: config "leve" do NextAuth (sem adapter/Prisma) — usada só pelo `middleware.ts`, pra não puxar o driver `pg` pra dentro do bundle do middleware (que roda em Edge Runtime).
- `auth.ts`: config completa (com `PrismaAdapter` + providers Google e Credentials/email-senha) — usada em Server Components, Server Actions e nas API routes.
- Sessão via **JWT** (não usa sessão em banco).
- Login por telefone é **próprio**, não é um provider do NextAuth: `src/lib/phone-auth.ts` gera um token, `src/app/api/magic-login/route.ts` verifica o token e cria o cookie de sessão manualmente (via `encode()` do `next-auth/jwt`).

### Agendamento (`src/lib/availability.ts`)
- `getAvailableSlots(staffId, serviceId, date)`: horários livres de um barbeiro específico, considerando: horário da barbearia (`Barbershop.openingHour/closingHour`), dias de folga (`Staff.daysOff`), bloqueios pontuais (`StaffTimeOff`), e agendamentos já existentes.
- `getAvailableSlotsForAnyStaff(barbershopId, serviceId, date)`: mesma coisa, mas mesclando todos os barbeiros (opção "qualquer barbeiro disponível").
- Grade de slots: 1 em 1 hora.
- `parseLocalDateString`/`formatLocalDateString`: **importante** — nunca usar `new Date("YYYY-MM-DD")` direto nesse projeto, vira o dia errado em fuso negativo. Sempre usar esses helpers.

### Página pública (`src/app/barbearia/[id]/page.tsx`)
- Fluxo sem JavaScript client-side pesado: tudo via forms GET/POST + Server Actions + redirects, estado guardado em query params.
- Etapas: 1) escolher serviço/barbeiro/data → 2) escolher horário → 3) identificar-se (nome+telefone → revisão do número → link mágico enviado → aguardando clique) → 4) confirmar agendamento.
- Tema forçado claro (`.theme-light-forced` no `globals.css`), com animações sutis de fade-in.
- Link "Número errado? Trocar" permite corrigir o telefone antes de reenviar.

### Painel do dono (`/dashboard/*`)
- Visão Geral: cards de estatísticas + agenda completa do dia.
- Agendamentos: listagem com Confirmar/Cancelar.
- Serviços / Equipe: CRUD completo.
- Equipe → editar: seção de "Bloqueios de horário" (folga pontual, começar mais tarde, fechar mais cedo, almoço maior — tudo é só um intervalo bloqueado num dia específico).
- Botão "Compartilhar" no header: copia o link público da barbearia (ou abre o share sheet nativo no celular).

## Pendências conhecidas (próximos passos imediatos)

1. **Google OAuth em produção**: falta cadastrar o redirect de produção no Google Cloud Console:
   ```
   https://barber-saas-vkbc.vercel.app/api/auth/callback/google
   ```
2. **Twilio ainda em modo Sandbox**: só números que fizeram o `join <código>` recebem mensagem. Pra clientes reais receberem, é preciso:
   - Sair do sandbox e aprovar um número de WhatsApp Business de verdade na Twilio (processo de verificação, leva alguns dias), **ou**
   - Migrar para o Meta WhatsApp Cloud API oficial.
   - Código já está pronto pra qualquer um dos dois (`src/lib/whatsapp.ts` cai pro mock automaticamente se as credenciais não estiverem configuradas).
3. **Limitação do link mágico multi-dispositivo**: se o cliente inicia o agendamento no computador mas abre o link do WhatsApp no celular, a sessão fica no celular (não há como sincronizar automaticamente entre dispositivos com essa abordagem).
4. Fases 5, 6 e 7 do roadmap (comunicação/e-mail, pagamentos, IA/relatórios) ainda não começaram.

## Pegadinhas técnicas descobertas (pra não perder tempo repetindo)

- **Next.js 16 não roda na Vercel (nesta data)**: o build passa localmente e na própria Vercel, mas o deployment fica com a aba "Functions" vazia e retorna 404 em qualquer rota (estática ou dinâmica), mesmo recriando o projeto do zero. Resolvido rebaixando pra Next 15.5.20. Se algum dia quiser voltar pro 16, testar num projeto Vercel separado antes.
- **Next 16 renomeou `middleware.ts` pra `proxy.ts`** (com aviso de depreciação pro nome antigo). No Next 15 (versão atual do projeto), é `middleware.ts` mesmo.
- **Prisma 7 exige driver adapter**: `new PrismaClient()` sem adapter dá erro. `src/lib/prisma.ts` usa `@prisma/adapter-pg` com a `DATABASE_URL` (pooler). O `DIRECT_URL` (conexão direta/session-mode) é usado só pelo `prisma.config.ts`, para migrations — são propósitos completamente desacoplados no Prisma 7.
- **`prisma migrate dev` não funciona neste ambiente não-interativo** quando há warning destrutivo (ex: dropar tabela, tornar coluna NOT NULL). Alternativa usada: gerar o SQL com `prisma migrate diff --from-config-datasource --to-schema=... --script`, criar a pasta de migration manualmente, e aplicar com `prisma migrate deploy`.
- **Servidor de dev com Prisma Client desatualizado**: sempre que uma migration adiciona/renomeia campo ou model, o servidor `next dev` já rodando **precisa ser reiniciado** — ele mantém o Prisma Client antigo em memória e os erros ficam silenciosos (RSC engole a exceção e mostra "nenhum resultado" em vez de erro).
- **`new Date("YYYY-MM-DD")` é uma cilada**: vira meia-noite UTC, que em fuso negativo (Brasil) cai no dia anterior. Usar `parseLocalDateString`/`formatLocalDateString` de `src/lib/availability.ts`.
- **Pastas com `_` no início são ignoradas pelo App Router** (ex: `src/app/api/_teste` nunca vira rota) — bom pra rotas de debug temporárias, mas fácil de esquecer.
- **Deployment Protection da Vercel** fica ligada por padrão ("Standard Protection / All Deployments") e bloqueia qualquer visitante sem conta Vercel — inclusive a página pública. Precisa mudar pra "Only Preview Deployments" em Settings → Deployment Protection.
- **`postinstall: prisma generate`** no `package.json` é obrigatório pra Vercel (senão o Prisma Client não é gerado no build). O `prisma.config.ts` exige `DIRECT_URL` disponível já no build (não só em runtime).
- **`trustHost: true`** no NextAuth evita ter que fixar `NEXTAUTH_URL` por domínio da Vercel (preview URLs mudam a cada deploy).

## Variáveis de ambiente necessárias

Ver `app/.env.example` para a lista completa (Timezone, banco, NextAuth, Google, Twilio). Todas precisam estar configuradas tanto no `.env` local quanto nas Environment Variables do projeto na Vercel (Production + Preview + Development).

## Como rodar localmente

```bash
cd app
npm install
npm run dev
```

Prisma:
```bash
npx prisma generate
npx prisma migrate dev --name <nome>   # local, se não der warning destrutivo
npx prisma studio                       # inspecionar o banco
```
