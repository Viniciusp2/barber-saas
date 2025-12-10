
---

# 📘 **README.md — barber-saas**

````md
# Barber SaaS

Sistema SaaS para barbearias com agendamentos online, gestão de serviços, autenticação com Google, pagamentos integrados e suporte a IA para automação e assistente de voz. Desenvolvido com Next.js, TypeScript, PostgreSQL e Docker, focado em escalabilidade, desempenho e facilidade de uso.

---

## 🚀 Tecnologias Principais
- Next.js 14 (App Router)
- React + TypeScript
- PostgreSQL + Prisma ORM
- Docker & Docker Compose
- NextAuth (OAuth Google)
- Stripe / Mercado Pago (pagamentos)
- IA para automação e assistente de voz
- TailwindCSS

---

## 📦 Como rodar o projeto com Docker

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/barber-saas.git
cd barber-saas
````

2. Crie o arquivo `.env` baseado em `.env.example`.

3. Suba os containers:

```bash
docker-compose up -d
```

4. Acesse:

```
http://localhost:3000
```

---

## 🗄️ Estrutura inicial do projeto

```
/src
  /app
    /api
    /auth
    /dashboard
  /components
  /lib
  /services
/prisma
  schema.prisma
docker-compose.yml
Dockerfile
```

---

## 🔐 Autenticação

Autenticação via **NextAuth + Google OAuth**.
O usuário pode acessar como cliente, barbeiro ou dono da barbearia.

---

## 💳 Pagamentos

Integração planejada com:

* Stripe (preferência)
* Mercado Pago (alternativa nacional)

Utilizada para:

* Assinaturas mensais do SaaS
* Pagamentos de serviços da barbearia (opcional)

---

## 🤖 IA e Automação

* Sugestão inteligente de horários
* Assistente de voz integrado (IAPO)
* Classificação automática de pedidos
* Geração de respostas rápidas para clientes

---

## 🗺️ Roadmap (versão inicial)

### MVP

* [ ] Autenticação Google
* [ ] Dashboard da barbearia
* [ ] CRUD de serviços e equipe
* [ ] Sistema de agendamentos
* [ ] Notificações e emails
* [ ] Pagamentos recorrentes (SaaS)
* [ ] IA para sugestões de horários

### Versão 2.0

* [ ] Aplicativo mobile
* [ ] Assistente de voz completo
* [ ] Relatórios avançados
* [ ] IA para marketing automático

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

---

## 🤝 Contribuição

Pull requests são bem-vindos. Para grandes mudanças, abra uma issue primeiro para discutirmos o que deseja modificar.

---

