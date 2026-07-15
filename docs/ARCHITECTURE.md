# Architecture

Asterism is a private-writing modular monolith. Server components read scoped data; server actions and typed route handlers validate, authenticate, authorize, and mutate. PostgreSQL/Prisma is canonical.

Boundaries: `domain/` owns contracts and deterministic policies; `server/` owns access checks; `app/actions/` orchestrates mutations; `app/api/` handles autosave, AI, and exports; `lib/` configures infrastructure/localization; UI components contain interaction only.

## ADR-001: Workspace membership is the authorization root

Accepted. Every project belongs to one workspace. Reads, manuscript saves, AI context, search, and exports derive access from membership.

## ADR-002: TipTap for manuscripts

Accepted. Prose is a structured ProseMirror JSON document plus searchable plain text. TipTap supplies accessible editing, schema extensibility, history, and future annotations. A debounced client sends incremental scene documents with an optimistic revision; the server rejects stale saves and records immutable versions.

## ADR-003: AI suggestions are provenance records

Accepted. Context selection is project-scoped and persisted by ID. Results start pending; decisions never silently mutate prose or canon.
