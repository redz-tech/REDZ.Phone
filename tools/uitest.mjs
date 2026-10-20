// Drives the field in headless Chrome: each scenario on a fresh page of tests/ui.html, then screenshots of the demo
// in every language at phone width into .cache/ui/.
// Usage: npm run build && npm run uitest   (Chrome: $CHROME, or the usual install path)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {ROOT} from './common.mjs';

const SHOTS = path.join(ROOT, '.cache', 'ui');
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml'};
const KEYS = {Enter: 13, Escape: 27, Tab: 9, ArrowDown: 40, ArrowUp: 38, ArrowLeft: 37, ArrowRight: 39, Backspace: 8, End: 35};
const DEMO_LANGS = ['en', 'ru', 'th', 'he', 'zh'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function serve() {
	const server = http.createServer((req, res) => {
		const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
		if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
			res.writeHead(404).end();
			return;
		}
		res.writeHead(200, {'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store'}).end(fs.readFileSync(file));
	});
	return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function launch() {
	const bin = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium']
		.find((p) => p && fs.existsSync(p));
	if (!bin) {
		throw new Error('Chrome not found: set CHROME to its binary');
	}
	const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'redzphone-chrome-'));
	const proc = spawn(bin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', 'about:blank'], {stdio: ['ignore', 'ignore', 'pipe']});
	const url = await new Promise((resolve, reject) => {
		let log = '';
		proc.stderr.on('data', (d) => {
			log += d;
			const m = /DevTools listening on (ws:\S+)/.exec(log);
			if (m) {
				resolve(m[1]);
			}
		});
		proc.on('exit', () => reject(new Error(`Chrome exited: ${log}`)));
	});
	return {proc, profile, url};
}

// The DevTools protocol over one browser connection, page sessions flattened into it.
class Cdp {
	constructor(url) {
		this.ws = new WebSocket(url);
		this.seq = 0;
		this.pending = new Map();
		this.waiters = [];
	}

	open() {
		return new Promise((resolve, reject) => {
			this.ws.onopen = resolve;
			this.ws.onerror = () => reject(new Error('cannot reach Chrome'));
			this.ws.onmessage = (m) => this.receive(JSON.parse(m.data));
		});
	}

	receive(msg) {
		if (msg.id) {
			const p = this.pending.get(msg.id);
			this.pending.delete(msg.id);
			if (msg.error) {
				p.reject(new Error(`${p.method}: ${msg.error.message}`));
			} else {
				p.resolve(msg.result);
			}
			return;
		}
		this.waiters = this.waiters.filter((w) => {
			const hit = w.method === msg.method && w.session === msg.sessionId;
			if (hit) {
				w.resolve(msg.params);
			}
			return !hit;
		});
	}

	send(method, params = {}, sessionId = undefined) {
		const id = ++this.seq;
		this.ws.send(JSON.stringify({id, method, params, sessionId}));
		return new Promise((resolve, reject) => this.pending.set(id, {resolve, reject, method}));
	}

	wait(method, session) {
		return new Promise((resolve) => this.waiters.push({method, session, resolve}));
	}
}

class Page {
	constructor(cdp, session, base) {
		this.cdp = cdp;
		this.session = session;
		this.base = base;
	}

	send(method, params) {
		return this.cdp.send(method, params, this.session);
	}

	async ev(expression) {
		const r = await this.send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
		if (r.exceptionDetails) {
			throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
		}
		return r.result.value;
	}

	async goto(rel) {
		const loaded = this.cdp.wait('Page.loadEventFired', this.session);
		await this.send('Page.navigate', {url: this.base + rel});
		await loaded;
	}

	async waitFor(expression, ms = 4000) {
		for (const end = Date.now() + ms; Date.now() < end; await sleep(20)) {
			if (await this.ev(expression)) {
				return;
			}
		}
		throw new Error(`timed out waiting for ${expression}`);
	}

	// Enter carries its text, so a focused button gets clicked as with a real keyboard.
	async key(key) {
		const code = KEYS[key];
		const down = key === 'Enter' ? {type: 'keyDown', text: '\r'} : {type: 'rawKeyDown'};
		await this.send('Input.dispatchKeyEvent', {...down, key, code: key, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code});
		await this.send('Input.dispatchKeyEvent', {type: 'keyUp', key, code: key, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code});
	}

	async char(ch) {
		const code = ch.toUpperCase().charCodeAt(0);
		await this.send('Input.dispatchKeyEvent', {type: 'keyDown', key: ch, text: ch, windowsVirtualKeyCode: code});
		await this.send('Input.dispatchKeyEvent', {type: 'keyUp', key: ch, windowsVirtualKeyCode: code});
	}

	type(text) {
		return this.send('Input.insertText', {text});
	}

	focus(selector) {
		return this.ev(`document.querySelector(${JSON.stringify(selector)}).focus()`);
	}

	async click(selector) {
		const [x, y] = await this.ev(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
		await this.send('Input.dispatchMouseEvent', {type: 'mouseMoved', x, y});
		await this.send('Input.dispatchMouseEvent', {type: 'mousePressed', x, y, button: 'left', clickCount: 1});
		await this.send('Input.dispatchMouseEvent', {type: 'mouseReleased', x, y, button: 'left', clickCount: 1});
	}

	async tap(selector) {
		const [x, y] = await this.ev(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
		await this.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
		await this.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
	}

	async mount(options, extra = {}) {
		await this.ev(`(${mount})(${JSON.stringify(options)}, ${JSON.stringify(extra)})`);
		await this.waitFor('window.events.length > 0');
	}

	state() {
		return this.ev('f.state()');
	}

	note() {
		return this.ev(`(() => { const n = document.querySelector('.rzp-note'); return {cls: n.className, text: n.textContent}; })()`);
	}

	attr(selector, name) {
		return this.ev(`document.querySelector(${JSON.stringify(selector)})?.getAttribute(${JSON.stringify(name)}) ?? null`);
	}

	options() {
		return this.ev(`[...document.querySelectorAll('.rzp-options li')].map((li) => li.dataset.iso)`);
	}

	async shot(name) {
		const {data} = await this.send('Page.captureScreenshot', {format: 'png'});
		fs.writeFileSync(path.join(SHOTS, `${name}.png`), Buffer.from(data, 'base64'));
	}
}

// Runs in the page: a fresh form with one phone input, the field on it, every redzphone event kept.
function mount(options, extra) {
	if (extra.lang) {
		document.documentElement.lang = extra.lang;
	}
	if (extra.dir) {
		document.documentElement.dir = extra.dir;
	}
	if (extra.languages) {
		Object.defineProperty(navigator, 'languages', {get: () => extra.languages, configurable: true});
	}
	const stage = document.getElementById('stage');
	stage.replaceChildren();
	const form = document.createElement('form');
	form.id = 'form';
	form.addEventListener('submit', (e) => e.preventDefault());
	const label = document.createElement('label');
	label.htmlFor = 'phone';
	label.textContent = 'Phone';
	const input = document.createElement('input');
	input.id = 'phone';
	input.name = 'phone';
	input.type = 'tel';
	input.className = 'field';
	input.required = Boolean(extra.required);
	const after = document.createElement('p');
	after.id = 'after';
	after.textContent = 'after the field';
	if (extra.wrapped) {
		label.removeAttribute('for');
		label.append(' ', input);
		form.append(label, after);
	} else {
		form.append(label, input, after);
	}
	stage.append(form);
	window.events = [];
	input.addEventListener('redzphone', (e) => window.events.push(e.detail));
	window.f = window.REDZ.Phone.field(input, options);
}

const tests = [];
const test = (name, fn) => tests.push({name, fn});

test('a UK mobile typed the local way', async (p, expect) => {
	await p.mount({country: 'GB'});
	await p.focus('#phone');
	await p.type('07400 123456');
	const s = await p.state();
	expect('valid', s.valid === true, s);
	expect('e164', s.result.e164 === '+447400123456', s.result);
	const note = await p.note();
	expect('note says the number and the country', note.cls.includes('is-ok') && note.text.includes('+44 7400 123456') && note.text.includes('United Kingdom'), note);
	expect('button names the country', await p.attr('.rzp-country', 'aria-label') === 'Country: United Kingdom +44', await p.attr('.rzp-country', 'aria-label'));
	expect('placeholder is a GB example', await p.attr('#phone', 'placeholder') === '07400 123456', await p.attr('#phone', 'placeholder'));
});

test('a stray + before the national number: +07400123456 with GB', async (p, expect) => {
	await p.mount({country: 'GB'});
	await p.focus('#phone');
	await p.type('+07400123456');
	const s = await p.state();
	expect('valid +447400123456', s.valid && s.result.e164 === '+447400123456', s.result);
});

test('wrong country: a GB mobile typed with TH picked', async (p, expect) => {
	await p.mount({country: 'TH'});
	await p.focus('#phone');
	await p.type('07400123456');
	const s = await p.state();
	expect('too_long', s.result.error === 'too_long' && !s.valid, s.result);
	const note = await p.note();
	expect('shown at once, names Thailand and an example', note.cls.includes('is-error') && note.text.includes('Too long for Thailand') && note.text.includes('081 234 5678'), note);
	expect('aria-invalid', await p.attr('#phone', 'aria-invalid') === 'true');
	expect('native validity carries the text', (await p.ev('document.getElementById("phone").validationMessage')).includes('Too long'));
});

test('a typed +code moves the flag', async (p, expect) => {
	await p.mount({country: 'TH'});
	await p.focus('#phone');
	await p.type('+44 7400 123456');
	let s = await p.state();
	expect('GB', s.country === 'GB' && s.valid, s);
	expect('button follows', await p.attr('.rzp-country', 'aria-label') === 'Country: United Kingdom +44');
	await p.ev(`f.set('+44 7781 123456')`);
	s = await p.state();
	expect('Guernsey number shows GG', s.country === 'GG', s.country);
	await p.ev(`f.set('+7 9')`);
	s = await p.state();
	expect('an unfinished +7 already shows RU', s.country === 'RU', s.country);
});

test('0044 and Thai digits with TH picked', async (p, expect) => {
	await p.mount({country: 'TH'});
	await p.focus('#phone');
	await p.type('0044 7911 123456');
	let s = await p.state();
	expect('0044 read as +44', s.valid && s.result.e164 === '+447911123456', s.result);
	await p.ev(`f.set('๐๘๑ ๒๓๔ ๕๖๗๘', 'TH')`);
	s = await p.state();
	expect('Thai digits', s.valid && s.result.e164 === '+66812345678', s.result);
});

test('an unfinished number is told off only after leaving the field', async (p, expect) => {
	await p.mount({country: 'TH'});
	await p.focus('#phone');
	await p.type('081 234 56');
	expect('silent while typing', (await p.note()).text === '', await p.note());
	await p.key('Tab');
	const note = await p.note();
	expect('too short after blur', note.cls.includes('is-error') && note.text.includes('Too short for Thailand'), note);
});

test('keyboard: open, search, choose, escape, type-ahead', async (p, expect) => {
	await p.mount({country: 'GB'});
	await p.focus('.rzp-country');
	await p.key('Enter');
	expect('open', await p.attr('.rzp-country', 'aria-expanded') === 'true');
	expect('focus in search', await p.ev('document.activeElement.classList.contains("rzp-search")'));
	expect('current country active', (await p.attr('.rzp-search', 'aria-activedescendant')).endsWith('-oGB'));
	await p.type('thai');
	expect('Thailand first', (await p.attr('.rzp-search', 'aria-activedescendant')).endsWith('-oTH'), await p.attr('.rzp-search', 'aria-activedescendant'));
	await p.key('Enter');
	expect('closed', await p.attr('.rzp-country', 'aria-expanded') === 'false');
	expect('TH picked', (await p.state()).country === 'TH');
	expect('focus back in the number', await p.ev('document.activeElement.id === "phone"'));
	await p.focus('.rzp-country');
	await p.key('ArrowDown');
	await p.key('ArrowDown');
	expect('arrow moves on', !(await p.attr('.rzp-search', 'aria-activedescendant')).endsWith('-oTH'));
	await p.key('Escape');
	expect('escape closes', await p.attr('.rzp-country', 'aria-expanded') === 'false');
	expect('focus on the button', await p.ev('document.activeElement.classList.contains("rzp-country")'));
	expect('escape keeps the country', (await p.state()).country === 'TH');
	await p.char('g');
	expect('a letter opens the search with it', await p.ev('document.querySelector(".rzp-search").value') === 'g');
});

test('search by calling code', async (p, expect) => {
	await p.mount({country: 'TH'});
	await p.click('.rzp-country');
	await p.type('+44');
	expect('the +44 regions', JSON.stringify(await p.options()) === '["GG","IM","JE","GB"]', await p.options());
	await p.ev(`(() => { const s = document.querySelector('.rzp-search'); s.value = 'xyzzy'; s.dispatchEvent(new Event('input')); })()`);
	expect('nothing found', await p.ev('!document.querySelector(".rzp-empty").hidden'));
});

test('Russian page: English names and own names find the country', async (p, expect) => {
	await p.mount({country: 'RU'}, {lang: 'ru'});
	expect('button in Russian', await p.attr('.rzp-country', 'aria-label') === 'Country: Россия +7', await p.attr('.rzp-country', 'aria-label'));
	await p.click('.rzp-country');
	const first = async (q) => {
		await p.ev(`(() => { const s = document.querySelector('.rzp-search'); s.value = ${JSON.stringify(q)}; s.dispatchEvent(new Event('input')); })()`);
		return p.ev(`(() => { const li = document.querySelector('.rzp-options li'); return li ? li.dataset.iso + ' ' + li.querySelector('.rzp-name').textContent : ''; })()`);
	};
	expect('germany', await first('germany') === 'DE Германия', await first('germany'));
	expect('deutschland', (await first('deutschland')).startsWith('DE'), await first('deutschland'));
	expect('ไทย', (await first('ไทย')).startsWith('TH'), await first('ไทย'));
	expect('таил', (await first('таил')).startsWith('TH'), await first('таил'));
	expect('соединённые finds Соединенные', (await first('соединённые')).startsWith('US'), await first('соединённые'));
});

test('picking a country drops a typed +code of another country', async (p, expect) => {
	await p.mount({country: 'TH'});
	await p.focus('#phone');
	await p.type('+44 81 234 5678');
	expect('followed +44', (await p.state()).country === 'GB');
	await p.click('.rzp-country');
	await p.type('thailand');
	await p.key('Enter');
	const s = await p.state();
	expect('code dropped', s.input === '81 234 5678', s.input);
	expect('valid in TH', s.country === 'TH' && s.valid && s.result.e164 === '+66812345678', s);
});

test('unallocated asks to confirm the number', async (p, expect) => {
	await p.mount({country: 'IL'});
	await p.focus('#phone');
	await p.type('050-123-4567');
	let s = await p.state();
	expect('warning, not valid yet', s.result.warning === 'unallocated' && !s.valid, s);
	const note = await p.note();
	expect('warning with a checkbox', note.cls.includes('is-warn') && await p.ev('!!document.querySelector(".rzp-confirm input")'), note);
	await p.click('.rzp-confirm input');
	s = await p.state();
	expect('confirmed and valid', s.valid && s.confirmed, s);
	await p.ev(`f.set('054-234-5678')`);
	s = await p.state();
	expect('a good number needs no checkbox', s.valid && !(await p.ev('!!document.querySelector(".rzp-confirm input")')), s);
});

test('contact methods: required, mouse and arrows', async (p, expect) => {
	await p.mount({country: 'GB', methods: ['call', 'whatsapp', 'telegram', 'line'], methodRequired: true});
	await p.focus('#phone');
	await p.type('07400 123456');
	let s = await p.state();
	expect('not valid without a method', !s.valid && s.method === '', s);
	await p.ev('f.check()');
	expect('check() asks for a method', (await p.note()).text === 'Choose how we should contact you', await p.note());
	await p.click('.rzp-method-whatsapp');
	s = await p.state();
	expect('whatsapp', s.valid && s.method === 'whatsapp', s);
	expect('aria-checked', await p.attr('.rzp-method-whatsapp', 'aria-checked') === 'true');
	await p.key('ArrowRight');
	expect('arrow right → telegram', (await p.state()).method === 'telegram');
	await p.key('ArrowLeft');
	await p.key('ArrowLeft');
	expect('arrow left twice → call', (await p.state()).method === 'call');
	expect('roving tabindex', JSON.stringify(await p.ev(`[...document.querySelectorAll('.rzp-method')].map((b) => b.tabIndex)`)) === '[0,-1,-1,-1]');
});

test('Hebrew page: right to left', async (p, expect) => {
	await p.mount({country: 'IL', methods: ['call', 'whatsapp']}, {lang: 'he', dir: 'rtl'});
	const r = await p.ev(`(() => { const b = document.querySelector('.rzp-country').getBoundingClientRect(); const i = document.getElementById('phone'); const ir = i.getBoundingClientRect(); const cs = getComputedStyle(i); return {b: [b.left, b.right], i: [ir.left, ir.right], pl: parseFloat(cs.paddingLeft), pr: parseFloat(cs.paddingRight), dir: i.dir}; })()`);
	expect('button at the right edge', Math.abs(r.b[1] - r.i[1]) < 2, r);
	expect('room made on the right', r.pr > r.pl + 20, r);
	expect('number stays ltr', r.dir === 'ltr', r);
	expect('Hebrew name', (await p.attr('.rzp-country', 'aria-label')).includes('ישראל'), await p.attr('.rzp-country', 'aria-label'));
	await p.click('.rzp-method-call');
	await p.key('ArrowLeft');
	expect('arrow left goes forward in rtl', (await p.state()).method === 'whatsapp');
	await p.click('.rzp-country');
	const list = await p.ev(`(() => { const l = document.querySelector('.rzp-list').getBoundingClientRect(); const i = document.getElementById('phone').getBoundingClientRect(); return [l.right, i.right]; })()`);
	expect('list hangs from the right', Math.abs(list[0] - list[1]) < 2, list);
});

test('inline list opens in the page flow', async (p, expect) => {
	await p.mount({country: 'GB', list: 'inline'});
	const before = await p.ev('document.getElementById("after").getBoundingClientRect().top');
	await p.click('.rzp-country');
	const open = await p.ev('document.getElementById("after").getBoundingClientRect().top');
	expect('pushes the page down', open - before > 150, [before, open]);
	await p.key('Escape');
	const closed = await p.ev('document.getElementById("after").getBoundingClientRect().top');
	expect('and back', Math.abs(closed - before) < 1, [before, closed]);
});

test('hidden inputs feed a plain form', async (p, expect) => {
	await p.mount({country: 'GB', methods: ['call'], hidden: {e164: 'phone_e164', country: 'phone_country', method: 'contact'}});
	await p.focus('#phone');
	await p.type('07400 123456');
	await p.click('.rzp-method-call');
	const data = await p.ev('Object.fromEntries(new FormData(document.getElementById("form")))');
	expect('form data', JSON.stringify(data) === JSON.stringify({phone: '07400 123456', phone_e164: '+447400123456', phone_country: 'GB', contact: 'call'}), data);
});

test('rules file missing: a plain field that never blocks', async (p, expect) => {
	await p.mount({country: 'GB', meta: '/missing.json'});
	expect('off', await p.ev('!!document.querySelector(".rzp.is-off")'));
	expect('button hidden', await p.ev('getComputedStyle(document.querySelector(".rzp-country")).display') === 'none');
	expect('padding restored', await p.ev('getComputedStyle(document.getElementById("phone")).paddingLeft') === '12px');
	await p.focus('#phone');
	await p.type('anything 123');
	const s = await p.state();
	expect('valid, unchecked', s.valid && s.result === null, s);
});

test('destroy() gives the input back', async (p, expect) => {
	await p.mount({country: 'GB', methods: ['call']});
	await p.ev('f.destroy()');
	const r = await p.ev(`(() => { const i = document.getElementById('phone'); return {rzp: document.querySelectorAll('.rzp').length, parent: i.parentElement.id, attrs: ['dir', 'placeholder', 'aria-describedby', 'autocomplete', 'inputmode', 'style'].map((a) => i.getAttribute(a)), again: REDZ.Phone.field(i) !== f}; })()`);
	expect('clean', r.rzp === 0 && r.parent === 'form' && r.attrs.every((a) => a === null || a === '') && r.again, r);
});

test('an input inside its <label> keeps the label', async (p, expect) => {
	await p.mount({country: 'GB'}, {wrapped: true});
	const labels = await p.ev(`[document.getElementById('phone').labels.length, document.querySelector('.rzp-country').labels.length, document.querySelector('label').htmlFor]`);
	expect('the label names the input, not the button', JSON.stringify(labels) === '[1,0,"phone"]', labels);
	await p.ev(`document.querySelector('label').click()`);
	expect('a click on the label focuses the number', await p.ev('document.activeElement.id === "phone"'));
	expect('and opens no list', await p.attr('.rzp-country', 'aria-expanded') === 'false');
	await p.ev('f.destroy()');
	expect('destroy() takes the for= back', await p.ev(`!document.querySelector('label').hasAttribute('for') && document.getElementById('phone') !== null`));
});

test('native validation and required', async (p, expect) => {
	await p.mount({country: 'TH'}, {required: true});
	expect('empty required blocks the form', !(await p.ev('document.getElementById("form").checkValidity()')));
	await p.focus('#phone');
	await p.type('123');
	expect('short number blocks it', (await p.ev('document.getElementById("phone").validationMessage')).includes('Too short'));
	await p.ev(`f.set('081 234 5678')`);
	expect('valid number lets it go', await p.ev('document.getElementById("form").checkValidity()'));
});

test('popular countries come first', async (p, expect) => {
	await p.mount({country: 'TH', popular: ['TH', 'RU', 'GB', 'ZZ']});
	await p.click('.rzp-country');
	const isos = await p.options();
	expect('TH RU GB, then all', JSON.stringify(isos.slice(0, 3)) === '["TH","RU","GB"]' && isos.length === 248, [isos.slice(0, 4), isos.length]);
	expect('divider after the last popular one', await p.ev('document.querySelectorAll(".rzp-options li")[2].classList.contains("rzp-last")'));
});

test('browser language: only a language with a region picks the country', async (p, expect) => {
	await p.mount({country: 'auto'}, {languages: ['en-GB', 'en']});
	expect('en-GB → GB', (await p.state()).country === 'GB');
	await p.mount({country: 'auto'}, {languages: ['en', 'en-GB']});
	expect('en → none', (await p.state()).country === '');
	await p.focus('#phone');
	await p.type('0812345678');
	await p.key('Tab');
	expect('no country asks for one', (await p.note()).text === 'Choose a country or start the number with +', await p.note());
});

test('touch: tap the button, tap a country, tap a method', async (p, expect) => {
	await p.send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 2, mobile: true});
	await p.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
	try {
		await p.goto('tests/ui.html');
		await p.mount({country: 'GB', methods: ['call', 'whatsapp']});
		await p.tap('.rzp-country');
		expect('list open', await p.attr('.rzp-country', 'aria-expanded') === 'true');
		await p.type('thai');
		await p.tap('.rzp-options li');
		expect('closed on the tap', await p.attr('.rzp-country', 'aria-expanded') === 'false');
		expect('TH picked', (await p.state()).country === 'TH');
		await p.tap('.rzp-method-whatsapp');
		expect('whatsapp', (await p.state()).method === 'whatsapp');
		await p.tap('.rzp-country');
		await p.tap('#after');
		expect('a tap outside closes the list', await p.attr('.rzp-country', 'aria-expanded') === 'false');
	} finally {
		await p.send('Emulation.setTouchEmulationEnabled', {enabled: false});
		await p.send('Emulation.setDeviceMetricsOverride', {width: 800, height: 900, deviceScaleFactor: 1, mobile: false});
	}
});

test('set() takes a pasted tel: link', async (p, expect) => {
	await p.mount({country: 'TH'});
	await p.ev(`f.set('tel:+447400123456')`);
	const s = await p.state();
	expect('GB, valid', s.country === 'GB' && s.valid, s);
});

test('window.REDZ of another REDZ script survives the bundle', async (p, expect) => {
	const got = await p.ev(`(async () => {
		const bundle = await (await fetch('/dist/redzphone.min.js')).text();
		window.REDZ = {post: () => 'cms'};
		(0, eval)(bundle);
		return [typeof REDZ.post, typeof REDZ.Phone.field, REDZ.post()];
	})()`);
	expect('both live in one REDZ', JSON.stringify(got) === '["function","function","cms"]', got);
});

// The demo at phone width in every language: no sideways scroll, a translated field, then three screenshots.
DEMO_LANGS.forEach((lang) => {
	const t = {
		name: `demo in ${lang} at 390 px`,
		page: `docs/index.html?lang=${lang}`,
		async fn(p, expect) {
			await p.send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 2, mobile: true});
			try {
				await p.goto(t.page);
				await p.waitFor('window.REDZ && REDZ.Phone.ready() && window.demo && demo.field && !!document.querySelector(".rzp-code").textContent');
				expect('page language and direction', await p.ev('document.documentElement.lang + " " + document.documentElement.dir') === `${lang} ${lang === 'he' ? 'rtl' : 'ltr'}`);
				expect('no sideways scroll', await p.ev('document.documentElement.scrollWidth') <= 390, await p.ev('document.documentElement.scrollWidth'));
				await p.shot(`demo-${lang}`);
				await p.ev(`demo.field.set('07400 123456', 'TH'); demo.field.check(); document.getElementById('phone').scrollIntoView({block: 'start'}); scrollBy(0, -80)`);
				const note = await p.note();
				expect('error in the page language', note.cls.includes('is-error') && (lang === 'en' || !note.text.includes('Too long')), note);
				await p.shot(`demo-${lang}-error`);
				await p.click('.rzp-country');
				expect('list open', await p.attr('.rzp-country', 'aria-expanded') === 'true');
				expect('still no sideways scroll', await p.ev('document.documentElement.scrollWidth') <= 390, await p.ev('document.documentElement.scrollWidth'));
				await p.shot(`demo-${lang}-open`);
				if (lang === 'en') {
					await p.key('Escape');
					await p.ev(`(() => { const s = document.getElementById('s-list'); s.value = 'inline'; s.dispatchEvent(new Event('change')); demo.field.set('050-123-4567', 'IL'); })()`);
					await p.click('.rzp-country');
					await p.shot('demo-en-inline');
				}
			} finally {
				await p.send('Emulation.setDeviceMetricsOverride', {width: 800, height: 900, deviceScaleFactor: 1, mobile: false});
			}
		},
	};
	tests.push(t);
});

fs.mkdirSync(SHOTS, {recursive: true});
const server = await serve();
const chrome = await launch();
const cdp = new Cdp(chrome.url);
let failed = 0;
try {
	await cdp.open();
	const {targetId} = await cdp.send('Target.createTarget', {url: 'about:blank'});
	const {sessionId} = await cdp.send('Target.attachToTarget', {targetId, flatten: true});
	const p = new Page(cdp, sessionId, `http://127.0.0.1:${server.address().port}/`);
	await p.send('Page.enable');
	await p.send('Emulation.setDeviceMetricsOverride', {width: 800, height: 900, deviceScaleFactor: 1, mobile: false});
	for (const t of tests) {
		const failures = [];
		const expect = (label, ok, got) => {
			if (!ok) {
				failures.push(got === undefined ? label : `${label} — got ${JSON.stringify(got)}`);
			}
		};
		try {
			await p.goto(t.page ?? 'tests/ui.html');
			await t.fn(p, expect);
		} catch (e) {
			failures.push(`threw: ${e.message}`);
		}
		failed += failures.length ? 1 : 0;
		console.log(`${failures.length ? 'FAIL' : 'ok  '} ${t.name}`);
		failures.forEach((f) => console.log(`       ${f}`));
	}
	console.log(`screenshots of the demo: ${path.relative(ROOT, SHOTS)}/demo-*.png`);
} finally {
	cdp.ws.close();
	chrome.proc.kill();
	server.close();
	await sleep(200);
	fs.rmSync(chrome.profile, {recursive: true, force: true});
}
console.log(failed ? `RED: ${failed} of ${tests.length} scenarios failed` : `GREEN: ${tests.length} scenarios`);
process.exit(failed ? 1 : 0);
