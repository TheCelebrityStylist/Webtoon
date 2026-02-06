# EU Webtoon MVP + AI Stylist

## Environment variables

Set these in `.env.local` for local dev and in Vercel Project Settings:

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SITE_URL=
```

## Run locally

```bash
npm install
npm run dev
```

## AI Stylist worker

The app enqueues jobs in Upstash Redis under `lookjob:queue`.

Options to process jobs:

1) Client-triggered (default): the UI calls `POST /api/look/[jobId]/run` after creating a job.
2) Background worker: send a POST request to `/api/worker/look` on an interval or from QStash.

Example QStash target:

```
POST https://<your-domain>/api/worker/look
```
