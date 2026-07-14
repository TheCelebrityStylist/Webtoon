# Technical audit — 2026-07-14

Baseline `ff716aa` built successfully and had Auth.js, Prisma, workspace membership, project CRUD, and three story-bible records. The remote PR was closed at older SHA `88cdd26`; local work was one commit ahead and could not be pushed because credentials were absent.

Gaps against the private-writing direction: reader/discovery routes and copy; legacy `Series` persistence name; no locale preference; no project format/variant/POV/tense/premise; no chapters, scenes, beats, editor, autosave versions, AI provenance, export, private-file boundary, security headers, or E2E command. The first migration had not been applied to a live PostgreSQL service.

Current remediation adds the scene workflow and removes reader discovery. Remaining risks are listed in the delivery plan and final report; especially full localization, live database E2E, richer continuity, DOCX, and upstream dependency advisories.
