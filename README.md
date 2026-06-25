# RBNY Academy — Athlete Daily Reports

A stripped-down copy of the staff dashboard's "Player / Day" report page,
gated by a single shared password instead of exposing the full AMS (no
testing tools, no comparisons, no admin tabs — just the daily GPS report).

## How it works

- `index.html` — one shared group password (prompt + sessionStorage, same
  pattern as the staff AMS), then the Player/Day report: pick any player,
  see their GPS session charts.
- `api/gps.js` — same shape as the staff AMS's `/api/gps`: fetches the
  `GPS_Daily` tab and returns all players' session data.
- `api/_sheet.js` — fetches a Google Sheet tab as CSV (sheet must be set to
  "Anyone with the link can view").

## Required environment variables (set in Vercel, never committed)

| Name | Value |
|---|---|
| `SHEET_ID` | The Google Sheet ID that contains the `GPS_Daily` tab |

## Changing the password

Edit the `PW` constant near the top of the `<script>` block in
`index.html` (currently `rbnyathletes2026`), commit, and push.

## Updating

Push to `main` — Vercel auto-deploys.