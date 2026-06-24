# RBNY Academy — Athlete Daily Reports

A minimal, passcode-gated site where each athlete can view only their own
most recent GPS session (no rosters, no comparisons, no other players'
data is ever sent to the browser).

## How it works

- `index.html` — passcode entry, then a single-player report view.
- `api/report.js` — takes a passcode, looks it up against the `PLAYER_CODES`
  env var (a JSON map of `passcode -> player name`), then fetches and
  returns only that player's rows from the `GPS_Daily` tab.
- `api/_sheet.js` — fetches a Google Sheet tab as CSV (sheet must be set to
  "Anyone with the link can view").

## Required environment variables (set in Vercel, never committed)

| Name | Value |
|---|---|
| `SHEET_ID` | The Google Sheet ID that contains the `GPS_Daily` tab |
| `PLAYER_CODES` | JSON map, e.g. `{"4821":"Jane Smith","7790":"John Doe"}` |

`PLAYER_CODES` is the actual access-control list — keep it out of git and
out of the spreadsheet itself. Rotate a player's code by changing their
entry and redeploying (or just updating the env var, no redeploy needed).

## Updating

Push to `main` — Vercel auto-deploys.