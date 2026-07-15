# Architecture decision records

- Editor: TipTap/ProseMirror JSON plus searchable text; supports history and future annotations.
- Database: Prisma/PostgreSQL modular-monolith repository boundary.
- Authentication: Auth.js credentials now; Google identity provider after credential verification.
- Blog: typed local records behind a replaceable content adapter.
- Localization: stable typed keys; interface locale independent from project language.
- Jobs: persistent job abstraction before imports or long analysis; no in-request bulk work.
- Search: PostgreSQL scoped search now; provider-neutral index adapter at scale.
- Google tokens: AES-256-GCM versioned envelopes with environment-managed 32-byte keys.
- AI: task-specific provider adapter, minimal retrieved context, persisted provenance and decisions.
