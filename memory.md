# REDZ.Phone — maintainer notes

Design knowledge for maintaining **REDZ.Phone**. Public usage → `README.md`. History → `changelog.md`.
The product is REDZ.Phone; in code it is the namespace `REDZ.Phone` in the browser (esbuild `globalName`, so
`window.REDZ` is shared with other REDZ libraries) and the prefix `REDZ_Phone_` in PHP (constants `REDZ_PHONE_*`);
files are `redz.phone.*` (since 0.3.0), CSS uses `rzp-`. The DOM event stays `redzphone`: jQuery reads a dot in an
event name as a namespace, so `redz.phone` would reach jQuery listeners as the event `redz`.

## The contract
For the same `(input, country, types)` the browser engine (`src/redz.phone.js` → `dist/`) and the PHP engine
(`php/redz.phone.php`) return the same object. Everything else serves this promise, and `npm run gate` is its proof.
A field enters the answer only if both engines can produce it identically.

## Where each half comes from
- **Rules:** one Google libphonenumber release (`tools/pins.json`). `tools/update.mjs` generates the browser rules
  from that release's `PhoneNumberMetadata.xml` with libphonenumber-metadata-generator (`max` level, minified),
  and copies giggsey/libphonenumber-for-php-lite of the same release into `php/libphonenumber/` unmodified.
  At 9.0.41 the generated file was byte-identical to libphonenumber-js's own `metadata.max.json`; update prints
  this cross-check whenever libphonenumber-js carries the same release.
- **Algorithms:** libphonenumber-js core in the browser, giggsey (a line-by-line port of Google's Java) in PHP.
  They are two ports, so they differ in corners; our wrapper code on both sides exists to remove those corners.
- **Our own code, written twice (JS and PHP, kept line-for-line alike):** normalisation, the `+0` and `00`
  rules, error mapping, the answer object. In the browser: `src/engine.js`; `src/redz.phone.js` is only the entry
  that decides what the global `REDZ.Phone` exports (engine.js also exports helpers for the field that stay private).
- **The field** (`src/field.js`, `src/redz.phone.css`) is browser-only and outside the parity contract: it calls
  `parse()` and shows the answer; the server re-parses the raw input with the picked country and gets the same one.
- **Flags:** `npm run update` draws `dist/flags.png` (20×15) and `flags@2x.png` (40×30) from flag-icons with
  sharp: one column, one row per region of the metadata in ISO order, `XX` (no country) last. The row order goes
  into the bundle from `pins.flags.order` (`REDZ_PHONE_FLAGS`), and a row is picked by percentage, so any display
  size works. PNG with a palette beat WebP here (measured: 18/42 KB against 39/98 KB).

## Divergences found by the gate and how they are closed
1. **International format.** Google keeps the format's punctuation (`+1 201-555-0123`); libphonenumber-js turns
   it into single spaces. PHP applies libphonenumber-js's punctuation class to giggsey's output
   (`REDZ_PHONE_PUNCTUATION`).
2. **National format — dropped from the answer.** The metadata generator removes formats whose `intlFormat` is
   `NA`, so libphonenumber-js cannot format those special numbers nationally (CN `1681 2345`, TR `444 1 444`…)
   while Google can. The browser formats as-you-type with libphonenumber-js anyway; the server displays
   `international`.
3. **Length verdicts.** Google knows "local-only" lengths (a number without its area code →
   `IS_POSSIBLE_LOCAL_ONLY`); the generated rules do not carry them. PHP therefore does not use giggsey's
   `isPossibleNumber*`; `REDZ_Phone_Length` is a port of libphonenumber-js `checkNumberLengthForType` over
   giggsey's metadata. Measured case: KR `1544123`.
4. **Type in a region without mobiles** (TA, the only one at 9.0.41). The minified rules cannot tell "no mobile
   rule" from "mobile rule = fixed-line rule", so libphonenumber-js says `FIXED_LINE_OR_MOBILE`; the browser
   engine corrects it to Google's `FIXED_LINE`.
5. **One or two digits.** giggsey throws `NOT_A_NUMBER`, libphonenumber-js `TOO_SHORT`: both map to `too_short`,
   and fewer than two digits never reach the engines.
6. **Left as is:** `+1 1 310 1234` (national prefix right after +1). libphonenumber-js tests the stripped number
   against the region of that number (Canada), Google against the main region (USA). Recorded in
   `tests/known.json`; the gate fails if either answer changes.

## Policy decisions inside the engine
- `00…` is read as `+…` first; the reading through the country's own international prefix wins only with a
  better rank (valid > possible > wrong type > error). Without it, Thailand's `00[1-9]` turns `0044…` into Norway.
- `+0…` drops the `+`: no calling code starts with 0, and it is exactly the shape of the order that started the
  project (a form turned `07400 123456` into `+07400123456`).
- `unallocated` is a warning, not an error (Google adds ranges every two weeks). Consumers decide how loud it is.
- `types` changes the length verdict as well as the type check: `['MOBILE']` turns a mobile short of one digit
  into `too_short`. Without `types`, `+66 81 234 567` is only `unallocated` because 8 digits is a Thai
  fixed-line length; with the wrong country picked, `+07400123456` and `TH` give `+667400123456` + warning.
  Contact forms should pass `['MOBILE']` and default the country carefully.

## Field decisions
- **No reformatting while typing.** Masks fight pasting and caret movement on mobile keyboards (GOV.UK, Baymard);
  the read-back line under the input gives the same reassurance and shows the country, which is what catches a
  wrong default country.
- **The flag shows the country the number will be read with.** It follows a typed `+code` (also unfinished:
  `+7` → RU), a valid number's own region, and only then the pick. A pick that conflicts with a typed `+code`
  removes the code; otherwise the typed code would flip the flag straight back.
- **The country button overlays the start of the site's own input**, whose padding is widened by the button's
  width (measured, kept current by a ResizeObserver). This keeps any site's input styling; in RTL the button and
  the padding go to the right while the input itself stays `dir="ltr"`.
- **`types` defaults to `['MOBILE']`** in the field (a contact number), not in `parse()`.
- **`valid` fails open:** without rules the field never blocks a form; the server checks anyway.
- **Search** folds case and marks (NFD, `\p{M}` removed) on both sides, so `ё` finds `е` and `cote` finds `Côte`;
  Thai vowel marks are removed too, equally on both sides. Own names come from `Intl.Locale('und-XX').maximize()`.
- **Texts** are English defaults replaced through `texts`; translations live with the consumer (the demo carries
  ru/th/he/zh in `docs/demo.js`).

## The gate (`tools/gate.mjs` + `tools/gate.php`)
Checks: identical release and version everywhere; vendored tree hash = pins; browser rules file hash = pins;
browser rules = PHP rules for every region and type (`rulesOf` reads libphonenumber-js metadata v4 positions —
update it if the generator's format version moves); `dist/` = a fresh in-memory esbuild of `src/`; answers equal
on the corpus; expected answers met (hand-written cases and Google's example numbers, which must be valid for
their type); `dist/redz.phone.css` is fresh; the sprites match the pins and their rows match the metadata;
`docs/redz.phone/` equals `dist/`. Self-test on every run: nine planted breaks must all go red.

`tools/uitest.mjs` (`npm run uitest`) is the field's check: a small DevTools-protocol client (node's own WebSocket,
no puppeteer) drives headless Chrome over a static server on `tests/ui.html`, one fresh page per scenario, then
the demo in five languages at 390 px with screenshots in `.cache/ui/`. Verified on 20.10.2026 with four broken
copies of the field (flag not following, code not dropped, RTL padding, unallocated without the tick) and four of
the gate checks (CSS, demo copy, sprite, flag rows) — all red for the right reason.

The answers on the corpus prove the **algorithms** agree; they do not prove the **data** agree — rules of
v9.0.40 under the label v9.0.41 gave identical answers on all 12,625 inputs. The rule comparison is what catches
that (it showed IR, NG, US). Verified on 20.10.2026 with seven broken copies of the tree, all red for the right
reason, and the healthy copy green.

## Traps
- **`window.REDZ` is shared** (the REDZ CMS puts its `REDZ.post` there). The bundle extends it
  (`var REDZ = REDZ || {}`); a script that replaces the object or declares `REDZ` with `let`/`const` loses
  `REDZ.Phone` or breaks the page. The uitest proves the bundle keeps another script's `REDZ`.
- **PHP `"0"` is falsy.** `$prefix ?: null` turns the national prefix "0" into null; the first rule comparison
  went red on 200 regions for that reason. Compare with `=== ''`.
- **Realms in node's `vm`:** libphonenumber-js checks `metadata.constructor === Object`, so JSON parsed outside
  the context is "not valid metadata". The gate parses it inside the context.
- **Non-geographic calling codes** (+800, +808, +870, +878, +881, +882, +883, +888, +979) live under
  `nonGeographic` in the browser rules but appear as region `001` in giggsey.
- **The non-minified bundle contains module paths.** A symlinked `node_modules` changes them and the gate reports
  a stale `dist/`. Copy, do not link, when testing a copy of the tree.
- **Composer neighbours.** The autoloader maps `libphonenumber\` to the vendored copy only if nothing loaded those
  classes first; an application with its own giggsey through Composer may run another release on the PHP side.
  giggsey builds data class names from `__NAMESPACE__`, so a namespace-prefixed copy is feasible if public users
  need it (decide before 1.0).
- **esbuild lowers syntax, not library methods.** `?.`, `??=` become ES2018, but `Array.prototype.at`,
  `Object.hasOwn` and the like stay as written and break Safari 14. The field avoids them.
- **A field attached when the rules are already in** must evaluate at once: the second field on a page used to
  render before its first parse (caught by the uitest).
- **A `<label>` around the input** labels its first labelable descendant, which after wrapping is the country
  button: a click on "Phone" would open the list. The field sets the label's `for` to the input (and takes it back
  in `destroy()`).
- **Country names differ between ICU versions** (Russian `AE` is "ОАЭ"): the uitest uses only names that are stable
  in Chrome; another browser may word them differently, which is fine for display and search.
- **DevTools key events:** Enter needs `text: '\r'` on `keyDown` to click a focused button; other keys go as
  `rawKeyDown`.
- **The sprites are pinned bytes.** An image optimiser run over `flags*.png` recompresses them lossily (some flags
  change colour) and the gate goes red. Restore them from git; `npm run update` alone makes sprites that match the pins.
- **PhpStorm's inspection list** stays clean only with `.cache/`, `dist/` and `docs/redz.phone/` excluded in the IDE:
  the cached giggsey gives "multiple definitions", the minified copies "duplicated code", the bundle hundreds of
  libphonenumber-js and ES2018-lowering remarks. The remaining exceptions are suppressed in place, and a comment in
  each file says why: `CssUnknownTarget` in `src/redz.phone.css`, `PhpInternalEntityUsedInspection` in
  `php/redz.phone.php`, `CssUnusedSymbol` in `tests/ui.html`.

## Extending
- A new field in the answer: add it to both `describe`/`REDZ_Phone_Result` and `fail`/`REDZ_Phone_Fail`, run the
  gate; if the two engines cannot agree on it, it does not belong in the answer.
- A new normalisation rule: write it in both engines and add hand-written cases with expected answers; the gate
  then proves both the rule and its twin.
- Numbers in the docs, the demo and the tests come from Google's examples (`tests/examples.json`), never from real
  orders or messages: the repository is public, and a number once pushed stays in its history.
