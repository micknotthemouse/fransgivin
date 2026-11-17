# Skeptic notes: FRANSGIVIN spec (ranked by severity)

## CRITICAL

**1. The backend contract is missing, so tokens can leak.** §9 only says "an add with an existing id is a no-op". If a naive `doGet` returns whole rows, every token becomes public, and anyone can delete anyone's dish through the public /exec URL. Sheets also runs text starting with `= + - @` as a formula.
AMEND: add §9b "Code.gs contract", shipped as a commented block at the end of index.html or as its own file:
- `list` never returns the token column.
- `remove` deletes only if the token matches on the server.
- `add` holds `LockService.getScriptLock()` while it checks the id and appends.
- The server enforces length caps and the category whitelist.
- The server puts `'` in front of any value starting with `= + - @`.
- Hard caps: 12 rows per token and 150 rows in total. Anything over returns `{ok:false, error:'full'}`.
- Deploy settings: "Execute as: Me" and "Anyone" (not "Anyone with Google account", which breaks CORS through a login redirect). Every code edit needs a new deployment version.

**2. Demo mode can leak into production.** If the host forgets to paste ENDPOINT, all 15 friends get a private local demo with SAMPLE rows. Each thinks they signed up, and nobody sees anyone else.
AMEND: allow demo mode only on `localhost`, `file:`, or with `?demo=1`. If ENDPOINT is empty on any other host, show "NOT LIVE YET. Text the host." and disable SEAL. The demo must never write `fransgivin.cache` or `outbox`. Add a QA step: delete the test rows from the Sheet before sharing the link.

**3. Dedupe normalizer bugs (false negatives and false positives).** Synonyms are not run through `normalize`:
- "brussels" becomes "brussel" and misses its synonym.
- "ies→y" turns "pies" into "py", "veggies" into "veggy" and "brownies" into "browny".

Whole-word keys misfire:
- "ice cream" fills the ICE poster.
- "carrot cake" becomes veg/Sides.
- "egg roll" and "cinnamon roll" become bread.
- "pot pie" becomes dessert pie.
- "sweet potato pie" becomes Sides.
- "apple cider" becomes Booze.
- "cranberry juice" becomes Sides.

Levenshtein ≤2 also opens the STRONG sheet for salad/salsa and chips/chili.
AMEND:
- Run every synonym through `normalize` at startup.
- Change "ies→y" to "ies→ie" when the stem is 3 letters or shorter (pies, ties).
- Add exception phrases that are checked first: ice cream, carrot cake, egg roll, cinnamon roll, pot pie, sweet potato pie→pie, apple cider→na, cranberry juice→na.
- A key fills a WANTED item only when the row's category equals the item's category.
- Use Levenshtein only when neither row has a key and both strings are 6 characters or longer.
- Ship `selfTest()` with about 25 input→key/score vectors and run it on `?test=1`.

## HIGH

**4. The list is buried.** On a 390×~600 webview, the Table is the 4th section, below roughly 18 posters and the form. "See what everyone's bringing" takes about 4 screens of scrolling.
AMEND:
- New order: Hero (≤1 screen, both buttons above the fold, Don at 88px, puppet hand hidden below 400px height), then Table, then WANTED, then Ritual.
- Table cards on phones become one line each: dish — name · note.
- WANTED shows the top 6 plus a "+N MORE WANTED" toggle.

**5. The form order contradicts the flow, and iOS focus will fail.** Panel 1 is the category grid, but Path A says to type a name first. Focusing Name scrolls the grid off-screen, under the keyboard. On iOS, `focus()` called after a smooth scroll finishes does not open the keyboard.
AMEND:
- Panel order: Name, then Category, then Dish and chips, then SEAL.
- Call `focus({preventScroll:true})` synchronously inside the tap handler, then `scrollIntoView`.
- After a WANTED tap with a known name, scroll to SEAL instead of `#ritual`.
- On `focusin`, hide the bottom bar and move toasts to the top.

**6. Failed rows: DISCARD after a timeout.** The server may already have written the row, and it reappears as an orphan.
AMEND: DISCARD sends `remove(id, token)` best-effort and tombstones the id. If the id shows up later, keep it as YOURS with TAKE IT BACK. Retries are single-flight per id, so outbox retry never runs in parallel with a manual retry.

**7. Contrast on ink.** Zero counts in kapow on ink measure about 3.2:1, which fails. The grey "COVERED" row is unspecified.
AMEND: show zero counts as a yolk pill with ink text plus the word "NEED". Set COVERED text to `#5A504A` on cream (about 7:1). In the dish-name fallback, put Georgia before Bodoni 72 and Didot, whose hairline italics are unreadable at 18px.

**8. The Host ham is not in the dedupe index.** A friend typing "ham" gets no warning.
AMEND: add a virtual row "The Host — Ham" (key ham) to scoring. It is never rendered as a card and is never removable.

## MEDIUM

9. **Double-tap zoom.** Rapid Don taps (5 in 4s) will zoom iOS.
AMEND: `touch-action:manipulation` on `html`; `-webkit-tap-highlight-color:transparent`.

10. **Sound.** A saved "ON" state can't play on reload without a gesture. iOS suspends the context after backgrounding, and the silent switch mutes it.
AMEND: never restore ON; reset to OFF on every visit. Call `ctx.resume()` inside the toggle tap and on `visibilitychange`. Label it "ON (check your silent switch)".

11. **Canvas resize.** The iOS toolbar collapsing fires `resize` constantly, which wipes particles mid-effect.
AMEND: re-allocate only when the width changes. Set the height to `screen.height`.

12. **Desktop sticky Ritual** is taller than the viewport, which hides SEAL.
AMEND: `max-height:calc(100dvh - 32px); overflow:auto`.

13. **Text edge cases.** `maxlength` and `slice` split emoji.
AMEND:
- Cap with `Array.from(s).slice(0,n).join('')`.
- Strip control and bidi characters `[\u0000-\u001F​-‏‪-‮⁦-⁩]`.
- Cards use `overflow-wrap:anywhere`.
- Ticker and bubbles truncate with an ellipsis.
- Build every template (ticker, bubbles, toasts, duplicate lines) in a text node.

14. **Post-submit choreography conflicts.** Auto-scrolling to the card while the seal, burst and confetti fire at the button splits attention, and it jumps tipsy users away from the form.
AMEND: no auto-scroll. Instead, a toast with a **SEE IT** button. Play the effect where the user is.

15. **Effects contradict the "≤2s" rule.** #12 runs 3s, and #3 will be the most common effect because early submits fill WANTED items.
AMEND: cap #12 at 2s. Use #3 only for the first fill per session.

16. **Single-pass risk.** 14 effects, 3 characters, dedupe, outbox and sound make about 3k lines.
AMEND: add a SHIP LINE after build step 7 plus Don, #5, #13 and #14. Everything after it is optional.

17. **Spam and vandalism.** Covered by #1's caps. Also add a hidden honeypot input; the server rejects rows where it is filled.

18. **Privacy.** The github.io username or repo name may reveal a surname.
AMEND: note in QA that the host checks the Pages URL before sharing.

19. **Webview storage.** Partiful and Instagram webviews may wipe localStorage. That is already mitigated by the footer.
AMEND: add the line "Open in Safari/Chrome to keep your edit button".
