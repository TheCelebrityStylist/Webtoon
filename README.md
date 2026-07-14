# PanelForge

Connected story planning and production for vertical visual stories.

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
