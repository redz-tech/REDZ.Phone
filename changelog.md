# REDZ.Phone — Changelog

All notable changes to **REDZ.Phone**. Versions are its own and independent of any host application.
Listed newest → oldest.

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
