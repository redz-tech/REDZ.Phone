# REDZ.Phone — Changelog

All notable changes to **REDZ.Phone**. Versions are its own and independent of any host application.
Listed newest → oldest.

## 0.5.0 - The field on a REDZ.UI page
- **`dist/redz.phone.redz-ui.css`** (written with the REDZ.UI session, the owner's pick 26.11): linked after
  `redz.phone.css` on a page of REDZ.UI 0.37.0 or newer, in the layer `redz.phone-ui`. The variables come from REDZ.UI's
  tokens, so light and dark follow. The country list is a REDZ.UI menu, the note is REDZ.UI's hint and feedback, and the
  contact methods are its segmented choice. In a `.form-floating` the label starts after the country button
  (`--redz-float-start` from `--rzp-button`).
- **Option `tickClass`:** a class for the checkbox of `unallocated`, so a host's own checkbox look applies (`check`).

## 0.4.1 - A host can theme the field
- **The sheet sits in the cascade layer `redz.phone`** and declares no order: a host that layers its CSS (REDZ.UI) places
  it where the field belongs; a page without layers sees no change.
- **The defaults moved into the rules:** no `--rzp-*` is declared on `.rzp` any more, every rule reads `var(--rzp-x,
  default)`, so a value set on any ancestor reaches the field, as the README always said. New `--rzp-focus` for the
  focus ring (falls back to `--rzp-accent`).
- **`--rzp-button`:** the country button's width, written on `.rzp` and on the element the input was in, so a floating
  label beside the input can start after the button; kept current on every change and removed while off and on `destroy()`.
- **The input's padding is measured on every repad**, not once when the field is made: a host may change it at run time.
- README: the public DOM (classes, states, aria) listed in «The DOM».

## 0.4.0 — The country button says what it is for
- **No country yet:** the button shows a globe and the word "Country" instead of a blank flag, which people did not
  take for something to press. The word is `texts.country`, so a page in another language shows its own word.
- **A number of no country** (+800, +882…) shows the globe with its code.
- New classes for theming: `rzp-globe`, `rzp-word`; the button gets `is-none` (no country) and `is-blank` (no
  country and no code).

## 0.3.1 — A clean inspection list
- **No behaviour change.** The sources pass PhpStorm's inspections: two needless escapes in a regular expression,
  attribute values turned into strings explicitly, a needless cast in `REDZ_Phone_Normalize`.
- The PHP engine says why it reads giggsey's internal metadata classes: the copy is pinned and the gate checks it.

## 0.3.0 — Files named after the product
- **Renamed:** `dist/redzphone.js`, `dist/redzphone.min.js` and `dist/redzphone.css` are now `dist/redz.phone.*`;
  `php/redzphone.php` is `php/redz.phone.php`; the demo's copy `docs/redzphone/` is `docs/redz.phone/`. Change the
  paths you load them from; nothing else changes.
- **Kept:** the global `REDZ.Phone`, the PHP functions `REDZ_Phone_*`, the CSS classes `rzp-` and the event
  `redzphone` — jQuery would read a dot in an event name as a namespace.

## 0.2.0 — The field and the demo
- **`REDZ.Phone.field(input, options)`** wraps an existing `<input>`: a country button with the flag and the calling
  code, a line under the input that reads the number back with its country (`+44 7400 123456 · United Kingdom`) or
  says what is wrong, and an optional choice of contact method (call, WhatsApp, Telegram, LINE; no check yet).
- **Country list** with search by the name in the page language, the English name, the country's own name, the ISO
  code or the calling code; popular countries first; opens over the page (`list: 'float'`) or in the page flow
  (`list: 'inline'`, for iframes sized to their content). The starting country comes from the form or from the
  region of the browser's first language, never from the IP address.
- **The flag follows the number:** a typed or pasted `+code` or `00code` moves it, a valid number shows its own
  region; picking another country removes a typed `+code` that would override the pick.
- **Messages and validity:** `too_long` at once, other problems after leaving the field or on `check()`;
  `unallocated` asks the person to tick "The number is correct"; the input's custom validity blocks a plain form
  with a wrong number; if the rules cannot be loaded, the input stays a plain field and never blocks the form.
- **State and events:** `state()` (`valid`, `input`, `country`, `method`, `confirmed`, `result`), the `redzphone`
  event, `set()`, `destroy()`, hidden inputs for plain forms, every text replaceable, `--rzp-*` variables for the look.
- **Right to left, labels, keyboard:** the button sits on the right in RTL pages while the number stays left to
  right; an input inside its `<label>` keeps the label; ARIA combobox and listbox, radiogroup for the methods.
- **`REDZ.Phone.example(country)`** — Google's example number of a country in the national format; the rules file now
  carries one example per region for it.
- **Flags:** a sprite drawn from flag-icons 7.6.0 by `npm run update` (`dist/flags.png`, `dist/flags@2x.png`).
- **Demo** in `docs/` for GitHub Pages, in English, Russian, Thai, Hebrew and Chinese.
- **Checks:** the gate also proves `dist/redzphone.css`, the sprites and the demo's copy of the release files, and
  plants nine breaks instead of seven; `npm run uitest` drives the field and the demo in headless Chrome.

## 0.1.0 — Engine core (free, offline)
- **One answer on both sides.** The browser engine (`dist/redzphone.js`, one global `REDZ.Phone`, the core of
  libphonenumber-js bundled in) and the PHP engine (`php/redzphone.php`, functions `REDZ_Phone_*` over an
  unmodified copy of giggsey/libphonenumber-for-php-lite) return the same answer for the same input:
  `ok`, `error`, `warning`, `e164`, `country`, `code`, `type`, `international`.
- **Google libphonenumber v9.0.41 on both sides.** The browser metadata `dist/meta/v9.0.41.json` is generated from
  that release's `PhoneNumberMetadata.xml`; the PHP side is giggsey-lite 9.0.41.
- **What it forgives:** digits of any script (Thai ๐–๙, full-width, Arabic-Indic…), spaces, brackets, dashes,
  letters, a trunk prefix (0, 8), `+44 (0) …`, a pasted `+code` that overrides the country, `00…` read as `+…`
  (the country's own international prefix wins only when its reading is better), `+0…` read as a national number.
- **Errors** `empty`, `no_country`, `too_short`, `too_long`, `invalid`, `wrong_type`; **warning** `unallocated`.
  With `types` (e.g. `['MOBILE']`) the length is judged by those types too, so a mobile short of one digit is
  `too_short`, not a warning.
- **Tools:** `npm run update -- <release>` pins a Google release on both sides in one command; `npm run build`;
  `npm run gate` compares both engines on 12,625 inputs and the rules of every region, and plants seven breaks on
  each run to prove it can still see them.
