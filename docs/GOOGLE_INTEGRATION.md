# Google integration

Authentication and Workspace consent are separate. Each service requests one incremental scope: Drive file, Docs document, Sheets spreadsheet, or Calendar events. OAuth state is HMAC-signed and user-bound. Refresh tokens use AES-256-GCM with a versioned envelope and never enter client components or logs. Sheet previews return row-level validation. Calendar values require an IANA timezone.

The OAuth connection/callback and encrypted persistence are implemented. Live Doc import, Sheet import/export, Drive picker, and Calendar creation require credentials, provider verification, background jobs, preview UI, and end-to-end testing before they can be described as operational.
