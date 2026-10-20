# REDZ.Phone

A phone number field for web forms. It turns whatever a person types into a checked **E.164** number, using
**the same Google rules in the browser and in PHP**.

```js
REDZ.Phone.field(document.querySelector('#phone'), {country: 'auto', methods: ['call', 'whatsapp']});
```
```php
REDZ_Phone_Parse($_POST['phone'], $_POST['phone_country'], ['MOBILE'])['e164']; // '+447400123456'
```

**Demo:** <https://redz-tech.github.io/REDZ.Phone/> (English, Русский, ไทย, עברית, 中文). In code: `REDZ.Phone` in the
browser, functions `REDZ_Phone_*` in PHP.

> **Status: 0.3.1, the engine and the field.** Offline checks only, no network. Coming next: an optional paid check
> that the number really works in the contact method the person chose (call, WhatsApp, Telegram). See `changelog.md`.

---

## Table of contents

1. [Why it exists](#1-why-it-exists)
2. [Files](#2-files)
3. [The field](#3-the-field)
4. [The engine in the browser](#4-the-engine-in-the-browser)
5. [PHP](#5-php)
6. [The answer](#6-the-answer)
7. [What the engine forgives](#7-what-the-engine-forgives)
8. [Same rules on both sides](#8-same-rules-on-both-sides)
9. [Moving to a new Google release](#9-moving-to-a-new-google-release)
10. [Licence](#10-licence)

---

## 1. Why it exists

A free-text phone field loses customers. A British tourist types `07400 123456`, the form adds a `+`, and the
business receives `+07400123456`, a number nobody can dial. Typical inputs that break naive fields: a national
number with its trunk prefix, `00` instead of `+`, `+44 (0) …`, Thai or full-width digits, a number pasted with
another country's code, a wrong country picked by default.

REDZ.Phone understands all of these and either returns the number in E.164 or says exactly what is wrong, so the
person can fix it **before** the booking is sent. The field shows the number back with its country
(`+44 7400 123456 · United Kingdom`), which makes a wrong country obvious.

The browser checks while the person types; the server must check again on submit, and the two must never
disagree. Both sides therefore run Google's libphonenumber rules **from the same release**, and a gate proves
on every build that they answer alike (§8).

## 2. Files

| Path | What |
|---|---|
| `dist/redz.phone.min.js`, `dist/redz.phone.js` | engine and field: one global, `REDZ.Phone` (19 KB gzipped) |
| `dist/redz.phone.css` | the field's styles (1.5 KB gzipped) |
| `dist/flags.png`, `dist/flags@2x.png` | flag sprite, 18 KB and 42 KB; keep them next to `redz.phone.css` |
| `dist/meta/v9.0.41.json` | Google's rules for the browser, loaded on demand (41 KB gzipped) |
| `php/redz.phone.php` | PHP engine: functions `REDZ_Phone_*` |
| `php/libphonenumber/` | giggsey/libphonenumber-for-php-lite, unmodified |
| `docs/` | the demo (GitHub Pages); `docs/redz.phone/` is a copy of the release files |
| `src/`, `tools/`, `tests/` | sources, build, gate and browser tests, test data (not needed at runtime) |

To use it, copy `dist/` (browser) and `php/` (server). Nothing else is needed at runtime.

## 3. The field

```html
<link rel="stylesheet" href="/lib/redz.phone/redz.phone.css">

<label for="phone">Phone</label>
<input id="phone" name="phone" type="tel" required>

<script src="/lib/redz.phone/redz.phone.min.js"></script>
<script>
	const phone = REDZ.Phone.field(document.getElementById('phone'), {
		country: 'auto',
		popular: ['TH', 'GB', 'RU', 'CN', 'US'],
		methods: ['call', 'whatsapp', 'telegram', 'line'],
		hidden: {country: 'phone_country', method: 'contact'},
	});
	form.addEventListener('submit', (e) => {
		if (!phone.check().valid) {
			e.preventDefault();
		}
	});
</script>
```

`REDZ.Phone.field(input, options)` wraps an existing `<input>`. It puts a country button (flag, calling code) over the
start of the input, a line under it for the number read back or the problem, and optionally a choice of contact
method. The input stays the site's own: its classes, name and value are untouched, and nothing reformats the
number while it is typed (input masks break pasting).

### Behaviour

- **The flag follows the number.** A typed or pasted `+44…` or `0044…` moves the flag to that country; a valid
  number shows its own region (`GG` for a Guernsey mobile typed as British).
- **Picking a country** while the input starts with another country's `+code` removes that code, otherwise the
  typed code would win over the pick.
- **Country list:** search by the name in the page language, the English name, the country's own name
  (`Deutschland`, `ไทย`), the ISO code or the calling code; `popular` countries first, then all in the
  alphabetical order of the page language. Names come from the browser (`Intl.DisplayNames`); where it has none,
  the ISO code is shown.
- **Default country:** `country: 'auto'` takes the region of the browser's first language (`en-GB` → GB). A
  language without a region (`en`) says nothing about the country, so the field starts without one. Never by IP.
- **Messages:** `too_long` shows at once; the others after the person leaves the field or after `check()`, and
  from then on they follow every change.
- **`unallocated`** (a possible number in no range Google lists) shows a warning with a **"The number is correct"**
  checkbox; the field is not valid until it is ticked.
- **Plain forms:** the field sets the input's custom validity, so the browser will not submit a wrong number even
  without any script of yours.
- **No rules, no blocking:** if the rules file cannot be loaded, the country button disappears and the input works
  as a plain field (`result: null`, `valid: true` for any non-empty input).
- **Labels:** prefer `<label for>`. If the input sits inside its `<label>`, the field points the label at the
  input, because otherwise the label would now name the country button.
- **Right to left:** in an RTL page the button sits on the right; the number itself is always left to right.
- **Accessibility:** the button is `aria-haspopup="listbox"`; the search is a `combobox` with
  `aria-activedescendant` over a `listbox`; methods are a `radiogroup` with arrow keys; the message is tied to the
  input with `aria-describedby` and `aria-invalid`. Keys: Enter, Space or ↓ opens the list, a letter opens it
  with that letter searched, ↑ ↓ PageUp PageDown move, Enter picks, Escape closes.

### Options

| Option | Default | Meaning |
|---|---|---|
| `country` | `'auto'` | starting country: an ISO code, `'auto'` (browser language with a region) or `''` (none) |
| `popular` | `[]` | ISO codes listed first, in this order |
| `types` | `['MOBILE']` | accepted number types, as in `parse` (§6); `[]` accepts any |
| `methods` | `[]` | contact methods to offer, in this order: `'call'`, `'whatsapp'`, `'telegram'`, `'line'` |
| `method` | `''` | the method chosen at the start |
| `methodRequired` | `false` | the field is not valid until a method is chosen |
| `list` | `'float'` | `'float'`: the country list opens over the page; `'inline'`: in the page flow, for an iframe that sizes itself to its content |
| `lang` | the nearest `lang` attribute, else the browser's | language of the country names |
| `texts` | English | texts to replace, see below |
| `hidden` | `{}` | hidden inputs to keep filled, by name: `{e164: 'phone_e164', country: 'phone_country', method: 'contact'}` |
| `placeholder` | `true` | the country's example number as the input's placeholder |
| `meta` | `meta/<release>.json` next to the script | URL of the rules file |

### What you get

| Member | Meaning |
|---|---|
| `field.state()` | `{valid, input, country, method, confirmed, result}` |
| `field.check()` | shows every message, as for a submit, and returns `state()` |
| `field.set(value, country?)` | puts a number (and a country) in and checks it |
| `field.destroy()` | removes the field and gives the input back as it was |
| event `redzphone` | fired on the input (it bubbles) after every change; `event.detail` is `state()` |

- `valid` — the form may be sent: the number passes (`result.ok`), is confirmed when `unallocated`, and a method is
  chosen when one is required. An empty input is valid unless it is `required`.
- `input` — what the person typed; `country` — the country of the flag; `method` — `''` or the chosen method;
  `confirmed` — the checkbox of `unallocated`.
- `result` — the engine's answer (§6) for `input` and `country`, or `null` when the rules are not loaded.

**On the server**, send `input` and `country` (the `hidden` option does it for a plain form) and call
`REDZ_Phone_Parse($input, $country, $types)`: it gives the same answer as `result` did in the browser.

### Texts

Every text can be replaced through `texts`. `{country}` is the country's name, `{number}` the number in the
international format, `{example}` the country's example number.

| Key | Default |
|---|---|
| `country` | `Country` (the button's label: "Country: United Kingdom +44") |
| `choose` | `Choose a country` |
| `search` | `Country or code` |
| `countries` | `Countries` (the list's label) |
| `nothing` | `Nothing found` |
| `ok` | `{number} · {country}` |
| `example` | `Example: {example}` (added after `too_short`, `too_long`, `invalid`, `wrong_type`) |
| `empty` | `Enter a phone number` |
| `no_country` | `Choose a country or start the number with +` |
| `too_short` | `Too short for {country}.` |
| `too_long` | `Too long for {country}.` |
| `invalid` | `Not a valid number for {country}.` |
| `bad_code` | `Check the country code.` |
| `wrong_type` | `Enter a mobile number.` (change it if `types` is not `['MOBILE']`) |
| `unallocated` | `This number looks unusual for {country}. Please check it.` |
| `confirm` | `The number is correct` |
| `methods` | `How should we contact you?` (`''` hides it) |
| `method` | `Choose how we should contact you` |
| `call`, `whatsapp`, `telegram`, `line` | `Call`, `WhatsApp`, `Telegram`, `LINE` |

Russian, Thai, Hebrew and Chinese translations are in `docs/demo.js` (`FIELD`).

### Look

The field inherits the font and colour of the page. Adjust it with these variables on `.rzp` or any ancestor:
`--rzp-accent`, `--rzp-accent-soft`, `--rzp-border`, `--rzp-radius`, `--rzp-muted`, `--rzp-ok`, `--rzp-warn`,
`--rzp-error`, `--rzp-menu-bg`, `--rzp-menu-text`, `--rzp-menu-active`, `--rzp-z`, and the icon colours
`--rzp-call`, `--rzp-whatsapp`, `--rzp-telegram`, `--rzp-line`. Flags are 20×15; give `.rzp-flag` another size
and the sprite follows.

## 4. The engine in the browser

The field uses it, and it can be used alone:

```js
await REDZ.Phone.load();
REDZ.Phone.parse('07400 123456', 'GB', {types: ['MOBILE']});
// {ok: true, e164: '+447400123456', country: 'GB', type: 'MOBILE', international: '+44 7400 123456', …}
```

`load()` fetches `meta/<release>.json` next to the script; pass a URL if the file lives elsewhere. The rules
weigh 41 KB gzipped, so load them when the form needs them, not on every page (the field loads them itself).

| Member | Meaning |
|---|---|
| `REDZ.Phone.field(input, options?)` | the field (§3) |
| `REDZ.Phone.load(url?)` | Promise; fetches the rules once. Rejects with a readable message if the file is missing or wrong |
| `REDZ.Phone.setMeta(json)` | hand the rules over yourself (tests, bundlers). Rules of another Google release are refused |
| `REDZ.Phone.ready()` | `true` once the rules are in |
| `REDZ.Phone.parse(input, country?, {types?})` | the answer (§6). Throws if the rules are not loaded |
| `REDZ.Phone.example(country)` | Google's example number of the country (mobile where there is one), national format |
| `REDZ.Phone.normalize(input)` | digits of any script → ASCII, only digits and a leading `+` kept |
| `REDZ.Phone.countries()` | `{ISO: callingCode}` for all 245 regions, sorted by ISO |
| `REDZ.Phone.version`, `REDZ.Phone.google` | library version, Google release it is built for |

Browsers: any browser from 2021 on (the bundle targets ES2018; the field uses `Intl.DisplayNames`,
`ResizeObserver` and `fetch`).

`REDZ` is a namespace shared by REDZ scripts: the bundle adds `Phone` to an existing `window.REDZ` and creates it
when it is missing. A script that defines `REDZ` too must extend it the same way (`window.REDZ = window.REDZ || {}`),
never replace it, and never declare it with `let` or `const`.

## 5. PHP

```php
require '/path/to/redz.phone/php/redz.phone.php';

$r = REDZ_Phone_Parse($_POST['phone'] ?? '', $_POST['phone_country'] ?? 'TH', ['MOBILE']);
if ($r['ok']) {
	$phone = $r['e164']; // store this
}
```

Requirements: **PHP 8.5+** with `mbstring`. No Composer: `redz.phone.php` registers its own autoloader for the
copy in `php/libphonenumber/`. If your application already loads giggsey/libphonenumber-for-php through Composer,
both register the same `libphonenumber\` classes and the first loaded wins; keep the versions equal.

| Function | Meaning |
|---|---|
| `REDZ_Phone_Parse(string $input, string $country = '', array $types = []): array` | the answer (§6) |
| `REDZ_Phone_Normalize(string $input): string` | as `REDZ.Phone.normalize` |
| `REDZ_Phone_Countries(): array` | as `REDZ.Phone.countries()` |
| `REDZ_Phone_Version(): string`, `REDZ_Phone_Google(): string` | library version, Google release in use |

## 6. The answer

Both engines return the same object for the same `(input, country, types)`.

| Field | Meaning |
|---|---|
| `ok` | `true` when the number may be accepted (a `warning` may still be set) |
| `error` | why it may not; `null` when `ok` |
| `warning` | `unallocated` or `null` |
| `e164` | `+447400123456`; store this one |
| `country` | ISO region of the number (`GG` for a Guernsey mobile even if `GB` was suggested); `null` for global numbers such as +800 |
| `code` | calling code, `44` |
| `type` | `MOBILE`, `FIXED_LINE`, `FIXED_LINE_OR_MOBILE` (no way to tell, e.g. US), `TOLL_FREE`, `PREMIUM_RATE`, `SHARED_COST`, `VOIP`, `PERSONAL_NUMBER`, `PAGER`, `UAN`, `VOICEMAIL`; `null` when unknown |
| `international` | `+44 7400 123456`, groups separated by spaces; use it for display |

`e164`, `country`, `code`, `type` and `international` are filled when `ok`, and also for `wrong_type`.

| `error` | When |
|---|---|
| `empty` | no digit at all |
| `no_country` | a national number and no `country` to read it with |
| `too_short` | fewer digits than any number of that country (or of `types`) |
| `too_long` | more digits than any number of that country (or of `types`) |
| `invalid` | no such calling code, or a length between the allowed ones |
| `wrong_type` | a real number of a type outside `types`, e.g. a landline when `['MOBILE']` is asked |

**`unallocated`** — the length is possible but the number falls in no range Google lists. Google updates ranges
every two weeks, so a brand-new range can look unallocated; that is why it is a warning, not an error. It also
catches typos, so ask the person to confirm the number rather than accepting it silently (the field does).

**`types`** — pass the types you accept. For a contact number `['MOBILE']` is the usual choice:
`FIXED_LINE_OR_MOBILE` is accepted for it, and the length is then judged by mobile lengths, so a mobile short
of one digit becomes `too_short` instead of a mere warning.

## 7. What the engine forgives

- Spaces, brackets, dashes, dots, letters (`tel:+44…`) are ignored. Extensions are not supported and make the
  number `too_long`.
- Digits of any script: Thai `๐๘๑…`, full-width `０８１…`, Arabic-Indic, Devanagari and every other Unicode digit.
- A national number with its trunk prefix (`0`, `8`) when `country` is given; `+44 (0) 7911…`.
- A typed or pasted `+code` overrides `country`.
- `00…` is read as `+…` first. The country's own international prefix (`001` in Thailand, `810` in Russia, `011`
  in the US) is used only when that reading gives a better answer.
- `+0…` is read as a national number: no calling code starts with 0.
- A calling code typed without `+` in front of a national number of the same country (`44 7911 123456` with `GB`).

## 8. Same rules on both sides

- One Google release is pinned in `tools/pins.json`. The browser rules are generated from that release's XML;
  the PHP side is giggsey-lite of the same release.
- `npm run gate` (Node.js 20+ and PHP 8.5 in `PATH`) is green only when:
  - the release is the same in the browser rules, the bundle, PHP and the pins, and the library version is the
    same in `package.json`, the bundle and PHP;
  - the browser rules equal the PHP rules for every region and type (patterns, lengths, prefixes);
  - both engines give the same answer on 12,625 inputs: Google's example number for every region and type in a
    dozen spellings, plus the hand-written cases of `tests/cases.json`, which also carry the expected answers;
  - the vendored PHP library, the browser rules and the flag sprites are byte-for-byte what `npm run update`
    produced; `dist/` is not older than `src/`, and the demo's copy in `docs/redz.phone/` equals `dist/`.
- Every run first plants nine breaks (another release, a changed rule, a wrong expectation, an edited vendor
  file, a changed sprite…) and fails if it misses any of them.
- `tests/known.json` lists where the two engines knowingly differ: one input that nobody types (`+1 1 310 1234`).
- `npm run uitest` drives the field in headless Chrome (set `CHROME` if it is not in the usual place): 24
  scenarios of typing, keyboard, touch, search, right-to-left, labels, missing rules, the shared `REDZ` namespace,
  plus the demo in five languages at phone width, with screenshots in `.cache/ui/`.

## 9. Moving to a new Google release

```sh
npm install
npm run update -- v9.0.42
npm run build
npm run gate
npm run uitest
```

`update` also redraws the flag sprite from flag-icons for the regions of that release. Then raise the version in
`package.json` and `REDZ_PHONE_VERSION` (`php/redz.phone.php`), add a `changelog.md` entry and rebuild. Google
releases every two weeks; giggsey-lite follows within hours.

## 10. Licence

MIT, see `LICENSE`. The bundled parts of Google libphonenumber, libphonenumber-js, libphonenumber-for-php-lite,
flag-icons and Bootstrap Icons keep their own licences, see `NOTICE`. WhatsApp, Telegram and LINE are trademarks
of their owners; their icons come from Simple Icons and only say which way the person wants to be contacted.
