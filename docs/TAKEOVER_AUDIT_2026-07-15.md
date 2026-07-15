# Morrow takeover audit — 2026-07-15

## Repository and pull request state

- Repository: `TheCelebrityStylist/Webtoon`
- Active local branch: `product-foundation`
- Current branch commit at audit start: `7f39525`
- GitHub PR #2 (`Build product foundation`) is merged and closed. Its recorded head was `88cdd26`; it does not contain the later Morrow work.
- No open pull request currently represents the active branch.
- Eight untracked files with names ending in ` 2.ts` or ` 2.tsx` existed at audit start. They are preserved as user-owned files and excluded from this delivery unless their ownership is resolved.

## Evidence-backed current state

### Public experience

- The homepage contains useful stateful demonstrations, but its hero began as an illustrated manuscript with a single warning rather than an application-grade editor.
- Nine major commercial routes were rendered by one shared `FeaturePage` choreography. This directly caused the repeated hero, three proof tabs, proof console, two rows, CTA, and footer pattern identified in the brief.
- Pricing had real centralized prices, billing periods, and currencies, but no guided chooser, estimator, detailed limits, or layered comparison.
- The blog has one live English pillar guide at 2,775 words. Metadata, schema, RSS, sitemap, a downloadable worksheet, and an interactive checklist exist; multilingual clusters, content validation, pagination, and a credible index library do not.

### Authenticated product

- Existing foundations: credentials authentication, Google sign-in configuration, private workspaces, workspace memberships, project scoping, project format/language fields, TipTap scene editing, optimistic scene revisions, manuscript versions, characters, locations, world rules, search, Markdown export, and evidence-oriented AI suggestion records.
- Missing or incomplete: project-specific roles, most required story-domain records, audit logs, revision plans, translation domain, branch isolation, collaboration, job infrastructure, quotas, subscriptions, and usage ledgers.

### Google

- Existing foundations: OAuth state validation, encrypted refresh-token storage, incremental service scopes, Drive file listing, Docs and Sheets preview endpoints, Calendar deadline creation, and Docs/Sheets export endpoints.
- Missing or incomplete: disconnect/revocation UI, confirmed Docs import mutation/report, Sheets mapping and row-level import jobs, export history, Drive Picker, Calendar update/unlink, provider-backed integration tests, retries, and job progress.

### Domain and scale

- Prisma defines 17 models and 8 enums. It does not yet model the majority of the required story, revision, translation, integration-job, billing, or audit domain.
- The scene endpoint uses optimistic revision numbers and manuscript versions, which is a sound foundation.
- Cursor pagination, background jobs, object storage, caching, rate limiting, tracing, and production monitoring are not implemented.

### Quality

- Test inventory at audit start: 24 unit tests and 4 public-route E2E tests across three files.
- Missing: authenticated integration tests, accessibility smoke tests, localization completeness, authorization matrix, concurrency, import/export, visual regression, broken-link, content-validation, schema-validation, placeholder, and secret-scan commands.
- `npm ci` reports dependency audit findings that require separate triage; no forced upgrades should be applied without compatibility review.

## Architectural direction

Keep the modular monolith, PostgreSQL, Prisma, Next.js server boundaries, TipTap, Zod validation, and evidence-citing AI records. Add domain modules and migrations incrementally rather than generating one speculative schema. Public demonstrations should reuse typed demo data and interaction primitives, not authenticated persistence services or fake network activity.

## First corrective implementation

The first implementation replaces the repeated choreography on Product, Writing, Planning, Characters, Review, Formats, Languages, Google, and Pricing with separate stateful experiences. Shared visual tokens remain; page behavior and composition now follow the task being sold. The homepage continuity interaction is also upgraded to show evidence and three explicit decisions.
