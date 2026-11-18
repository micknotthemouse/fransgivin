# Changelog

## 2026-11-18: clearer page, splash screen, new font
**Implemented:** (host feedback: friends were confused about where to click) Splash screen on open (turkey Don, gold title, ENTER button; tap anywhere, Esc, or 9 s auto-closes; shown once per browser session, `?splash=1` forces it). Hero now has a 3-step "how it works" list and one giant pulsing PLEDGE A DISH button. The sign-up form moved directly under the hero as "PLEDGE A DISH" with numbered steps 1 to 3 and a SUBMIT MY DISH button. "The Family's Table" is now "WHAT PEOPLE ARE ALREADY BRINGING" with a one-line explainer; the wanted board is "NOT SURE? WE STILL NEED THESE" and its cards say PLEDGE THIS. Both Partiful RSVP buttons removed. Cartoon font (Bangers) replaced by Cinzel and Cinzel Decorative, with Playfair italic kept for dish names.

**Measured:** at 375 px phone width in Chrome against the local mock backend: splash shows and closes, no horizontal overflow, PLEDGE A DISH button visible on the first screen after the splash, full sign-up (name, category, dish, submit) confirmed, no console errors.

**Unverified:** real iPhone and Android, Partiful and Instagram in-app browsers (does the splash and font load there), the 9 s auto-close on a slow phone.

## 2026-11-17 (later): backend live, WANTED board reworked
**Implemented:** Google Sheet "Fransgivin dishes" plus Apps Script web app (version 2) in the host's Google account, wired into `index.html`. WANTED board now favors family and culture dishes: removed mashed potatoes, stuffing, gravy, mac and cheese, green bean casserole; kept cranberries; added family-recipe side, culture finger food, wrapped foods, dips, rice or noodles, tangy sides, a culture dessert slot, and a MORE APPS poster. Classic dishes still get duplicate warnings but never fill the family-recipe slot. Hero and blurb copy say "bring something you love".

**Measured:** dedupe self-test 63 of 63. Live backend checks with curl: list, add, same-id retry (no duplicate row), remove with wrong token refused, remove with right token, honeypot add ignored, a dish starting with `=` stored and returned as plain text. Real page against the live backend from a local page: sign-up confirmed in about 2 s, take-it-back removed the row, no banner.

**Fixed:** formula-like text (`=`, `+`, `-`, `@` first character) was stored as an error cell; now stored with a hidden leading marker that the page strips. Success toast now waits for server confirmation.

**Unverified:** real iPhone Safari and Android Chrome, Partiful and Instagram in-app browsers, sound on a real phone, two phones writing in the same second on the live backend.

## 2026-11-17: first build
**Implemented:** full page (hero, family table, WANTED board, sign-up form, duplicate warning sheet, take-it-back, 14 effects, optional sound, CALM toggle), Apps Script backend, local mock server.

**Measured:** dedupe self-test 45 of 45 pass. In a real Chrome (390 px phone, mock backend): sign-up, WANTED one-tap claim, synonym duplicate warning (dressing vs stuffing), take-it-back (server row removed with token check), polling picks up other guests' rows, hostile text and a `=HYPERLINK` dish render as plain text, offline banner plus outbox resend after the server returns, no horizontal overflow, no console errors. Effects on a 4x throttled CPU: average frame 8 ms, worst 25 ms, no frame over 50 ms.

**Fixed during testing:** wording when a guest duplicates their own dish, "1 offers", category not inferred on a fast submit, a success toast shown before a failed send, speech-bubble tail on desktop.

**Unverified:** the real Apps Script backend (not deployed yet), real iPhone Safari and Android Chrome, Partiful and Instagram in-app browsers, sound on a real phone.
