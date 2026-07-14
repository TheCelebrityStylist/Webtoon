# Domain model

User → Profile (including interface locale) → WorkspaceMembership → private Project (`Series` is the legacy persistence name). A project holds language/variant, type, premise, POV, tense, characters, locations, rules, chapters, and AI suggestions.

Chapter → ordered Scene → ordered StoryBeat. A scene contains structural purpose, conflict, stakes, outcome, TipTap JSON, searchable text, and revision number. Every successful save creates `ManuscriptVersion` attributed to a user. `AiSuggestion` records operation, locale, model, template version, result, exact context IDs, and decision.

Canon states are DRAFT, PROPOSED, CANON, DEPRECATED, ALTERNATE, and ARCHIVED. AI output is never canon. Project isolation and same-project links are invariants.
