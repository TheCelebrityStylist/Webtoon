# Blog architecture

Decision: typed local content records for the first release, isolated in `lib/blog.ts` behind a stable `BlogArticle` model. Routes never embed production article bodies in page components. This supports later MDX or headless-CMS adapters without changing cards, metadata, categories, tags, RSS, or related-content logic. Seed articles are explicitly PanelForge-owned editorial demonstrations.
