# Architecture

**What it is:** a single static page, `index.html` (about 180 KB, inline CSS and vanilla JS), for the Fransgivin potluck (Sat Nov 21, 6:30pm). Friends open a link, see what everyone is bringing, and pledge a dish.

## Components
- `src/` holds the parts: `head.html`, `style.css`, `body.html`, `core.js` (state, data, rendering, form, polling), `dedupe.js` (pure matching code, no DOM), `art.js` (original SVG art as strings), `fx.js` (particle engine and 14 effects), `sound.js` (WebAudio, off by default). `src/build.py` concatenates them into the one deployable `index.html` and can inject the backend URL (`--endpoint URL`).
- `apps-script/Code.gs`: the backend. A Google Apps Script web app bound to a Google Sheet (tab `Dishes`).
- `dev/mock_server.py`: local static server plus a mock of the backend protocol, for testing.
- `docs/design-spec.md`, `docs/skeptic-notes.md`: the merged design and the review that shaped it.

## Data flow
Browser `GET <endpoint>?action=list` returns dishes (never tokens). Browser `POST` with `Content-Type: text/plain` (avoids a CORS preflight) sends `{action:'add'|'remove', ...}`. Adds are optimistic: the card appears at once as pending, then turns confirmed. Unsent adds wait in a local outbox and retry. The page polls about every 20 s (paused while the tab is hidden) and merges by id.

## Constraints
- Rows append under a script lock. An add with an id that already exists is a no-op that returns ok.
- Each row stores a per-browser secret token. The server checks it on `remove` and never returns it. Limits: 12 live rows per token, 150 rows total, text caps, category whitelist, hidden honeypot field, text-format cells so `=...` stays text.
- All guest text is rendered with `textContent`. `innerHTML` is used only for static art strings.
- Demo mode (local storage only) is allowed on localhost, `file:`, or `?demo=1`. Anywhere else, an empty endpoint shows "NOT LIVE YET" and disables sending.
- The sheet owner can edit or delete rows by hand (set `removed` to TRUE to hide a row).

## Deployment boundary
Static hosting on GitHub Pages (page only). Backend on the host's Google account (Apps Script web app, "Execute as me", access "Anyone"). The endpoint URL is not secret but anyone holding it can add rows within the caps.
