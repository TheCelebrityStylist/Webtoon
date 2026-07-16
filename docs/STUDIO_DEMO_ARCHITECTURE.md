# Studio demo architecture

`/studio-demo` uses a typed, browser-local adapter. It never calls Prisma, creates an account, or requests Google access.

- `lib/demo/types.ts` owns the Zod-validated domain schema.
- `lib/demo/fixtures.ts` owns deterministic project data.
- `lib/demo/persistence.ts` owns the versioned `localStorage` boundary (`morrow.demo.v1`) and restores fixtures when stored data is old or corrupt.
- `components/studio-demo/DemoProvider.tsx` exposes immutable mutations, debounced persistence, save feedback, and a bounded undo history.
- `components/studio-demo/Workspaces.tsx` contains application views that consume the adapter. A future production adapter can implement the same domain operations without duplicating the views.

The browser is the isolation boundary. Reset and sign-out can remove the local record. No production data is read or written.
