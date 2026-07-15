# Scale and performance

Budgets: landing LCP ≤2.5s p75; app shell ≤2s; editor interactive ≤2.5s for one scene; autosave server p95 ≤500ms excluding network; project search p95 ≤750ms; job submission ≤500ms. Architecture uses partial project queries, indexed tenant keys, optimistic saves, compact AI retrieval, background-job boundaries, and export streaming. Large lists require cursor pagination/virtualization before scale rollout.
