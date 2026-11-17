# Decisions

## D1. Host on GitHub Pages, not a Claude Artifact (2026-11-17)
Claude-hosted pages block calls to other sites, and public-link visitors from outside the owner's organization cannot write to the artifact database (they hold view-only access and must sign in). Friends would have to be Claude users. GitHub Pages is free, public, and needs no sign-in. Accepted tradeoff: the URL contains the GitHub username.

## D2. Data in a Google Sheet through Apps Script (2026-11-17)
Matches the host's own suggestion and gives the host a sheet they can edit. Runner-up: jsonblob.com (no setup), rejected because it sits behind a bot challenge that blocks scripted requests and it overwrites the whole list on each write. Accepted tradeoffs: 1 to 2 s latency, one-time consent to authorize the script. Open assumption: the host agrees to the Google authorization step.

## D3. Design: "The Gobblefather" comic-book mob parody (2026-11-17)
Three rival concepts were judged (cinematic title sequence, comic-book arcade, dinner-table-as-UI) and merged by a judge, then attacked by one skeptic. Winner: comic-book arcade (fast to the task, readable cream paper, cheap to run) with the wax seal, ham character and ticker from cinematic and the WANTED posters, ledger and broom sweep from dinner-table. Cinematic lost to its slow intro; dinner-table lost to slow scanning on a phone. Build cost: about 3,900 lines in parts. Run cost: one canvas, 120 particles max (60 on low-core devices), adaptive halving. Failure modes: slow Apps Script (mitigated by optimistic adds and an outbox), phone in-app browsers that clear storage (footer note), effect overload (CALM toggle and reduced-motion fallback).

## D4. Dedupe is a warning, never a block (2026-11-17)
Fuzzy matching with synonym groups; generic pie vs a specific pie and any booze get only a soft line. Two friends can still bring the same dish.

## D5. Sound off by default and never restored on reload (2026-11-17)
Browsers block autoplay, and a saved "on" state cannot play without a tap.

## D6. Success toast waits for server confirmation (2026-11-17)
Found in testing: an optimistic "it's done" toast contradicted a failed send. Effects still play at once; the toast follows the confirmed save.
