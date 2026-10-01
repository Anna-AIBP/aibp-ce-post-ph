# AIBP C&E Philippines 2026 — Post-Event Report

Standalone Next.js app serving the post-event report for the AIBP
Conference & Exhibition Philippines 2026. Structured the same way as its
Thailand sibling (`aibp-ce-post-th`), which was itself modeled on Indonesia's
(`aibp-ce-post-id`) and Malaysia's (`aibp-ce-post-my`) — no live Sheets-backed
operational app to borrow Config/Sponsors from, so this repo's GAS backend is
fully self-contained — everything it serves lives on one report content
spreadsheet.

## What's here

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Server component — fetches report data, passes to `ReportView` |
| `app/ReportView.tsx` | The report itself (client component) |
| `app/report/page.tsx` | Alias so `/report` also works |
| `app/api/report/route.ts` | Server route that proxies the Apps Script backend |
| `middleware.ts` | Blocks direct/public hits to `/api/*` |
| `gas/PH_Report.gs` | Google Apps Script backend (deploy separately — see `gas/DEPLOY.md`). Named `PH_Report.gs`, not `Report.gs`, so it's never confused with the ID/MY/TH versions. |

## Content source

Everything on the report — sessions, awards, networking, testimonials,
participants, sponsors, and the hero copy/photos — comes from one Google
Sheet ("CEPH_Report_Content", `1VXqsy_6meqo98MkSwUFmiOPzZnnsxO6HP95JW1JL22Y`),
read live by `gas/PH_Report.gs` on every `getReport` call (5-minute cache).
Editing that sheet and waiting up to 5 minutes (or hitting
`[GAS_URL]?action=invalidateCache`) is the entire publish workflow — no
redeploy needed for content changes.

Event name, dates, and venue are hardcoded as `EVENT_DEFAULTS` in
`gas/PH_Report.gs` (since they don't change), but can be overridden by adding
a matching row to the sheet's `REPORT_META` tab (`Event Name` / `Event Day 1`
/ `Event Day 2` / `Venue`) without touching the script.

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `REPORT_GAS_URL` | **Yes** | Web-app URL of the deployed `gas/PH_Report.gs` Apps Script. Without it, `/api/report` returns `{"error":"no_gas_url"}` and the page renders empty. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | GA4 measurement ID for the shared "AIBP Apps" property. Omit to disable analytics. |

For local development, put the same values in a `.env.local` file (gitignored).

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Deploying

Vercel auto-detects Next.js — import the repo, add `REPORT_GAS_URL`, deploy.
The report is set to `noindex, nofollow`, so it won't appear in search
results even once a custom domain is attached. (Note: `ph.aibp.sg` is
already in use by a different, unrelated attendee-check-in app — this repo's
subdomain still needs to be decided with Aizat.)

## Colour scheme

Uses the Philippines secondary brand colour (`#854C9D`, "Philippines
Purple") per AIBP brand guidelines, with custom-derived dark/mid gradient
shades — see `app/ReportView.tsx` and `app/globals.css`. Everything else
(typography, layout, section structure) matches
`aibp-ce-post-id`/`aibp-ce-post-my`/`aibp-ce-post-th` exactly.

## Known gaps to fill in

- `HERO_ENDORSEMENTS` in `app/ReportView.tsx` is carried over from the
  Thailand build and needs PH-specific endorsement logos swapped in (or
  cleared if none apply).
- Event edition number (e.g. "55th") is unconfirmed — left out of
  `eventName` in `gas/PH_Report.gs`; add via a `Event Name` row in
  `REPORT_META` once confirmed.
- Venue is `Manila Marriott Hotel` (shortened from "Manila Marriott Hotel @
  Newport World Resorts" per the public aibp.sg event page) — confirm this
  matches what should display.
- AWARDS, AWARDS_JUDGES, AWARDS_QUOTES, TESTIMONIALS, and STATS_BREAKDOWN are
  still empty on the content sheet — no winner/testimonial/seniority data was
  available at build time.
- Sponsor logos and the OG share image are pulled from the public aibp.sg
  Philippines event page's known assets — double check these still match
  before going live.
