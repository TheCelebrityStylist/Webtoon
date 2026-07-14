# Domain model

`User` has one `Profile` and memberships in `Workspace`. A `WorkspaceMember` has one explicit role. A `Series` (called project in creator-facing language) belongs to a workspace and owns its story graph.

This migration establishes the first graph edges:

- Series → Characters
- Series → Locations
- Series → World rules
- Character → current Location (optional, validated to the same project)

All project records have stable IDs, ownership, timestamps, canon status where relevant, scoped indexes, and soft deletion where user history matters. Later migrations add episodes, scenes, beats, panels, state snapshots, knowledge facts, timeline events, and version records without replacing these roots.

Invariants:

1. Every studio read requires membership in the owning workspace.
2. Writer/editor/owner may mutate project and bible data; only owner may delete a project.
3. A relationship cannot cross projects unless a future explicit shared-universe model permits it.
4. Creator-approved canon is authoritative; generated suggestions are separate records.

