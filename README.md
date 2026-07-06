<div align="center">

# 💈 BarberSaaS

**Agendamento online e gestão completa para barbearias**, em uma plataforma multi-tenant onde cada barbearia tem sua própria página pública, equipe, serviços e agenda — isolados uns dos outros.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

</div>
<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,prisma,postgres,supabase,vercel" />
</p>


## O que é

O BarberSaaS resolve dois problemas ao mesmo tempo:

- **Para o dono da barbearia**: um painel para cadastrar serviços, equipe, horários de funcionamento e acompanhar a agenda do dia, sem depender de agenda de papel ou grupo de WhatsApp.
- **Para o cliente final**: uma página pública de agendamento (sem precisar instalar app ou criar conta) onde escolhe serviço, barbeiro, data e horário disponível, e recebe a confirmação na hora.

Cada barbearia cadastrada vira um **tenant isolado**: seus próprios serviços, sua própria equipe, seus próprios clientes e agenda — tudo na mesma aplicação, sem vazar dado de uma barbearia pra outra.

---

## 🎨 Temas visuais

Além de customizar cores por marca, a aplicação vem com **4 temas prontos**, trocáveis a qualquer momento (dashboard e página pública) por um seletor no canto da tela — a escolha fica salva no navegador do usuário. Cada tema tem sua própria paleta, tipografia e nível de "vida" (gradientes, brilho, animações):

| Clássico | Moderno |
|---|---|
| ![Tema Clássico](docs/img/theme-classic.png) | ![Tema Moderno](docs/img/theme-modern.png) |
| Serifada (Fraunces) + tons terrosos — a identidade padrão da marca. | Space Grotesk + neutros frios, com acentos em degradê indigo→rosa. |

| Neon | Pastel |
|---|---|
| ![Tema Neon](docs/img/theme-neon.png) | ![Tema Pastel](docs/img/theme-pastel.png) |
| Exo 2, fundo escuro e botões com brilho (glow) ciano/magenta. | Quicksand, tons suaves de rosa e lavanda. |

---

## ✨ Funcionalidades

### Painel do dono (`/dashboard`)
- Login com Google ou e-mail/senha, com onboarding automático (criar a barbearia já promove o usuário a `OWNER`)
- Visão geral com faturamento do mês, gráfico dos últimos 7 dias e agenda do dia
- CRUD completo de **serviços** e **equipe**
- Bloqueios de horário por barbeiro (folga, chegar mais tarde, sair mais cedo, almoço estendido)
- Configurações da barbearia (endereço, WhatsApp de contato, confirmação automática de agendamento)
- Botão de compartilhar o link público da barbearia

### Página pública de agendamento (`/barbearia/[id]`)
- Fluxo em 3 passos: serviço + barbeiro → horário disponível → confirmação
- Disponibilidade calculada em tempo real (respeita horário de funcionamento, folgas, bloqueios e conflitos com outros agendamentos)
- Checkout de convidado: só pede nome e telefone — sem necessidade de criar conta
- Página de confirmação com opção de adicionar ao Google Calendar, ver rota no mapa, remarcar ou cancelar

<p align="center">
  <img src="docs/img/booking-confirmacao.png" width="420" alt="Página de confirmação de agendamento" />
</p>

### Dashboard em ação

<p align="center">
  <img src="docs/img/dashboard-overview.png" alt="Visão geral do dashboard" />
</p>

---

## 🛠️ Stack

| Camada | Tecnologias |
|---|---|
| **Front-end** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Back-end** | NextAuth v5 (beta), Prisma 7 (driver adapters), Zod, Server Actions |
| **Banco de dados** | PostgreSQL (Supabase, via connection pooler) |
| **Infraestrutura** | Vercel, Google OAuth |

### Decisões de arquitetura
- **Multi-tenant** desde o schema: toda entidade operacional pertence a uma `Barbershop`
- **App Router + Server Actions**: CRUDs e o fluxo de agendamento não dependem de API routes separadas
- **Sem JavaScript client-side pesado na página pública**: o fluxo de agendamento é `<form>` GET/POST + Server Actions + redirects, com estado guardado em query params — funciona até com JS desabilitado
- **Sessão via JWT** (Auth.js), sem sessão em banco

---

## 📂 Estrutura do projeto

```text
app/
├── src/
│   ├── app/
│   │   ├── dashboard/          # painel do dono (CRUD, configurações, visão geral)
│   │   ├── barbearia/[id]/     # página pública de agendamento
│   │   ├── agendamento/[id]/   # confirmação/gestão de um agendamento
│   │   ├── login/ cadastro/ onboarding/
│   │   └── api/
│   ├── components/
│   │   ├── dashboard/          # sidebar, header, gráficos
│   │   └── ui/                 # Button, Card, Input, Table...
│   ├── lib/                     # prisma client, disponibilidade, autenticação por telefone
│   ├── auth.ts / auth.config.ts
│   └── middleware.ts
├── prisma/
│   └── schema.prisma
└── public/
```

---

## 🚀 Rodando localmente

### Pré-requisitos
- Node.js 20+
- Um banco PostgreSQL (local, Docker ou Supabase)

### Passo a passo

```bash
git clone https://github.com/Viniciusp2/barber-saas.git
cd barber-saas/app
npm install
```

Crie um `.env` a partir do `.env.example`:

```env
TZ="America/Sao_Paulo"

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barber?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/barber?schema=public"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="coloque_uma_chave_segura_aqui"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Aplique as migrations e suba o projeto:

```bash
npx prisma migrate dev
npm run dev
```

Acesse **http://localhost:3000**.

---

## 📈 Roadmap

### ✅ Feito
- Autenticação (Google + e-mail/senha), papéis e onboarding automático
- Multi-tenant completo (Barbearia, Serviços, Equipe via Server Actions)
- Motor de disponibilidade (horário de funcionamento, folgas, bloqueios, conflitos)
- Fluxo público de agendamento ponta a ponta (escolha → horário → confirmação → remarcar/cancelar)
- Sistema de temas visuais (4 temas, com fontes e paletas próprias)

### 🚧 Próximos passos
- Notificações automáticas (WhatsApp / e-mail) de confirmação e lembrete
- Pagamentos (Stripe / Mercado Pago) e assinatura do SaaS
- Loja de produtos, programa de fidelidade, galeria de cortes
- Relatórios e assistente de atendimento com IA

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido por **Vinicius Ribas**.

Sugestões e contribuições são bem-vindas — abra uma **Issue** ou envie um **Pull Request**.
