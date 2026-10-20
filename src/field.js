// REDZ.Phone field: a country picker, a live check and contact methods around an existing <input>.
import {load, ready, parse, countries, example, normalize, codeOf, regionsOf} from './engine.js';

/* global REDZ_PHONE_FLAGS */
// Rows of dist/flags.png, top to bottom; the last one, XX, stands for "no country".
const FLAGS = REDZ_PHONE_FLAGS.split(' ');
const NONE = 'XX';
const TEXTS = {
	country: 'Country',
	choose: 'Choose a country',
	search: 'Country or code',
	countries: 'Countries',
	nothing: 'Nothing found',
	ok: '{number} · {country}',
	example: 'Example: {example}',
	empty: 'Enter a phone number',
	no_country: 'Choose a country or start the number with +',
	too_short: 'Too short for {country}.',
	too_long: 'Too long for {country}.',
	invalid: 'Not a valid number for {country}.',
	bad_code: 'Check the country code.',
	wrong_type: 'Enter a mobile number.',
	unallocated: 'This number looks unusual for {country}. Please check it.',
	confirm: 'The number is correct',
	methods: 'How should we contact you?',
	method: 'Choose how we should contact you',
	call: 'Call',
	whatsapp: 'WhatsApp',
	telegram: 'Telegram',
	line: 'LINE',
};
// [viewBox size, path]: call — Bootstrap Icons telephone-fill (MIT); the brands — Simple Icons (CC0).
const ICONS = {
	call: [16, 'M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z'],
	whatsapp: [24, 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'],
	telegram: [24, 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'],
	line: [24, 'M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314'],
};
const SAVED = ['dir', 'autocomplete', 'inputmode', 'placeholder', 'aria-describedby', 'aria-invalid'];
const fields = new WeakMap();
const byLanguage = new Map();
let serial = 0;

export function field(input, options = {}) {
	if (fields.has(input)) {
		return fields.get(input);
	}
	const o = {country: 'auto', popular: [], types: ['MOBILE'], methods: [], method: '', methodRequired: false, lang: '', texts: {}, list: 'float', hidden: {}, placeholder: true, meta: undefined, ...options};
	const t = {...TEXTS, ...o.texts};
	const id = `rzp${++serial}`;
	const lang = o.lang || input.closest('[lang]')?.lang || navigator.language || 'en';
	const methods = [].concat(o.methods || []).filter((m) => ICONS[m]);
	const nameOf = namer(lang);
	const samples = {};
	const sampleOf = (iso) => (samples[iso] ??= example(iso));
	const st = {
		country: pickable(o.country === 'auto' ? browserCountry() : o.country),
		method: methods.includes(o.method) ? o.method : '',
		confirmed: '',
		revealed: false,
		off: false,
		result: null,
		valid: false,
		note: '',
		open: false,
		items: null,
		visible: [],
		active: -1,
	};
	let codes = {};

	const saved = Object.fromEntries(SAVED.map((a) => [a, input.getAttribute(a)]));
	const savedPad = [input.style.paddingLeft, input.style.paddingRight];
	const cs = getComputedStyle(input);
	const pad = [parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), parseFloat(cs.paddingRight) + parseFloat(cs.borderRightWidth)].map((v) => v || 0);

	const root = el('div', o.list === 'inline' ? 'rzp rzp-inline' : 'rzp');
	const line = el('div', 'rzp-line');
	const button = el('button', 'rzp-country', {type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': `${id}-list`});
	const flag = el('span', 'rzp-flag', {'aria-hidden': 'true'});
	const dial = el('span', 'rzp-code', {dir: 'ltr'});
	button.append(flag, dial, el('span', 'rzp-caret', {'aria-hidden': 'true'}));
	const panel = el('div', 'rzp-list', {id: `${id}-list`, hidden: ''});
	const search = el('input', 'rzp-search', {type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-autocomplete': 'list', 'aria-controls': `${id}-options`, 'aria-label': t.search, placeholder: t.search, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false'});
	const listbox = el('ul', 'rzp-options', {id: `${id}-options`, role: 'listbox', 'aria-label': t.countries});
	const empty = el('div', 'rzp-empty', {hidden: ''}, t.nothing);
	panel.append(search, listbox, empty);
	const note = el('div', 'rzp-note', {id: `${id}-note`, 'aria-live': 'polite'});
	const confirm = el('label', 'rzp-confirm');
	const tick = el('input', '', {type: 'checkbox'});
	confirm.append(tick, el('span', '', {}, t.confirm));

	input.before(root);
	line.append(button, input);
	root.append(line, panel, note);

	const radios = methods.map((m) => {
		const b = el('button', `rzp-method rzp-method-${m}`, {type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: '-1'});
		b.dataset.method = m;
		b.append(icon(m), el('span', '', {}, t[m]));
		return b;
	});
	const group = el('div', 'rzp-radios', {role: 'radiogroup'});
	if (radios.length) {
		const box = el('div', 'rzp-methods');
		if (t.methods) {
			box.append(el('div', 'rzp-methods-label', {id: `${id}-methods`}, t.methods));
			group.setAttribute('aria-labelledby', `${id}-methods`);
		}
		group.append(...radios);
		box.append(group);
		root.append(box);
	}
	const hidden = {};
	for (const key of ['e164', 'country', 'method']) {
		if (o.hidden?.[key]) {
			hidden[key] = el('input', '', {type: 'hidden', name: o.hidden[key]});
			root.append(hidden[key]);
		}
	}

	input.dir = saved.dir ?? 'ltr';
	input.autocomplete = saved.autocomplete ?? 'tel';
	input.inputMode = saved.inputmode ?? 'tel';
	input.setAttribute('aria-describedby', [saved['aria-describedby'], note.id].filter(Boolean).join(' '));
	// A wrapping <label> would now label the country button, the first control inside it; point it back at the input.
	const host = input.parentElement?.closest('label');
	const hostFor = host && !host.htmlFor ? (input.id ? '' : `${id}-input`) : null;
	if (hostFor !== null) {
		input.id ||= hostFor;
		host.htmlFor = input.id;
	}

	function repad() {
		const rtl = getComputedStyle(root).direction === 'rtl';
		const side = rtl ? 1 : 0;
		[input.style.paddingLeft, input.style.paddingRight] = savedPad;
		if (st.off) {
			return;
		}
		button.style.paddingLeft = button.style.paddingRight = '';
		button.style[rtl ? 'paddingRight' : 'paddingLeft'] = `${pad[side]}px`;
		input.style[rtl ? 'paddingRight' : 'paddingLeft'] = `${button.offsetWidth}px`;
	}
	const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(repad) : null;
	resize?.observe(button);

	function shown() {
		const r = st.result;
		const n = normalize(input.value);
		const code = r?.code || (ready() && /^\+[1-9]/.test(n) ? codeOf(n.slice(1)) : '');
		if (code && !regionsOf(code).length) {
			return {iso: NONE, code};
		}
		return {iso: st.country || NONE, code: st.country ? (codes[st.country] ?? '') : ''};
	}

	function place() {
		const s = shown();
		return s.iso !== NONE ? nameOf(s.iso) : (s.code ? `+${s.code}` : '');
	}

	// A typed "+code" moves the flag to its region; a valid number shows its own region (GG inside +44).
	function follow() {
		const r = st.result;
		if (r.country) {
			st.country = r.country;
			return;
		}
		const n = normalize(input.value);
		const code = r.code || (/^\+[1-9]/.test(n) ? codeOf(n.slice(1)) : '');
		const regions = code ? regionsOf(code) : [];
		if (regions.length && !regions.includes(st.country)) {
			st.country = regions[0];
		}
	}

	function badCode() {
		const n = normalize(input.value).replace(/^00/, '+');
		return /^\+[1-9]\d{2}/.test(n) && codeOf(n.slice(1)) === '';
	}

	function methodOk() {
		return !o.methodRequired || !methods.length || st.method !== '';
	}

	function assess() {
		if (st.off || !ready()) {
			return {valid: !input.required || input.value.trim() !== '', kind: '', show: false};
		}
		const r = st.result;
		if (r.error === 'empty') {
			return {valid: !input.required, kind: 'error', show: st.revealed && input.required, nodes: fill(t.empty)};
		}
		if (r.ok && r.warning) {
			return {valid: st.confirmed === r.e164 && methodOk(), kind: 'warn', show: true, nodes: fill(t.unallocated, {country: place()}), confirm: true};
		}
		if (r.ok) {
			return !methodOk() && st.revealed
				? {valid: false, kind: 'error', show: true, nodes: fill(t.method)}
				: {valid: methodOk(), kind: 'ok', show: true, nodes: r.country ? fill(t.ok, {number: r.international, country: place()}) : fill('{number}', {number: r.international})};
		}
		const key = r.error === 'invalid' && badCode() ? 'bad_code' : r.error;
		const nodes = fill(t[key] ?? t.invalid, {country: place()});
		const sample = ['too_short', 'too_long', 'invalid', 'wrong_type'].includes(key) ? sampleOf(st.country) : '';
		if (sample) {
			nodes.append(' ', fill(t.example, {example: sample}));
		}
		return {valid: false, kind: 'error', show: st.revealed || key === 'too_long', nodes};
	}

	function render() {
		root.classList.toggle('is-off', st.off);
		const s = shown();
		paint(flag, s.iso);
		dial.textContent = s.code ? `+${s.code}` : '';
		button.setAttribute('aria-label', s.iso !== NONE ? `${t.country}: ${nameOf(s.iso)}${s.code ? ` +${s.code}` : ''}` : (s.code ? `+${s.code}` : t.choose));
		if (o.placeholder && ready() && !st.off) {
			input.placeholder = sampleOf(st.country);
		}
		const a = assess();
		st.valid = a.valid;
		const text = a.nodes ? a.nodes.textContent : '';
		const key = a.show ? `${a.kind}|${text}|${st.confirmed}` : '';
		if (key !== st.note) {
			st.note = key;
			note.className = a.show ? `rzp-note is-${a.kind}` : 'rzp-note';
			note.replaceChildren(...(a.show ? [a.nodes] : []));
			if (a.show && a.confirm) {
				tick.checked = st.confirmed !== '' && st.confirmed === st.result.e164;
				note.append(confirm);
			}
		}
		if (a.show && a.kind === 'error') {
			input.setAttribute('aria-invalid', 'true');
		} else if (saved['aria-invalid'] === null) {
			input.removeAttribute('aria-invalid');
		}
		input.setCustomValidity(a.valid ? '' : (text || t.empty));
		radios.forEach((b, i) => {
			const on = b.dataset.method === st.method;
			b.setAttribute('aria-checked', String(on));
			b.tabIndex = on || (st.method === '' && i === 0) ? 0 : -1;
		});
		group.classList.toggle('is-missing', !methodOk() && st.revealed);
		if (hidden.e164) {
			hidden.e164.value = st.result?.ok ? st.result.e164 : '';
		}
		if (hidden.country) {
			hidden.country.value = st.country;
		}
		if (hidden.method) {
			hidden.method.value = st.method;
		}
		repad();
	}

	function evaluate() {
		if (!st.off && ready()) {
			st.result = parse(input.value, st.country, {types: o.types});
			follow();
		}
	}

	function update() {
		evaluate();
		render();
		input.dispatchEvent(new CustomEvent('redzphone', {bubbles: true, detail: state()}));
	}

	function state() {
		return {valid: st.valid, input: input.value, country: st.country, method: st.method, confirmed: st.result?.warning ? st.confirmed === st.result.e164 : false, result: st.result};
	}

	function build() {
		const all = Object.keys(codes).map((iso) => ({iso, code: codes[iso], name: nameOf(iso)}));
		const collate = collator(lang);
		all.sort((a, b) => collate(a.name, b.name));
		const make = (c, prefix) => {
			const li = el('li', '', {role: 'option', id: `${id}-${prefix}${c.iso}`, 'aria-selected': 'false'});
			const f = el('span', 'rzp-flag', {'aria-hidden': 'true'});
			paint(f, c.iso);
			li.dataset.iso = c.iso;
			li.append(f, el('span', 'rzp-name', {}, c.name), el('span', 'rzp-dial', {dir: 'ltr'}, `+${c.code}`));
			return {...c, li};
		};
		const popular = [].concat(o.popular || []).map((iso) => String(iso).toUpperCase()).filter((iso, i, list) => codes[iso] && list.indexOf(iso) === i);
		st.items = {popular: popular.map((iso) => make(all.find((c) => c.iso === iso), 'p')), all: all.map((c) => make(c, 'o'))};
		st.items.popular[st.items.popular.length - 1]?.li.classList.add('rzp-last');
	}

	function keys(c) {
		c.keys ??= [c.name, english(c.iso), endonym(c.iso)].filter(Boolean).map(fold);
		return c.keys;
	}

	function score(c, q, digits) {
		if (digits !== '') {
			return c.code.startsWith(digits) ? (c.code === digits ? 0 : 1) : 9;
		}
		if (q === c.iso.toLowerCase()) {
			return 0;
		}
		let best = 9;
		for (const name of keys(c)) {
			const at = name.indexOf(q);
			if (at === 0) {
				return 1;
			}
			if (at > 0) {
				best = Math.min(best, /[\s\-(.'’]/.test(name[at - 1]) ? 2 : 3);
			}
		}
		return best;
	}

	function filter() {
		const q = fold(search.value.trim());
		let list;
		if (q === '') {
			list = [...st.items.popular, ...st.items.all];
		} else {
			const digits = /^\+?\d+$/.test(q) ? q.replace('+', '') : '';
			list = st.items.all.map((c) => ({c, s: score(c, q, digits)})).filter((x) => x.s < 9).sort((a, b) => a.s - b.s).map((x) => x.c);
		}
		list.forEach((c) => c.li.setAttribute('aria-selected', String(c.iso === st.country)));
		st.visible[st.active]?.li.classList.remove('is-active');
		listbox.replaceChildren(...list.map((c) => c.li));
		empty.hidden = list.length > 0;
		st.visible = list;
		st.active = -1;
		activate(q === '' ? Math.max(0, list.findIndex((c) => c.iso === st.country)) : 0, q === '');
	}

	function activate(i, center = false) {
		st.visible[st.active]?.li.classList.remove('is-active');
		const c = st.visible[i];
		st.active = c ? i : -1;
		if (!c) {
			search.removeAttribute('aria-activedescendant');
			return;
		}
		c.li.classList.add('is-active');
		search.setAttribute('aria-activedescendant', c.li.id);
		const top = c.li.offsetTop;
		const bottom = top + c.li.offsetHeight;
		if (center) {
			listbox.scrollTop = top - (listbox.clientHeight - c.li.offsetHeight) / 2;
		} else if (top < listbox.scrollTop) {
			listbox.scrollTop = top;
		} else if (bottom > listbox.scrollTop + listbox.clientHeight) {
			listbox.scrollTop = bottom - listbox.clientHeight;
		}
	}

	function open(seed = '') {
		if (st.off || st.open) {
			return;
		}
		if (!ready()) {
			load(o.meta).then(() => open(seed), () => {});
			return;
		}
		if (!st.items) {
			build();
		}
		st.open = true;
		panel.hidden = false;
		root.classList.add('is-open');
		button.setAttribute('aria-expanded', 'true');
		search.value = seed;
		filter();
		search.focus();
		document.addEventListener('pointerdown', outside, true);
	}

	function close(focusButton) {
		if (!st.open) {
			return;
		}
		st.open = false;
		panel.hidden = true;
		root.classList.remove('is-open');
		button.setAttribute('aria-expanded', 'false');
		document.removeEventListener('pointerdown', outside, true);
		if (focusButton) {
			button.focus();
		}
	}

	function outside(e) {
		if (!root.contains(e.target)) {
			close(false);
		}
	}

	function choose(iso) {
		close(false);
		const n = normalize(input.value);
		const code = /^\+[1-9]/.test(n) ? codeOf(n.slice(1)) : '';
		// A typed "+code" of another country would win over the pick, so the pick removes it.
		if (code && !regionsOf(code).includes(iso)) {
			input.value = dropDigits(input.value, code.length);
		}
		st.country = iso;
		input.focus();
		update();
	}

	function pickMethod(b) {
		st.method = b.dataset.method;
		b.focus();
		update();
	}

	const on = [];
	const listen = (target, type, fn, opts) => {
		target.addEventListener(type, fn, opts);
		on.push([target, type, fn, opts]);
	};
	listen(input, 'input', update);
	listen(input, 'change', update);
	listen(input, 'blur', () => {
		if (input.value.trim() !== '' && !st.revealed) {
			st.revealed = true;
			render();
		}
	});
	listen(input, 'invalid', () => {
		st.revealed = true;
		render();
	});
	if (input.form) {
		listen(input.form, 'reset', () => setTimeout(update));
	}
	listen(button, 'click', () => (st.open ? close(true) : open()));
	listen(button, 'keydown', (e) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			open();
		} else if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			open(e.key);
		}
	});
	listen(search, 'input', filter);
	listen(search, 'keydown', (e) => {
		const step = {ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8}[e.key];
		if (step) {
			e.preventDefault();
			activate(Math.min(st.visible.length - 1, Math.max(0, st.active + step)));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (st.visible[st.active]) {
				choose(st.visible[st.active].iso);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			close(true);
		}
	});
	listen(panel, 'mousedown', (e) => {
		if (e.target !== search) {
			e.preventDefault();
		}
	});
	listen(panel, 'focusout', (e) => {
		if (!panel.contains(e.relatedTarget) && e.relatedTarget !== button) {
			close(false);
		}
	});
	listen(listbox, 'click', (e) => {
		const li = e.target.closest('li');
		if (li) {
			choose(li.dataset.iso);
		}
	});
	listen(listbox, 'mousemove', (e) => {
		const i = st.visible.findIndex((c) => c.li === e.target.closest('li'));
		if (i >= 0 && i !== st.active) {
			activate(i);
		}
	});
	listen(tick, 'change', () => {
		st.confirmed = tick.checked ? st.result.e164 : '';
		update();
	});
	listen(group, 'click', (e) => {
		const b = e.target.closest('.rzp-method');
		if (b) {
			pickMethod(b);
		}
	});
	listen(group, 'keydown', (e) => {
		const rtl = getComputedStyle(root).direction === 'rtl';
		const step = {ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1}[e.key];
		const at = radios.indexOf(document.activeElement);
		if (step && at >= 0) {
			e.preventDefault();
			pickMethod(radios[(at + step + radios.length) % radios.length]);
		}
	});

	function destroy() {
		close(false);
		on.forEach(([target, type, fn, opts]) => target.removeEventListener(type, fn, opts));
		resize?.disconnect();
		root.before(input);
		root.remove();
		SAVED.forEach((a) => (saved[a] === null ? input.removeAttribute(a) : input.setAttribute(a, saved[a])));
		[input.style.paddingLeft, input.style.paddingRight] = savedPad;
		if (hostFor !== null) {
			host.removeAttribute('for');
			if (hostFor !== '') {
				input.removeAttribute('id');
			}
		}
		input.setCustomValidity('');
		fields.delete(input);
	}

	const api = {
		state,
		check() {
			st.revealed = true;
			render();
			return state();
		},
		set(value, country) {
			input.value = value ?? '';
			if (country !== undefined) {
				st.country = pickable(country);
			}
			update();
			return api;
		},
		destroy,
	};
	fields.set(input, api);
	if (ready()) {
		codes = countries();
	}
	evaluate();
	render();
	load(o.meta).then(() => {
		codes = countries();
		if (fields.get(input) === api) {
			update();
		}
	}, (e) => {
		st.off = true;
		if (fields.get(input) === api) {
			render();
			input.dispatchEvent(new CustomEvent('redzphone', {bubbles: true, detail: state()}));
		}
		console.warn(e.message);
	});
	return api;
}

function el(tag, className, attrs = {}, text = '') {
	const node = document.createElement(tag);
	if (className) {
		node.className = className;
	}
	for (const [k, v] of Object.entries(attrs)) {
		node.setAttribute(k, v);
	}
	if (text) {
		node.textContent = text;
	}
	return node;
}

function icon(method) {
	const [size, d] = ICONS[method];
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
	svg.setAttribute('aria-hidden', 'true');
	svg.setAttribute('focusable', 'false');
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute('d', d);
	svg.append(path);
	return svg;
}

// Text with {placeholders}; numbers stay left-to-right inside right-to-left text.
function fill(text, values = {}) {
	const out = document.createDocumentFragment();
	String(text).split(/(\{\w+\})/).forEach((part) => {
		const key = /^\{(\w+)\}$/.exec(part)?.[1];
		if (key === undefined || !(key in values)) {
			if (part) {
				out.append(part);
			}
		} else {
			out.append(key === 'country' ? values[key] : el('span', '', {dir: 'ltr'}, values[key]));
		}
	});
	return out;
}

// One sprite row per flag: the row is chosen by percentage, so the flag may be drawn at any size.
function paint(node, iso) {
	const i = FLAGS.includes(iso) ? FLAGS.indexOf(iso) : FLAGS.length - 1;
	node.style.backgroundPosition = `0 ${(i / (FLAGS.length - 1)) * 100}%`;
}

function pickable(iso) {
	const up = String(iso ?? '').trim().toUpperCase();
	return up !== NONE && FLAGS.includes(up) ? up : '';
}

// Only a region the person's first browser language names; a bare language says nothing about the country.
function browserCountry() {
	const tag = (navigator.languages && navigator.languages[0]) || navigator.language || '';
	try {
		return pickable(new Intl.Locale(tag).region);
	} catch {
		return pickable(/-([a-z]{2})(?:-|$)/i.exec(tag)?.[1]);
	}
}

function displayNames(lang) {
	if (!byLanguage.has(lang)) {
		let names = null;
		try {
			names = new Intl.DisplayNames([lang, 'en'], {type: 'region'});
		} catch {
			try {
				names = new Intl.DisplayNames(['en'], {type: 'region'});
			} catch {
				names = null;
			}
		}
		byLanguage.set(lang, names);
	}
	return byLanguage.get(lang);
}

function namer(lang) {
	const names = displayNames(lang);
	return (iso) => names?.of(iso) || iso;
}

function english(iso) {
	return displayNames('en')?.of(iso) || '';
}

// The country's name in its own main language: "Deutschland", "ไทย".
function endonym(iso) {
	try {
		return displayNames(new Intl.Locale(`und-${iso}`).maximize().language)?.of(iso) || '';
	} catch {
		return '';
	}
}

function collator(lang) {
	try {
		return new Intl.Collator(lang).compare;
	} catch {
		return (a, b) => (a < b ? -1 : (a > b ? 1 : 0));
	}
}

function fold(s) {
	return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

// What the person typed without the leading "+" and the first n digits, and the separators right after them.
function dropDigits(raw, n) {
	const chars = [...raw];
	let i = 0;
	for (; i < chars.length && n > 0; i++) {
		if (/\d/.test(normalize(chars[i]))) {
			n--;
		}
	}
	return chars.slice(i).join('').replace(/^[\s\-.)\]/]+/, '');
}
