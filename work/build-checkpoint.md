# Build checkpoint

## 2026-11-17 (PT): backend live, page ready to publish
**Running:** Google Sheet "Fransgivin dishes" with its Apps Script web app (version 2, same link) in the host's Google account; the page build with that link baked in passes local tests. Local test server `dev/mock_server.py` (port 8765) is still running from this session; stop it by its exact PID only.
**Pending from user:** nothing blocking. Optional: tell me the final share link wording, and confirm the GitHub username in the address is fine to send to friends.
**Open risks:** (1) Not yet tested on a real iPhone or Android, or in Partiful and Instagram in-app browsers. (2) Two phones writing in the same second on the live backend is untested (the script uses a lock). (3) Anyone with the link can add rows, bounded by the caps; the host can delete rows in the sheet.
**Next step:** merge `feat/sheet-backend` into `main`, push, wait for Pages, load the public link once in the built-in browser, then hand the link to the host.
**Links:** site https://micknotthemouse.github.io/fransgivin/ ; invite https://partiful.com/e/LpbfENX8UetYLqdel5bw ; docs in `architecture.md`, `decisions.md`, `changelog.md`.
