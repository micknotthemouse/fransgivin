# Changelog

## 2026-11-17: first build
**Implemented:** full page (hero, family table, WANTED board, sign-up form, duplicate warning sheet, take-it-back, 14 effects, optional sound, CALM toggle), Apps Script backend, local mock server.

**Measured:** dedupe self-test 45 of 45 pass. In a real Chrome (390 px phone, mock backend): sign-up, WANTED one-tap claim, synonym duplicate warning (dressing vs stuffing), take-it-back (server row removed with token check), polling picks up other guests' rows, hostile text and a `=HYPERLINK` dish render as plain text, offline banner plus outbox resend after the server returns, no horizontal overflow, no console errors. Effects on a 4x throttled CPU: average frame 8 ms, worst 25 ms, no frame over 50 ms.

**Fixed during testing:** wording when a guest duplicates their own dish, "1 offers", category not inferred on a fast submit, a success toast shown before a failed send, speech-bubble tail on desktop.

**Unverified:** the real Apps Script backend (not deployed yet), real iPhone Safari and Android Chrome, Partiful and Instagram in-app browsers, sound on a real phone.
