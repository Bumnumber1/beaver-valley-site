# Crew portal cloud storage — 2-minute setup

**The portal is ONE SHARED LIVE DOCUMENT.** All three logins (SAM / JEREMY / MALCOLM) work on
the same manifest: every slot carries a last-edited timestamp, edits push to the receiver
~15 s after typing stops (45 s max during continuous typing), and every open portal pulls the
merged copy on login, after each push, on tab focus, and once a minute. Per slot the newest
edit wins; a slot someone is actively typing in is never overwritten under them. Portraits are
shared the same way (Drive file ids), and the **Crew Dispatches** board at the top is a shared
notes feed — that's the built-in way to leave each other messages.

Maintenance: `POST {"format":"beaver-valley-crew-admin","key":"<JEREMY's password>",
"op":"clear-messages"}` to the /exec URL wipes the dispatch board. The receiver also keeps
rolling document backups (`bvcrew-shared-doc.backup-*.json`, newest 20, one per 30 min of
activity) in the "Beaver Valley Crew Data" Drive folder for disaster recovery.

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

- **Log** — every push, timestamped, with who sent it (full history).
- **Roster** — the shared document unpacked to one row per character: group, number,
  name, rank, role, ship, physical description, personality, world goal, last-edited time.
  Read or File → Download → CSV straight from Sheets. Rebuilt at most every 2 minutes.

Portraits: the moment a contributor uploads (or replaces/removes) a character portrait, the
image is pushed to the script, saved as a real file in Drive under
**"Beaver Valley Crew Portraits/SHARED/"** (always the newest version per character),
logged with its link on the **Portraits** sheet tab — and **emailed to
bumnumber1@gmail.com immediately with the images attached**. Every other open portal picks
the new portrait up within about a minute. Export also re-pushes the full portrait set as a
safety net.

Notes:

- The portal shows the contributor a small "Cloud: saved" note; while offline it says work is
  kept locally and retries on the next change.
- Until the URL is set, nothing breaks: the portal simply runs in local + export-file mode.
