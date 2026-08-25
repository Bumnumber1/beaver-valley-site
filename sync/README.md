# Crew portal cloud storage — 2-minute setup

The Staff Only crew portal saves everything in the contributor's browser and hands work over
as export files. To ALSO store every keystroke server-side (a Google Sheet in your Drive that
updates itself about a minute after Sam types), do this once:

1. Go to **script.google.com** → **New project** (signed in as your normal Google account).
2. Delete the starter code and paste in the whole of `sync/google-apps-script.gs`.
3. **Deploy → New deployment → Web app.**
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
4. Click **Authorize**, pick your account, and accept (Google will warn because the script is
   your own unreviewed code — Advanced → Go to project). This lets it write the Sheet.
5. Copy the **Web app URL** it gives you (ends in `/exec`).
6. Open `js/crew.js`, put that URL in `var SYNC_URL = '';` near the top, commit, push.

That's it. A spreadsheet named **"Beaver Valley Crew Submissions"** appears in your Drive:

- **Log** — every push, timestamped (full history; nothing is ever lost).
- **Latest** — each contributor's newest complete data as JSON.
- **Roster SAM** (etc.) — the newest data unpacked to one row per character: group, number,
  name, rank, role, ship, physical description, personality, world goal. Read or
  File → Download → CSV straight from Sheets.

Notes:

- The portal shows the contributor a small "Cloud: saved" note; while offline it says work is
  kept locally and retries on the next change.
- Portraits are **not** pushed on every change (too heavy) — they travel inside the
  "Export & send to Jeremy" file, which the Review console on the portal renders and
  converts to CSV.
- Until the URL is set, nothing breaks: the portal simply runs in local + export-file mode.
