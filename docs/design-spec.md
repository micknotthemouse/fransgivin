# FRANSGIVIN: "THE GOBBLEFATHER" — Build Spec

One file, `index.html`, with inline CSS and vanilla JS. No build step and no framework. It is hosted on GitHub Pages. The only external request is one Google Fonts `<link>`. All art is original inline SVG, CSS or Canvas.

## 1. CONCEPT

**Pitch:** a 1960s mob-movie comic book with gravy spilled on it. Don Gobbleone, a turkey who has retired from being dinner, runs the potluck. Every friend makes the Family an offer: they pledge a dish. Every tap gets a reaction far too big for its cause, like a KAPOW, a gravy splash or a wax-seal slam. Under the noise sits a fast, plain tool that shows what's coming, what's missing and lets you claim a gap in 2 taps.

**`<title>`:** `FRANSGIVIN — An Offer You Can't Refuse (Bring Sides)`
**Meta:** `description` = "Sat Nov 21 · 6:30pm. Bring foods and booze. Plz help us clean after." `theme-color` = `#16110F`. Viewport: `width=device-width, initial-scale=1, viewport-fit=cover`. `lang="en"`. Do not add an og:image, an address, a surname or any other personal detail. Always write "FRANSGIVIN" exactly like that.

**Cast:**
- **Don Gobbleone**: a heavy-lidded turkey in a tux, black fedora and red carnation. He hosts and he narrates. "No turkey required. I made sure of it."
- **Tom Hamgen, Consigliere**: the Host's ham, with tiny round glasses. He is pinned at the top of the list and narrates the WANTED board.
- **Sonny Spuds**: a hot-headed mashed potato. He delivers every duplicate warning.

**Tone rules:**
1. Deadpan mob gravitas applied to food.
2. All "violence" is cartoon food: gravy, cranberry, confetti and marshmallows. There are no guns, no blood and no horse heads.
3. The smaller the action, the bigger the reaction.
4. Every jokey button has a plain sub-label. Copy rotates only in bubbles and toasts, never on controls.

## 2. PAGE STRUCTURE (exact order)

All scrolling content sits in `<main id="stage">`. Fixed UI sits outside `#stage`, so screen shake never moves it.

0. **Banner** (only in demo or offline mode): a full-width cranberry strip at the top.
1. **HERO** (an ink panel on the cream page):
   - A turkey-foot "puppet hand" SVG with 4 strings sits above the title.
   - **FRANSGIVIN** is set in Playfair 900 italic, cream, `clamp(44px,13vw,96px)`.
   - Then "SAT NOV 21 · 6:30PM" in Bangers yolk, then the invite line "Bring foods and booze. Plz help us clean after."
   - Don Gobbleone (120px) leans in from the right with a speech bubble.
   - Two buttons, stacked full width: **PLEDGE A DISH** / *add what you're bringing* (cranberry, primary) and **RSVP ON PARTIFUL** / *the official summons* (yolk outline). The Partiful button links to `https://partiful.com/e/LpbfENX8UetYLqdel5bw` with `target="_blank" rel="noopener"`.
   - The **Ledger strip** comes last. It is a wrap row of 6 tappable counters: `HAM: COVERED · SIDES 3 · APPS 1 · DESSERTS 0 · BOOZE 2 · OTHER 0`. A count of 0 shows in cranberry. Tapping a counter scrolls to that list section. Below the counters: "{n} offers on the table · {w} still WANTED".
2. **WANTED BOARD** ("Tom Hamgen's List"): the blurb, then the WANTED posters (see §6), then a grey "COVERED" row.
3. **THE RITUAL** (the form; `id="ritual"`), with 3 stacked comic panels:
   - Panel 1 "WHAT DO YOU BRING THE FAMILY?": 6 category buttons in a 3×2 grid, each with an icon, its label and a live count.
   - Panel 2 "SPEAK, FRIEND": the Name field, the Dish field and the note chips.
   - Panel 3: the **SEAL THE DEAL** button and its inline status line.
4. **THE FAMILY'S TABLE** (the list; `id="table"`):
   - A pinned card: "THE HAM — Tom Hamgen, by the Host. (Ham would be cool.)"
   - Then 6 category panels in this order: Main/Ham, Sides, Apps, Desserts, Booze, Other. Each header reads `SIDES · 3` plus a status line.
   - Each card has the dish in Playfair 700 italic at 18px and "— {name} · {note}" in Nunito at 15px.
5. **HOUSE RULES:** "We don't discuss business at the table. We discuss dishes. Then we DO the dishes. Plz help us clean after."
6. **FOOTER:**
   - The Partiful button again.
   - "Need to change something from a different phone? Text the host. The host can fix the books."
   - A link button **CALM THE FAMILY** / *fewer explosions* (toggles reduced mode and is saved).
   - A rotating joke line.
   - A broom icon.

**Sticky bottom bar** (all widths below 900px): 64px tall plus `env(safe-area-inset-bottom)`, ink background. It holds **PLEDGE A DISH** (fills the bar minus the toggle) and the **sound toggle** (56×48). It hides while the Ritual form is in view (IntersectionObserver), so it never covers the SEAL button.

**Desktop (≥900px):** max width 1100px with two columns. The left column (420px, `position:sticky; top:16px`) holds the Ritual. The right column holds the WANTED board and then the Table. The hero spans both columns. The sound toggle moves to the hero's top-right corner. Halftone covers the full page background.

## 3. SIGN-UP FLOW (exact taps)

**Path A, standard:**
1. Tap **PLEDGE A DISH**. The page smooth-scrolls to `#ritual` and focuses Name if it's empty.
2. Type a name, then tap a category.
3. Optionally type a dish and tap note chips.
4. Tap **SEAL THE DEAL**.

That is 3 taps plus typing.

**Path B, gap claim (fastest):**
1. Tap a WANTED poster, e.g. "STUFFING". This sets category = Sides and dish = "Stuffing", scrolls to `#ritual`, and focuses Name if it's empty.
2. Tap **SEAL THE DEAL**.

That is 2 taps, plus typing a name the first time only.

**Rules:**
- **Category inference:** if the dish matches a synonym key (see §8) and no category is selected yet, auto-select that key's category.
- **Empty dish is allowed.** The card shows "a mystery {Side|App|Dessert|Booze|Other|Main}" and a mystery-box icon.
- **Empty name:** the SEAL button wobbles and the status line says "Who are you? I need a name for the books." Nothing is submitted.
- **No category:** the status line says "Pick a category first, capisce?" and the grid pulses once.
- **Main/Ham selected:** an inline note says "The Host has the ham covered. A second main? Bold. Allowed."
- **Length caps** (`maxlength`, then trimmed again in JS): name 30, dish 60. The note is built only from chips, joined with ", ", and capped at 60.

**After submit:**
1. The duplicate check runs (§8). It may open the sheet.
2. A card is inserted at once as `pending`, with a dotted pulsing border and "SENDING TO THE FAMILY…". SEAL is disabled while the request is in flight.
3. The signature effect plays right away, without waiting for the network.
4. The page scrolls to the new card, which gets a yolk highlight and a **YOURS** fedora badge.
5. A success toast appears.
6. The form resets but keeps the name. The status line says "Bring another? Booze is always welcome."
7. On `{ok:true}`, the border turns solid and an **ON THE BOOKS** stamp thunks onto the card.

**Returning visitor:**
- Name, token and ids are read from localStorage.
- The hero bubble says "{name}. You came back. Your {dish} is on the books." There is a **SEE MY DISH** button below the bubble.
- Own cards show **✕ TAKE IT BACK** (44px).
  - The first tap turns it into **SURE? YES** / **NO** for 4 seconds.
  - YES plays the broom sweep and removes the card. The toast says "POOF. FORGOTTEN." The Don bubble says "Fredo… I mean, friend. It's forgotten."
  - The form is then prefilled with the removed dish so it can be fixed fast. This is how editing works: remove, then re-add.
- Cards without a matching token show no buttons.

## 4. VISUAL SYSTEM

**Color tokens:**

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#16110F` | outlines (3px), text, hero panel, bottom bar |
| `--cream` | `#FFF3D6` | page, panel paper, text on ink |
| `--kapow` | `#C8102E` | primary buttons (cream text, 5.4:1), alerts, splashes |
| `--yolk` | `#FFD23F` | WANTED posters, burst fills, highlights (ink text only) |
| `--pumpkin` | `#FF7A1A` | secondary accents, speed lines, Desserts |
| `--gravy` | `#7A4520` | gravy splats, turkey body, Main/Ham |
| `--ham` | `#E89A8C` | Tom Hamgen only |
| `--white` | `#FFFFFF` | burst cores, sticker outlines |

**Fonts** (one `<link>`: Bangers, Playfair Display ital 700/900 and Nunito 400/700/800, with `display=swap`):
- **Bangers** for headings, buttons, comic words and posters. Fallback: `Bangers, Impact, "Arial Black", sans-serif`.
- **Playfair Display** 700/900 italic for the logo, dish names and the Don's quotes. Fallback: `"Playfair Display", "Bodoni 72", Didot, Georgia, "Times New Roman", serif`.
- **Nunito** for body text, inputs, names and notes. Fallback: `Nunito, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

**Layout at 390px:**
- Single column with 12px gutters.
- Panels have a 3px ink border, a 6px offset hard shadow (`6px 6px 0 var(--ink)`), and alternate a ±0.8° tilt. Text never tilts more than the panel does.
- Category cells are at least 100×80. Chips and posters are at least 48px tall. SEAL is full width and 64px tall.
- Inputs use 18px text and are 52px tall.
- Toasts sit above the bottom bar and use `aria-live="polite"`.
- Halftone sits only on the page background: `radial-gradient(circle,#16110F22 1.2px,transparent 1.5px)` with `background-size:8px 8px`. Text always sits on solid colour.

## 5. ART ASSETS (inline SVG; simple shapes; parts in named `<g>` groups)

1. **Don Gobbleone** (`viewBox 0 0 200 220`):
   - Tail `#don-tail`: 7 rounded rects (24×90, rx 12), rotated −60° to 60° around (100,120), cycling pumpkin, yolk and kapow.
   - Body: a gravy ellipse at (100,140), radii 60 and 65.
   - Tux: an ink trapezoid over the lower body, a cream shirt triangle, and a bow tie made of 2 ink triangles.
   - Carnation: 5 kapow circles (r6).
   - Head `#don-head`: a circle (r34, `#A0522D`) at (100,70). Eyes are 2 cream circles. Lids `#don-lids` are gravy half-circles covering the top 60%.
   - Beak: a yolk triangle. Wattle: a kapow teardrop path. Jowls: 2 ellipses.
   - Fedora `#don-hat`: an ink ellipse brim, a trapezoid crown and a kapow band.
   - Shades `#don-shades`: 2 ink rounded rects plus a bridge line. Hidden by default.
   - Napkin `#don-napkin`: a white square. Hidden.
2. **Tom Hamgen** (`viewBox 0 0 100 100`): a ham-coloured teardrop path, 6 gold crosshatch lines (`#D4A24C`), 5 gravy clove dots, a cream bone (a circle plus a knob circle), and 2-circle glasses with a bridge line.
3. **Sonny Spuds** (`viewBox 0 0 100 100`): a cream lumpy blob path (8 points with jittered radius 38–44) and an ink outline. Angry brows are 2 angled lines. On top sits a gravy-pool "hat" ellipse, plus a tiny ink suit trapezoid.
4. **Burst** (`burst(points, r1, r2)` in JS returns polygon points; 14 points, radii 100/60):
   - Layers: a kapow outer star scaled 1.1, a yolk star, a white core circle at r30, and a 4px ink stroke.
   - A Bangers word sits centered on top.
5. **Wax seal** (`viewBox 0 0 100 100`): a 20-bump scalloped circle path from JS, filled kapow. Inside: a gold `#D4A24C` ring at r34, a cream Playfair "F", and a turkey-foot glyph (3 lines from one point).
6. **Gravy splat:** an 8-lobe blob path with radii randomized 0.7–1.0 plus 3 drip ellipses, filled gravy (kapow for the cranberry variant).
7. **Puppet hand:** a gravy turkey foot (3 toe paths) with 4 thin cream string lines dropping toward the "F", "A", "G" and "N" of the title.
8. **Category icons** (24px for buttons, 32px for cards):
   - Main/Ham: a mini Hamgen without glasses.
   - Sides: a bowl arc plus 3 steam squiggles.
   - Apps: a cheese-wedge triangle with 3 hole circles.
   - Desserts: a pie wedge with a crust arc and lattice lines.
   - Booze: a bottle (a rect plus a neck) and a wine-glass path.
   - Other: a box with "?".
   - Mystery: the same box, filled yolk.
9. **WANTED poster** (CSS):
   - Yolk fill, a 3px ink border and `border-radius:12px 4px 14px 6px`, plus a 4px white outline via box-shadow.
   - Two grey nail dots via `::before`/`::after`.
   - "WANTED" in Bangers 14px, the item name in Bangers 20px, and a "CLAIM ›" corner tab.
   - The permanent "MORE SIDES" poster is pumpkin.
10. **Broom:** a gravy rect handle plus a yolk triangle with 5 ink bristle lines.
11. **Cork:** a tan rounded rect, drawn on canvas.
12. **Speech bubble** (CSS): cream, a 3px ink border, radius 18px, and a triangle tail from `::after`.
13. **Speed lines** (hero background only): `repeating-conic-gradient(from 0deg at 80% 40%, #FF7A1A22 0 6deg, transparent 6deg 14deg)`.

## 6. WANTED BOARD (still needed)

**Blurb (Tom Hamgen):** "The Family requires the following. Tap one and it's yours. Friendsgiving runs on sides. Many, many sides."

**Items** (`label · category · matchKey · target`):

| Label | Category | Key | Target |
|---|---|---|---|
| Mashed Potatoes | Sides | mash | 1 |
| Stuffing | Sides | stuffing | 1 |
| Gravy | Sides | gravy | 1 |
| Mac & Cheese | Sides | mac | 1 |
| Green Bean Casserole | Sides | greenbean | 1 |
| Sweet Potatoes | Sides | sweetpotato | 1 |
| Cranberry Sauce | Sides | cranberry | 1 |
| Rolls | Sides | bread | 1 |
| Salad | Sides | salad | 1 |
| Roasted Veggies | Sides | veg | 1 |
| Apps / Cheese Board | Apps | *(any Apps row)* | 2 |
| Pumpkin Pie | Desserts | pumpkinpie | 1 |
| Another Dessert | Desserts | *(any Desserts row not pumpkinpie)* | 2 |
| Wine | Booze | wine | 2 |
| Beer / Cider | Booze | beer | 1 |
| Non-Alcoholic Drinks | Other | na | 1 |
| Ice | Other | ice | 1 |
| To-Go Containers | Other | togo | 1 |

**Rules:**
- A row counts toward a keyed item if its dish key equals the item key, in any category.
- The category-level items count rows in their category whose key matches no other item.
- A filled item moves to the COVERED row: grey, struck through, "COVERED by {names}".
- Unfilled items keep the order above.
- "WANTED: MORE SIDES · Reward: eternal respect" is always last and always shown. Tapping it selects Sides with an empty dish and focuses Dish.
- The ham is pre-shown in COVERED as "THE HAM: covered by the Host".
- When all items are filled, the board shows "All filled. More sides anyway. Sides are love."
- The poster count also feeds the Ledger's "{w} still WANTED".

## 7. EFFECTS CATALOG

**Engine:**
- There is one fixed full-screen `<canvas aria-hidden="true">` with `pointer-events:none`. DPR is `min(devicePixelRatio,2)`, and the canvas resizes on a debounced `resize`.
- A pooled particle array is capped at **120 live particles**, or **60** when `navigator.hardwareConcurrency <= 4`. Spawn requests are truncated to the free slots.
- Each particle has: `x, y, vx, vy, g, life, size, color, shape(circle|rect|feather|bubble)`.
- One `requestAnimationFrame` loop runs only while particles are alive.
- On `visibilitychange` to hidden, cancel the rAF and clear the pool.
- **Adaptive:** track a rolling 30-frame average. If it goes over 24ms, multiply all spawn counts by 0.5 for the rest of the session.
- Only one "big" effect (#2, #3, #4, #7) runs at a time. Another big trigger within 400ms is skipped (its toast still shows).
- Screen shake moves only `#stage`.
- DOM effects use transform and opacity only. No `backdrop-filter` and no animated SVG filters.

**Reduced mode** = `prefers-reduced-motion: reduce` OR CALM THE FAMILY is on. It uses the fallback column and spawns no particles.

| # | Name | Trigger | Look | Dur. | Particles | Reduced fallback |
|---|---|---|---|---|---|---|
| 1 | Hero slam | load | the hero panel drops from −40px with one 6px shake; FRANSGIVIN gets a white shine sweep (gradient mask); "THWACK!" pops | 0.8s | 0 | panel fades in 300ms |
| 2 | ★ SEAL THE DEAL KAPOW | submit (default) | the wax seal slams from 3× scale onto the new card; `#stage` shakes 8px for 6 frames; a burst plus "BADA-BOOM!" at the button; confetti flies in gravy, kapow, yolk and white with gravity 900px/s²; the Don kisses his ring and his bubble says "IT'S DONE." | 1.2s | 60 | seal fades in already stamped; static "BADA-BOOM!" sticker for 1s; card gets a yolk outline |
| 3 | ★ Cool Turkey Doesn't Look At Explosions | submit that fills a WANTED item (replaces #2) | the Don in `#don-shades` struts left-to-right across the bottom (translateX plus a bob keyframe); a giant burst grows behind him; caption "UNFINISHED BUSINESS: FINISHED" | 2.0s | 80 | static Don in shades beside the caption for 1.5s |
| 4 | ★ Table Slam | strong duplicate at SEAL | the Don's wings slam; all Table cards hop 10px (30ms stagger); a gravy splat lands at the dish-field edge (never over text); "WHAM!"; then the sheet opens | 0.9s | 12 | the Don's lids drop; static "WHAM!"; the sheet opens at once |
| 5 | Category smack | category tap | the button squashes (scaleY 0.8 → 1.05 → 1); a word floats up: HAM-POW!, SPUD!, CRUNCH!, SPLAT!, GLUG-GLUG!, ¿ZONK? | 0.4s | 0 | colour flip and the word shown statically |
| 6 | Poster YOINK | WANTED tap | the poster peels (rotate −12°, skew, corner origin) and flies toward the form; "YOINK!" | 0.5s | 0 | yolk ring highlight on the form |
| 7 | Turkey Cannonball | 5th Don tap within 4s | the Don tucks and arcs across the screen (keyframed translate plus rotate 720°); crash at the Table; feathers; "BOOM-GOBBLE!" | 1.5s | 20 | the Don peeks in holding a sign: "CANNONBALL (IMAGINE IT)" |
| 8 | Don poke roulette | Don tap (taps 1–4) | a random stunt: hat tip, hat spin, fake faint (rotate 90°), shades drop, sob into napkin, tail-fan puff (scale 1.3); plus a random joke-bank bubble | 0.6–1s | 0 | bubble only |
| 9 | Ham Slow-Mo | tap the Ham card | Hamgen spins 720° with easeOutExpo; 3 gold flare circles; "HAM WOULD BE COOL" | 1.4s | 0 | text only |
| 10 | Cork pop | Booze submit (replaces #2's confetti; the seal stays) | a cork arcs up; bubbles rise (negative gravity); "POP!" | 1.2s | 40 | static "POP!" |
| 11 | Broom sweep | TAKE IT BACK confirmed | a broom sweeps in from the left; the card slides out sideways; a dust puff; toast "POOF. FORGOTTEN." | 0.9s | 15 | the card fades out |
| 12 | Breaking News | a poll finds a new row from someone else | a kapow ticker slides down from the top: "BREAKING: {name} has made an offer: {dish}"; the new card drops in with a "NEW!" sticker | 3s | 8 | the ticker appears without sliding |
| 13 | Gravy splash | tap on empty background (pointer moved <10px, not on a control) | a splat at the tap point plus droplets, with a random word: KA-POW-TATO!, YAM!, STUFF'D!, GRAVY TRAIN!, CAPISCE!, BADA-BING! | 0.8s | 12 | nothing |
| 14 | Error fizzle | a submit or remove fails | the burst deflates (scale wobble to 0.3) with "pfffbbt" | 0.8s | 0 | static deflated burst |

**Sound (WebAudio):**
- Off by default. The state is saved in `fransgivin.sound`.
- Create the `AudioContext` on the first ON tap. Master gain 0.3.
- Toggle labels: **🔇 SOUND: OFF** / *the Don naps* and **🔊 SOUND: ON**. The toggle uses `aria-pressed`.
- Sounds:
  - **waltz**: plays on first ON. 3 plucked triangle notes (A4, C#5, E5, 0.25s apart, 0.3s exponential decay).
  - **boom**: plays with #2, #3 and #7. A 0.5s white-noise buffer through a lowpass sweeping 800→60Hz.
  - **pop**: plays with #10. A sine sweeping 600→1200Hz over 80ms.
  - **gobble**: plays on a Don tap. 3 square bursts, 400→250Hz, 20Hz vibrato, 60ms each.
  - **scratch**: plays with #4. Bandpassed noise with a 2000→300Hz sweep, 0.2s.
  - **sad trombone**: plays with #14. 4 sawtooth notes descending from G3, 0.25s each.
- Sound is never required and never autoplays.

## 8. DEDUPE

**Normalize(dish):**
1. Lowercase, strip accents (NFD, then remove combining marks).
2. Replace `&`, `+`, ` n `, `'n'`, `n'` with ` and `.
3. Remove punctuation (apostrophes included) and collapse spaces.
4. Drop filler phrases (longest first): store bought, gluten free, dairy free, home made, homemade, grandmas, moms, dads, famous, classic, extra, some, big, small, little, best, my, the, an, a, vegan, gf.
5. Singularize each token longer than 3 letters: `ies→y`, `oes→o`, `ches→ch`, `shes→sh`, otherwise drop a trailing `s` unless the word ends in `ss`.

**Synonym phrases → key:** match normalized phrases as whole words, longest phrase first. The first hit sets the row's key.
- mash: mashed potato, smashed potato, potato mash, mashed tater, mash
- mac: macaroni and cheese, mac and cheese, mac cheese, macaroni, mac
- greenbean: green bean casserole, green bean, string bean
- stuffing: stuffing, dressing
- sweetpotato: sweet potato casserole, candied yam, sweet potato, yam
- bread: dinner roll, cornbread, biscuit, bread, roll
- cranberry: cranberry sauce, cranberry
- gravy: gravy
- salad: green salad, salad
- veg: roasted vegetable, roasted veg, brussels sprout, veggie, squash, carrot
- pumpkinpie: pumpkin pie · applepie: apple pie · pecanpie: pecan pie · pie: pie
- wine: red wine, white wine, wine, rose, prosecco, champagne
- beer: hard seltzer, beer, cider, ipa
- na: non alcoholic, sparkling water, mocktail, seltzer, soda, juice
- ice: ice
- togo: to go container, tupperware, container, foil
- ham: ham · turkey: turkey

**Key → category** (used for inference):
- Sides: mash, mac, greenbean, stuffing, sweetpotato, bread, cranberry, gravy, salad, veg.
- Desserts: the 4 pie keys.
- Booze: wine, beer.
- Other: na, ice, togo.
- Main/Ham: ham, turkey.

**Family:** the 4 pie keys form family `pie`.

**Score the new dish against every existing row** (other people's, yours and pending ones):
- **STRONG** if any of these hold:
  - same key;
  - equal normalized strings;
  - token-set Jaccard ≥ 0.6;
  - both normalized strings are ≥ 5 characters and the Levenshtein distance is ≤ 2 (length ≤ 12) or ≤ 3 (longer).
- **SOFT** if the keys differ but the family is the same (`pie` vs `pumpkinpie`, `applepie` vs `pecanpie`).
- Otherwise there is no match. An empty dish is never checked.
- **Booze exemption:** if the new row's category is Booze, a STRONG match is downgraded to SOFT.

**While typing** (300ms debounce, and also after a WANTED tap): a yolk strip appears under the Dish field.
- STRONG: "Sonny Spuds says: {other} has this already." followed by 3 still-needed chips.
- SOFT: the matching soft line below.
- Chips are taken from unfilled WANTED items in the same category first, then Sides.
- Typing is never blocked.

**At SEAL with a STRONG match not yet acknowledged for this exact normalized text:**
1. Effect #4 plays.
2. A bottom sheet opens (`role="dialog"`, `aria-modal`, focus moves to its heading). It contains:
   - Sonny Spuds.
   - A random duplicate warning.
   - The matching rows ("{name} — {dish}").
   - 3 still-needed chips. One tap swaps the dish and category and submits at once.
   - **PICK SOMETHING ELSE** / *choose a different dish* (kapow, 56px). It closes the sheet and focuses Dish.
   - **BRING IT ANYWAY** / *two is fine* (ink outline, 56px). It submits as typed. Its success line is "Double {dish}. Bold. The Family respects bold."
3. A tap on the backdrop, or Esc, closes the sheet.
4. The text is marked acknowledged, so the warning never shows twice for it.
5. The sheet uses `visualViewport` resize, so the iOS keyboard never covers its buttons.

**Placeholder text:** the Dish placeholder is "e.g. {top unfilled WANTED label in the chosen category}". With nothing chosen, it is "e.g. Grandma's mac n cheese".

## 9. DATA

**Constant:** `const ENDPOINT = ''; // Apps Script /exec URL` is the first line of the script.

**Row:** `{id, name, dish, category, note, createdAt, token}`.
- `category` is one of `Main/Ham`, `Sides`, `Apps`, `Desserts`, `Booze`, `Other`.
- `id` is 8 base36 characters from `crypto.getRandomValues`.
- `createdAt` is `new Date().toISOString()`.

**localStorage keys:**
- `fransgivin.token`: 16 random bytes as hex, created once per browser.
- `fransgivin.mine`: an array of ids.
- `fransgivin.name`, `fransgivin.sound`, `fransgivin.calm`.
- `fransgivin.outbox`: unsent add payloads.
- `fransgivin.cache`: the last good list.
- `fransgivin.demo`: demo rows.

Wrap every localStorage call in try/catch. Some webviews throw.

**API adapter** with one interface, `api.list()`, `api.add(row)` and `api.remove(id, token)`, and two implementations: `remoteApi` and `demoApi`.

**Remote:**
- **List:** `fetch(ENDPOINT+'?action=list&t='+Date.now(), {cache:'no-store'})`.
- **Add and remove:** `fetch(ENDPOINT, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({action:'add', ...row})})` and `{action:'remove', id, token}`. Send no other headers. The redirect is followed by default.
- **Responses:** read with `res.text()`, then `JSON.parse`. Only `ok:true` counts as success.
- **Timeouts:** a 12s AbortController on every call.
- **Backend requirement (for the Apps Script author):** an add whose id already exists is a no-op and returns `ok:true`.

**Sanitize server rows:**
- Keep only id, name, dish, category, note and createdAt. Ignore `token` completely.
- Trim and cap name 30, dish 60, note 60.
- An unknown category becomes Other.
- Render user data only via `textContent`. Never use `innerHTML` with user data.

**Optimistic add:**
1. Insert the row locally as `pending`. Push its id to `mine` and its payload to `outbox`. Play the effect.
2. On `ok:true`, the row becomes `confirmed` and leaves the outbox. Schedule a poll 2s later.
3. On a timeout, network error or `ok:false`, the row becomes `failed`:
   - a dashed kapow border, a "NOT SENT" label, error line 1, **TRY AGAIN, CAPISCE?** and **DISCARD**;
   - effect #14 plays.
4. Retrying resends the same id.
5. The outbox is also retried automatically on load and after each successful poll. Any id the server already lists is marked confirmed without resending.

**Polling:**
- A `setTimeout` chain with a 20s delay ±3s random jitter. The next poll is scheduled only after the current one finishes.
- Paused while `document.hidden`. Fetch immediately when the page becomes visible.
- First load shows 3 skeleton cards with "Consulting the Family ledger…".

**Merge by id:**
- Server rows are the truth for confirmed rows.
- Local `pending` and `failed` rows stay until the server shows their id.
- Removed ids are tombstoned for 60s, so a stale poll can't bring them back.
- A confirmed row missing from 2 consecutive polls is dropped. That covers the sheet owner deleting it.
- Sort by createdAt within each category.
- Re-render by diffing on id, so only new cards animate.
- New ids from someone else trigger effect #12. At most one ticker is shown per poll: "BREAKING: 3 new offers" if there are several.
- The ledger, the WANTED board and the dedupe index recompute after every merge.

**Remove own dish:**
- Only for ids in `mine`.
- Optimistic: hide the card, tombstone the id, play #11.
- On failure, restore the card, show error 4 and play #14.

**Demo mode:**
- **ENDPOINT empty:** use `demoApi` (localStorage `fransgivin.demo`), seeded with 3 rows: "SAMPLE Sal — Stuffing", "SAMPLE Vito — Red wine", "SAMPLE Connie — Pecan pie". Show the permanent Demo banner. The SEAL sub-label becomes *saved on this phone only*.
- **ENDPOINT set, but the first list fails:**
  1. Retry once after 3s.
  2. If that fails too, show the cached list (if any) plus the Offline banner with a **RETRY** button.
  3. New adds go to the outbox, labelled "only on this phone".
  4. Keep polling. On the first success, remove the banner and flush the outbox.

## 10. COPY BANK (use verbatim)

**Hero bubble:** "You come to my table… on the day of the Friendsgiving." **Tagline under the date:** "This November, the Family eats together."

**Labels:**
- Name: "What does the Family call you?" (placeholder "First name or nickname")
- Dish: "What are you bringing? (optional)"
- Notes: "Any notes? (optional, tap all that apply)". Chips: VEGAN · GLUTEN-FREE · NEEDS OVEN · NEEDS FRIDGE · NUT-FREE.
- Category: "Pick a category". Labels: MAIN/HAM, SIDES, APPS, DESSERTS, BOOZE, OTHER.

**Buttons:**
- PLEDGE A DISH / add what you're bringing
- SEAL THE DEAL 🤝 / add my dish
- RSVP ON PARTIFUL / the official summons
- SEE MY DISH
- ✕ TAKE IT BACK
- SURE? YES / NO
- PICK SOMETHING ELSE
- BRING IT ANYWAY
- TRY AGAIN, CAPISCE?
- DISCARD
- RETRY
- CALM THE FAMILY / fewer explosions (when on: "BRING BACK THE CHAOS")

**Card states:** "SENDING TO THE FAMILY…" · "ON THE BOOKS" · "NOT SENT" · "YOURS" · "NEW!" · "only on this phone"

**Empty states:**
- Whole table: "The table is empty. Nobody disrespects the Family like this. Be the first."
- Sides: "No sides yet. Somebody's gonna have to step up."
- Desserts: "No desserts yet. A Friendsgiving without pie is just a meeting."
- Booze: "Dry so far. The Family is… concerned."
- Apps / Other / Main: "Nothing here yet. Fredo is here, but Fredo brought nothing. Don't be Fredo."

**Panel status lines:** fewer than 3 Sides: "THE FAMILY HUNGERS FOR MORE." Otherwise: "RESPECT."

**Success** (pick at random; booze rows use 9; WANTED fills use 8):
1. "It's done. Your {dish} is on the books."
2. "The offer is accepted. Welcome to the Family, {name}."
3. "{dish}? The Don nods slowly. That's respect."
4. "You came to me on the day of my Friendsgiving… and you brought {dish}."
5. "You're officially made. Like a casserole."
6. "Sonny Spuds salutes you. He's crying a little."
7. "The Family remembers this kindness. Forever. Or until dessert."
8. "You filled a WANTED spot. The Don will never forget this. It's a little intense."
9. "Booze? You honor this house. Salute, {name}."
10. "Your name is now in the Book of Food. In pen. Gravy pen."

When the dish is empty, `{dish}` becomes "mystery {category}".

**Duplicate warnings** (STRONG; `{other}` = the first match's name, or "You" if the match is yours; `{gap}` = the top unfilled item):
1. "{other} already brings {dish}. Two of those in one house? It could get starchy."
2. "That's {other}'s territory. You wanna step on their {dish}?"
3. "Somebody already made this offer. Are you starting a casserole feud?"
4. "The Family has {dish}. What the Family doesn't have: {gap}."
5. "I'm gonna make you an offer you CAN refuse: bring {gap} instead?"
6. "Sonny Spuds is losing his mind. Two {dish} situations."
7. "Never go against the Family. Unless the Family has zero rolls."

**Soft lines:**
- Pie family: "There's already a pie ({other}). Different pie? Carry on. Pie is never a problem."
- Booze: "Another bottle? The Family approves."

**Errors:**
1. "The pigeon got lost. Your dish isn't on the books yet. Nothing lost; tap TRY AGAIN, CAPISCE?"
2. "The Family's ledger isn't answering. Omertà. Check your signal and retry."
3. "Couldn't load the Family list. Showing the last one we saw."
4. "You can't leave the Family that easily. (Removing failed. Try again.)"

**Banners:**
- **Demo:** "DEMO MODE: your offers stay on THIS phone only. Nobody else sees them. The Don is just pretending."
- **Offline:** "The Family's ledger is unreachable. New offers are saved on this phone and sent when it reconnects."

**Pending notice in the hero:** "{n} pledge(s) not sent yet. Tap to resend."

**Joke bank** (Don bubbles, the footer and the loading state; rotate without repeats):
1. Leave the ham. Take the stuffing.
2. I'm gonna make you an offer you can't refuse: seconds.
3. Keep your friends close and your gravy closer.
4. It's not personal. It's strictly casserole.
5. Just when I thought I was full… they pull me back in for pie.
6. We don't discuss business at the table. We discuss sides.
7. Look how they marshmallowed my yams.
8. Someday, and that day may never come, I will ask you to bring ice.
9. I'm not a turkey. I'm a businessman.
10. No turkey required. Nobody touches the Don.
11. Fredo brought napkins. Again. We don't talk about Fredo.
12. Revenge is a dish best served with whipped cream.
13. Tonight we settle all Family business. With Tupperware.
14. Every family has a ham. Ours is literal.
15. The gravy is a family secret. The secret is a jar.
16. Take the cannoli. Take the pie. It's Friendsgiving, take everything.
17. A Don never asks twice. He refreshes every 20 seconds.
18. Never tell anyone outside the Family what's in the dip.
19. The family that cleans together stays together. Plz.
20. Tipsy? The Don understands. Tap slower.
21. In this house, the sweet potatoes get marshmallows. That's the law.
22. You talkin' to me? Wrong movie. Bring rolls.
23. Yippee-ki-yay, mother-gravy.
24. I spent my whole life trying not to be stuffed. Now look at me.
25. Ham would be cool. — The Godfather, probably.

## 11. ACCESSIBILITY

- Use semantic `<button>` and `<a>` elements. Category and note chips are `<button aria-pressed>`. Each category grid is a `role="group"` with a visible label.
- Every input has a real `<label>`. Use `autocomplete="given-name"` on Name and `enterkeyhint="done"`.
- Every tap target is ≥44×44 (most are 48–64). Leave 8px gaps between targets.
- Use a visible `:focus-visible` ring: 3px yolk plus 2px ink.
- Toasts and the status line use `aria-live="polite"`. Errors use `role="alert"`.
- Decorative SVGs and the canvas are `aria-hidden`. The Don is a `<button aria-label="Poke the Don">`. The Ham card is a `<button aria-label="The Host's ham">`.
- State is never shown by colour alone. Pending, failed and yours each also have a text label.
- Contrast: ink on cream is about 17:1, cream on kapow 5.4:1, ink on yolk about 14:1.
- The sheet traps focus, closes on Esc and returns focus to SEAL.
- Effects never take pointer events, never cover inputs and never last longer than 2s.
- Reduced mode follows the media query plus the CALM toggle.
- Body text is at least 15px.

## 12. BUILD ORDER (most important first)

1. Static HTML and CSS: hero, Partiful button, Ritual form, Table with pinned Ham, footer, bottom bar, tokens and fonts. The page must look right and readable with JS off. Start with exact copy.
2. The `api` adapter with `demoApi`, plus the Demo banner. Submit, render (textContent only), the YOURS badge and the name memory.
3. `remoteApi`: list, add and remove, timeouts, optimistic states, outbox, retry, polling with jitter, visibility pause, merge by id, tombstones and the 2-miss drop. Offline banner.
4. WANTED board, Ledger and category inference.
5. Dedupe: normalize, synonyms, scoring, inline strip and the duplicate sheet.
6. TAKE IT BACK with its two-step confirm and prefill.
7. Particle engine (caps, adaptive mode, visibility pause) plus the reduced-mode switch. Then effect #2, with its fallback built and tested first.
8. Don Gobbleone SVG, then effects #3, #4, #5, #6, #10, #11 and #12.
9. Tom Hamgen and Sonny Spuds, then #1, #7, #8, #9, #13 and #14.
10. WebAudio sounds and the toggle.
11. QA:
    - a 390px phone and a mid-range Android;
    - the Partiful and Instagram in-app webviews;
    - reduced motion;
    - ENDPOINT empty, ENDPOINT unreachable, and ENDPOINT live with two phones adding within the same minute.

## 13. DECISION RECORD

**Winner and backbone: arcade-comic.** It fits the host's brief best: obnoxious cartoon explosions are native to a comic. Its cream paper with ink text is the most readable choice on phones in the evening. It gets to the job on the first screen with no intro wait. The cost is light: CSS borders, halftone gradients and simple SVG.

**Grafted ideas:**
- From **cinematic**:
  - the title and the "An Offer You Can't Refuse" framing;
  - Tom Hamgen and the pinned Ham card;
  - the wax-seal stamp inside the KAPOW;
  - "Cool Turkey Doesn't Look At Explosions" for WANTED fills;
  - Ham Slow-Mo and the Breaking News ticker;
  - 60s tombstones, ±3s poll jitter, adaptive particle halving and the lost-token footer.
- From **dinner-table**:
  - WANTED posters, including the permanent MORE SIDES poster and the target table;
  - the Ledger counters;
  - the broom sweep on remove (it echoes "help us clean after");
  - the cork pop;
  - mystery dishes;
  - the 2-miss drop rule;
  - "Nothing lost" in the error wording.

**Runner-up 1: cinematic ("The Gobblefather").** It lost because a 4.6s trailer intro delays the job for hungry, tipsy phone users. Film grain, letterbox bars, chapter burn-ins and a scrolling credits footer add build and run cost for little function. Dark parchment-on-noir is moody but harder to scan quickly. Its one-tap claim with Undo risks accidental claims, so it was cut in favour of 2 taps.
- **Build cost:** high (intro timeline, grain tile, IntersectionObserver chapters, FLIP animation).
- **Run cost:** medium-high (constant grain animation, ambient motes).
- **Failure modes:** friends skip or bounce on the intro, webview jank during the push-in, dark-mode glare.

**Runner-up 2: dinner-table ("The Table Is the Product").** It lost because two 140×170 plates per row turn 15+ dishes into a long scroll that needs a second, duplicate text list. Its 3D desktop tilt, jetpack trail and per-zone steam add cost. Pirata One reads more pirate than mob.
- **Build cost:** medium-high (plate grid, bottom-sheet form, perspective layout).
- **Run cost:** medium (ambient steam and spotlight sweeps).
- **Failure modes:** the list is slow to scan, the 85vh form sheet fights the iOS keyboard, and blackletter text is illegible to tipsy readers.

**Cut from the winner:**
- Consigliere Cran: one fewer character to draw.
- The "every 3rd submit" cannonball: it was unpredictable.
- The ambient sprout: idle timers cost battery.
- The `offset-path` arc: keyframes are simpler and more portable.
- The cinematic's 150-particle cap: the winner's 120/60 cap is kept.

**Decisions made:**
- The form is inline, not a sheet. Only the duplicate dialog is a sheet.
- Generic pie against a specific pie is SOFT.
- Booze never gets a STRONG warning.
- Unreachable means offline-with-outbox, labelled on the page.
- Editing is take-back plus prefill.

**Run-cost summary:**
- One canvas, ≤120 particles (60 on low-core devices), DPR ≤2.
- rAF runs only while particles are alive, pauses when hidden, and spawns are halved when frames average over 24ms.
- No continuous animations except the CSS speed lines (static) and Don blinks: an opacity swap every 6s, off in reduced mode.

**Overall failure modes and mitigations:**
- **Apps Script latency causing double submits:** disabled button, instant pending card, idempotent ids, and dedupe that includes your own pending rows.
- **Webviews losing localStorage:** no broken buttons on cards, the "text the host" footer, and the name re-typed once.
- **Font load failure:** full fallback stacks.
- **Endpoint down:** cached list, outbox and a clear banner.
