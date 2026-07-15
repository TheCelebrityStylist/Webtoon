# Privacy and security

- Projects are private and reachable only through workspace membership.
- Scene, export, search, save, and AI operations are checked server-side.
- Saves create attributable immutable versions and reject stale revisions.
- Exports are authenticated and `no-store`.
- Passwords are bcrypt hashes; Auth.js manages sessions.
- AI context is scoped and cannot cross project boundaries.
- Manuscript content must not enter logs or analytics.

Outstanding before deployment: private object storage, access logs, retention controls, AI consent/provider disclosure, and live database security tests.
