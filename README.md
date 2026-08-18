# SkillNovaGroup T&D API

API backend da plataforma de treinamento e desenvolvimento da SkillNovaGroup. A aplicação foi desenvolvida em Node.js com TypeScript, Express e PostgreSQL, e oferece autenticação, gestão de treinamentos, equipes, usuários, notificações e painel de monitoramento.

## Visão geral

A API centraliza o fluxo de gestão de capacitação da organização, incluindo:

- autenticação e autorização por JWT;
- gestão de usuários e papéis;
- cadastro e acompanhamento de treinamentos;
- registro de presença e avaliações;
- associação entre treinamentos e equipes;
- notificações por alerta;
- health check para verificação de disponibilidade do serviço;
- integração com Discord via webhook para alertas.

## Stack utilizada

- Node.js
- TypeScript
- Express
- PostgreSQL
- Knex.js
- JWT
- Zod
- CORS
- bcrypt
- Discord Webhook

## Estrutura do projeto

```text
src/
├── app.ts
├── server.ts
├── config/
│   └── cors.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── dashboard.controller.ts
│   ├── notification.controller.ts
│   ├── team.controller.ts
│   ├── training.controller.ts
│   └── user.controller.ts
├── database/
│   ├── knex.ts
│   └── seed.ts
├── dto/
│   ├── auth.dto.ts
│   ├── notification.dto.ts
│   ├── team.dto.ts
│   ├── training.dto.ts
│   └── user.dto.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── error-handler.ts
│   └── role.middleware.ts
├── routes/
│   ├── auth.routes.ts
│   ├── dashboard.routes.ts
│   ├── notification.routes.ts
│   ├── team.routes.ts
│   ├── training.routes.ts
│   └── user.routes.ts
├── services/
│   ├── auth.service.ts
│   ├── dashboard.service.ts
│   ├── discord.service.ts
│   ├── notification.service.ts
│   ├── team.service.ts
│   ├── training.service.ts
│   └── user.service.ts
└── zod/
    ├── auth.zod.ts
    ├── notification.zod.ts
    ├── team.zod.ts
    ├── training.zod.ts
    └── user.zod.ts
```

## Requisitos

Antes de iniciar o projeto, você precisa ter instalado:

- Node.js 20+
- pnpm
- PostgreSQL acessível
- (opcional) acesso ao webhook do Discord para notificações

## Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd SkillNovaGroup_TD-API
```

2. Instale as dependências:

```bash
pnpm install
```

3. Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
PORT=3000
JWT_SECRET=seu_jwt_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173

DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/SEU_WEBHOOK

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=skillnova
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
```

> Importante: nunca commite seu arquivo `.env` com credenciais reais. Mantenha ele apenas localmente.

## Scripts disponíveis

```bash
pnpm run dev
```

Inicia a API em modo de desenvolvimento com hot reload.

```bash
pnpm run build
```

Compila o projeto TypeScript para a pasta `dist`.

```bash
pnpm start
```

Executa a versão compilada em produção.

```bash
pnpm run seed:dev
```

Executa os seeds do banco em ambiente de desenvolvimento.

## Executando a API

### Desenvolvimento

```bash
pnpm run dev
```

A aplicação será iniciada na porta definida em `PORT` (padrão: 3000).

### Produção

```bash
pnpm run build
pnpm start
```

## Verificação de saúde

A API expõe o endpoint de verificação de disponibilidade:

```http
GET /health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "SkillNovaGroup T&D API",
  "database": "connected"
}
```

## Autenticação

A API usa JWT para autenticação. O token deve ser enviado no header:

```http
Authorization: Bearer <token>
```

### Fluxo de login

```http
POST /auth/login
```

Exemplo de corpo:

```json
{
  "email": "usuario@exemplo.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "user": {
    "id": "...",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "role": "TECHNICIAN",
    "teamId": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

## Roles e permissões

A aplicação utiliza perfis de acesso, como:

- MASTER
- MANAGER
- COORDINATOR
- TECHNICIAN

Esses papéis são validados por middlewares de autorização nas rotas principais.

## Rotas principais

### Autenticação

- `POST /auth/login`
- `GET /auth/me`

### Treinamentos

- `GET /trainings`
- `POST /trainings`
- `POST /trainings/sessions`
- `GET /trainings/me`
- `GET /trainings/me/todo`
- `GET /trainings/me/history`
- `PATCH /trainings/participants/:participantId/evaluation`
- `PATCH /trainings/sessions/:sessionId/participants/:participantId/attendance`
- `GET /trainings/:trainingId/sessions`
- `GET /trainings/sessions/:sessionId/participants`
- `PATCH /trainings/sessions/:sessionId/reschedule`
- `PATCH /trainings/sessions/:sessionId/cancel`

### Usuários e equipes

- `GET /users`
- `POST /users`
- `GET /teams`
- `POST /teams`

### Notificações

- `POST /notifications/alerts`

### Dashboard

- `GET /dashboard`

## Banco de dados

A API conecta-se ao PostgreSQL por meio do Knex, utilizando as variáveis do arquivo `.env`:

- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`

A conexão está configurada com `ssl: { rejectUnauthorized: false }` para cenários como Neon, comuns em ambientes hospedados.

## CORS

A API aceita requisições somente das origens listadas em `CORS_ORIGIN`.

Exemplo:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## Integração com Discord

A aplicação possui integração para envio de alertas em webhook do Discord. O campo responsável pela configuração é:

```env
DISCORD_WEBHOOK_URL
```

## Boas práticas recomendadas

- manter o `.env` fora do controle de versão;
- usar variáveis de ambiente para todos os dados sensíveis;
- validar payloads com Zod antes do processamento;
- registrar logs de erros e falhas de autenticação;
- manter a API protegida por JWT e permissões por papel;
- rodar a aplicação em ambiente com banco PostgreSQL estável e backups regulares.

## Contribuição

Contribuições são bem-vindas. Para colaborar:

1. crie uma branch para a funcionalidade ou correção;
2. implemente as mudanças;
3. valide com build e testes do ambiente local;
4. abra um pull request com descrição clara.

## Licença

Este projeto está sob a licença ISC.

## Contato

Para dúvidas ou suporte relacionado ao backend da SkillNovaGroup T&D API, entre em contato com a equipe responsável pelo projeto.
