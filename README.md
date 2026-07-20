# Morrow

Warm, private writing software for planning, drafting, revising, and translating long stories.

## Local setup

Requirements: Node 22 and PostgreSQL 16+.

1. Copy `.env.example` to `.env` and replace `AUTH_SECRET` with `openssl rand -base64 32`.
2. Create the PostgreSQL database named in `DATABASE_URL`.
3. Run `npm ci`.
4. Run `npm run db:generate && npm run db:migrate`.
5. Optional local-only example: `npm run db:seed` (login `demo@localhost.test`, password `StudioDemo!2026`).
6. Run `npm run dev`.

Quality gate: `npm run lint && npm run typecheck && npm test && npm run build`.

The seed refuses to run when `NODE_ENV=production`. Environment values are validated at startup. Never commit `.env`.

## Deployment authentication

- Production requires `AUTH_SECRET` and `DATABASE_URL`. Google sign-in appears only when both Google OAuth variables are configured.
- Preview demo sign-in is enabled only when Vercel sets `VERCEL_ENV=preview`, `AUTH_SECRET` exists, and `AUTH_PREVIEW_DEMO=true` is scoped to Preview. It creates a signed temporary session, never a database account.
- Register explicit Google callback URLs for production. Arbitrary preview domains do not receive wildcard OAuth redirects.
