# Delivery plan

## Current acceptance criteria: Foundation + First Creator Project

- Repository installs, lints, typechecks, tests, and builds in CI.
- A person can create an account, sign in/out, and cannot enter `/studio` anonymously.
- An owner can create, reopen, validate, edit, and soft-delete a draft project.
- An authorized creator can add structured characters, locations, and world rules; characters may link only to locations in the same project.
- Project search covers the first story-bible record types.
- Empty, loading, error, not-found, and permission-safe states exist.
- PostgreSQL migration, environment contract, seed, authorization helpers, and setup documentation exist.

## Next slices

1. Character state and knowledge timeline with deterministic continuity checks.
2. Episode → scene → beat planning and version history.
3. Panel planning, uploads, vertical preview, review, and approvals.
4. Publishing and entitlement-protected reader delivery.

