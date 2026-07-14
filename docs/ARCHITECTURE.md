# Architecture

PanelForge begins as a modular Next.js monolith. App Router pages render on the server by default. Server actions are the mutation boundary; every action validates with a shared Zod contract, derives the actor from Auth.js, authorizes against project-scoped workspace membership, and then writes through Prisma.

## Boundaries

- `domain/`: framework-independent validation and policy vocabulary.
- `server/`: authorization, session, and future application services.
- `lib/`: configured infrastructure clients and site configuration.
- `app/actions/`: thin authenticated application entry points.
- `app/` and `components/`: server-first routes and interaction components.
- `prisma/`: the relational source of truth and reviewable migrations.

PostgreSQL is canonical. Story-bible records always carry a `seriesId`; queries and mutations scope on it. Soft deletion protects project history. Auth uses password hashes and JWT sessions for this slice; OAuth and database sessions can be added without changing the authorization boundary.

## ADR-001: Workspace membership is the authorization root

Status: accepted. A project belongs to one workspace and users reach it only through `WorkspaceMember`. This prevents scattered ownership columns and makes future contributor roles project-compatible. Owner-only destructive operations are checked server-side.

## ADR-002: Canon remains structured

Status: accepted. Character, location, and world-rule records are relational and carry canon state. AI output will later reference these IDs and cannot mutate them directly.

