<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://img.shields.io/badge/backers-open%20collective-blue.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://img.shields.io/badge/sponsors-open%20collective-green.svg" alt="Sponsors on Open Collective" /></a>
<a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Backend API for SIGE (Sistema de Gestión Estudiantil) built with [NestJS](https://github.com/nestjs/nest), [Prisma 7](https://www.prisma.io/), and PostgreSQL.

## Tech Stack

- **Framework:** NestJS 11
- **ORM:** Prisma 7 with `@prisma/adapter-pg`
- **Database:** PostgreSQL 16 (Docker)
- **API Docs:** Swagger UI at `/api`
- **Language:** TypeScript 5.7+

## Project setup

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20.19.0
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)

### Install and configure

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd sige-backend
pnpm install

# 2. Create your .env from the sample
cp .env.sample .env

# 3. Start PostgreSQL
docker compose up -d

# 4. Run initial migration
pnpx prisma migrate dev --name init

# 5. Generate Prisma Client
pnpx prisma generate
```

## Environment variables

Copy `.env.sample` to `.env` and adjust as needed:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/sige_db` |
| `PORT` | Server listen port | `3000` |

## Compile and run the project

```bash
# development
pnpm run start

# watch mode (recommended)
pnpm run start:dev

# production mode
pnpm run start:prod
```

The API will be available at `http://localhost:3000`.

## API Documentation (Swagger)

Once the server is running, open [http://localhost:3000/api](http://localhost:3000/api) to access the Swagger UI.

## Database

### Prisma commands

```bash
# Create a new migration after schema changes
pnpx prisma migrate dev --name <migration_name>

# Apply pending migrations (production)
pnpx prisma migrate deploy

# Regenerate Prisma Client
pnpx prisma generate

# Open Prisma Studio (visual DB browser)
pnpx prisma studio
```

### Docker

```bash
# Start PostgreSQL
docker compose up -d

# Stop PostgreSQL
docker compose down

# Stop and remove volumes (deletes all data)
docker compose down -v
```

## Run tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## Lint and format

```bash
# lint with auto-fix
pnpm run lint

# format with prettier
pnpm run format
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Discord](https://discord.gg/G7Qnnhy)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
