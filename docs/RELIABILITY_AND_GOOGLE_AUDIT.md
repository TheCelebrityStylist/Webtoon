# Reliability and Google capability audit

## Proven production code paths

- Auth.js credentials and Google account authentication are server-side and deployment-gated.
- PostgreSQL/Prisma is the canonical production store.
- Project and scene reads enforce workspace/project access.
- Scene saves use optimistic revisions, transactional manuscript versions, and idempotent client mutation IDs.
- The production TipTap editor journals every transaction to IndexedDB before its debounced server request, retains failed/offline mutations, restores local drafts, retries with bounded backoff, and exposes separate local/cloud/conflict states.
- Local named/automatic safety versions and per-scene JSON backups are available in the editor. A project-scoped JSON archive route is also available.
- Google OAuth uses incremental service scopes, encrypted refresh tokens, a signed and one-time database-backed OAuth state, and exact callback host/path validation.
- Server routes call official Google Drive, Docs, Sheets, and Calendar REST APIs.
- Google Docs export creates a new document rather than overwriting an existing one.
- Google Sheets export creates a new spreadsheet rather than treating Sheets as canonical data.

## Partial production code paths

- Google Docs preview reads paragraphs and heading styles, but does not yet preserve all inline styles or unsupported-format details.
- Google Sheets preview detects a header row and returns row data, but does not yet provide the full mapping, background import, row retry, import history, or undo transaction.
- Drive file listing is restricted to files available under the granted `drive.file` scope; there is no Google Picker UI or folder-selection flow.
- Calendar can create project-linked deadline events, but does not yet include a complete deadline management UI or synchronization history.
- Server manuscript versions are created on each accepted save and can be listed/restored through an API, but the production editor currently exposes local version history rather than the server version history UI.

## Demo-only paths

- `/studio-demo` is a browser-isolated seeded product environment. It never reads or writes PostgreSQL and never calls Google.
- `/google` is an explicitly labelled seeded marketing demonstration.

## Not implemented or not externally proven

- Confirmed Google Docs import transaction, source reference, import report, and undo.
- Full Google Sheets mapping/import/export catalogue and row-level recovery.
- Export history and explicit update of an earlier Google export.
- DOCX/PDF generation and Google Docs backup scheduling.
- Daily managed server backups and tested restore operations.
- Deployed Google credential verification. This requires valid Google Cloud credentials, consent-screen configuration, redirect URIs, a database, and a real user account.
- The 30-step deployed Playwright journey. It requires the infrastructure above and a browser runner that can launch successfully.

No UI or report should describe the partial or demo-only paths as a complete Google integration.
