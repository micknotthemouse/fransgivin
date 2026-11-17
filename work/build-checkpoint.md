# Build checkpoint

## 2026-11-17 (PT): live and ready to share
**Running:** the public page on GitHub Pages (branch `main`, current build with the live backend link) and the Google Sheet "Fransgivin dishes" with its Apps Script web app (version 2) in the host's Google account. The local test server was stopped. The sheet is empty (header only), so friends start with a clean list.
**Pending from user:** send the link to friends. Optional: confirm the GitHub username in the address is fine to share, and say if they want the address changed.
**Open risks:** (1) Not tested on a real iPhone or Android, or in Partiful and Instagram in-app browsers. (2) Two phones writing in the same second on the live backend is untested (the script uses a lock). (3) Anyone with the link can add rows, bounded by 12 per browser and 150 total; the host can delete rows in the sheet. (4) The sheet's Apps Script project is still named "Untitled project".
**Next step:** host shares the link; on Saturday morning check the sheet for stray rows. After any change to `apps-script/Code.gs`, paste it into the Apps Script editor and deploy a new version of the same deployment.
**Links:** site https://micknotthemouse.github.io/fransgivin/ ; invite https://partiful.com/e/LpbfENX8UetYLqdel5bw ; docs in `architecture.md`, `decisions.md`, `changelog.md`.
