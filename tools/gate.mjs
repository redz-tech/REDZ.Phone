// Parity gate: the browser bundle and the PHP engine must answer every case alike, on one Google release.
// Each run first plants nine breaks (release ×2, TH rule ×2, expectation, known divergence, vendor file, flag sprite,
// demo copy); all must be caught.
// Usage: npm run build && npm run gate   (details of a red run: .cache/gate-report.json)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import * as esbuild from 'esbuild';
import {ROOT, VENDOR, PINS, sha256, readJson, writeJson, readTree, treeHash, bundleOptions, buildCss, docsFiles} from './common.mjs';

const TYPE = {fixed_line: 'FIXED_LINE', mobile: 'MOBILE', toll_free: 'TOLL_FREE', premium_rate: 'PREMIUM_RATE', shared_cost: 'SHARED_COST', voip: 'VOIP', personal_number: 'PERSONAL_NUMBER', pager: 'PAGER', uan: 'UAN', voicemail: 'VOICEMAIL'};
const ABROAD = ['447911123456', '12015550123', '66812345678'];

const pkg = readJson(path.join(ROOT, 'package.json'));
const pins = readJson(PINS);
const bundle = fs.readFileSync(path.join(ROOT, 'dist', 'redz.phone.min.js'), 'utf8');
const metaText = fs.readFileSync(path.join(ROOT, pins.meta.file), 'utf8');
const meta = JSON.parse(metaText);
const examples = readJson(path.join(ROOT, 'tests', 'examples.json'));
const golden = readJson(path.join(ROOT, 'tests', 'cases.json')).map((c) => ({...c, types: c.types ?? []}));
const known = readJson(path.join(ROOT, 'tests', 'known.json'));

const thai = (s) => s.replace(/\d/g, (d) => String.fromCodePoint(0xE50 + Number(d)));
const canon = (r) => JSON.stringify(r, Object.keys(r).sort());
const caseKey = (c) => JSON.stringify([c.in, c.country, c.types]);

function corpus() {
	const cases = [];
	for (const [iso, c] of Object.entries(examples.countries)) {
		const main = meta.country_calling_codes[c.code][0];
		const idd = meta.countries[iso][12] ?? (/^\d+$/.test(meta.countries[iso][1] ?? '') ? meta.countries[iso][1] : '');
		for (const [key, ex] of Object.entries(c.examples)) {
			const example = TYPE[key];
			cases.push(
				{in: ex, country: iso, types: [], example},
				{in: `+${c.code}${ex}`, country: '', types: [], example},
				{in: thai(ex), country: iso, types: [], example},
				{in: `00${c.code}${ex}`, country: iso, types: []},
				{in: ex.slice(0, -1), country: iso, types: []},
				{in: `${ex}7`, country: iso, types: []},
				{in: ex, country: iso, types: ['MOBILE']},
				{in: ex.slice(0, -1), country: iso, types: ['MOBILE']},
				{in: `${ex}7`, country: iso, types: ['MOBILE']},
			);
			if (c.prefix) {
				cases.push({in: `${c.prefix}${ex}`, country: iso, types: []}, {in: `+${c.code}${c.prefix}${ex}`, country: '', types: []});
			}
			if (main !== iso) {
				cases.push({in: `${c.prefix}${ex}`, country: main, types: []});
			}
		}
		if (idd) {
			ABROAD.forEach((n) => cases.push({in: `${idd}${n}`, country: iso, types: []}));
		}
	}
	for (const [code, c] of Object.entries(examples.nonGeographic)) {
		for (const [key, ex] of Object.entries(c.examples)) {
			cases.push({in: `+${code}${ex}`, country: '', types: [], example: TYPE[key]}, {in: `+${code}${ex.slice(0, -1)}`, country: '', types: []}, {in: `+${code}${ex}7`, country: '', types: []});
		}
	}
	return cases;
}

function jsEngine(text) {
	const ctx = vm.createContext({URL});
	vm.runInContext(bundle, ctx);
	ctx.metaText = text;
	vm.runInContext('REDZ.Phone.setMeta(JSON.parse(metaText))', ctx);
	return ctx.REDZ.Phone;
}

const runJs = (engine, cases) => cases.map((c) => JSON.parse(JSON.stringify(engine.parse(c.in, c.country, {types: c.types}))));

function runPhp(cases) {
	const out = execFileSync('php', ['-d', 'xdebug.mode=off', path.join(ROOT, 'tools', 'gate.php')], {input: JSON.stringify(cases.map((c) => [c.in, c.country, c.types])), maxBuffer: 1 << 28});
	return JSON.parse(out.toString('utf8'));
}

function identity(metadata, engine, php) {
	const problems = [];
	const tags = {pins: pins.google.tag, meta: metadata.google, bundle: engine.google, php: php.google};
	if (new Set(Object.values(tags)).size !== 1) {
		problems.push(`Google release differs: ${JSON.stringify(tags)}`);
	}
	const versions = {package: pkg.version, bundle: engine.version, php: php.version};
	if (new Set(Object.values(versions)).size !== 1) {
		problems.push(`library version differs: ${JSON.stringify(versions)}`);
	}
	if (canon(JSON.parse(JSON.stringify(engine.countries()))) !== canon(php.countries)) {
		problems.push('country lists differ between the browser and PHP');
	}
	return problems;
}

// The rules the browser reads, in the shape tools/gate.php dumps the PHP ones (positions: libphonenumber-js metadata v4).
function rulesOf(metadata) {
	const RULE_TYPES = ['FIXED_LINE', 'MOBILE', 'TOLL_FREE', 'PREMIUM_RATE', 'PERSONAL_NUMBER', 'VOICEMAIL', 'UAN', 'PAGER', 'VOIP', 'SHARED_COST'];
	const one = (c) => {
		const types = c[11] || [];
		const row = {code: c[0], idd: c[1] || null, preferredIdd: c[12] || null, prefix: c[5] || null, prefixForParsing: c[7] || c[5] || null, prefixTransform: c[8] || null, leadingDigits: c[10] || null, pattern: c[2], lengths: c[3]};
		RULE_TYPES.forEach((t, i) => {
			row[t] = types[i] ? [types[i][0] === '' ? types[0][0] : types[i][0], types[i][1] || c[3]] : null;
		});
		return row;
	};
	return {
		rules: Object.fromEntries([...Object.entries(metadata.countries), ...Object.entries(metadata.nonGeographic)].map(([k, c]) => [k, one(c)])),
		codes: {...metadata.country_calling_codes, ...Object.fromEntries(Object.keys(metadata.nonGeographic).map((code) => [code, ['001']]))},
	};
}

function ruleDifferences(metadata, php) {
	const js = rulesOf(metadata);
	const out = [];
	for (const key of new Set([...Object.keys(js.rules), ...Object.keys(php.rules)])) {
		const a = js.rules[key] ?? {};
		const b = php.rules[key] ?? {};
		new Set([...Object.keys(a), ...Object.keys(b)]).forEach((f) => JSON.stringify(a[f]) !== JSON.stringify(b[f]) && out.push(`${key}.${f}`));
	}
	for (const code of new Set([...Object.keys(js.codes), ...Object.keys(php.codes)])) {
		if (JSON.stringify(js.codes[code]) !== JSON.stringify(php.codes[code])) {
			out.push(`+${code} regions`);
		}
	}
	return out;
}

function differences(cases, js, php) {
	return cases.flatMap((c, i) => canon(js[i]) === canon(php[i]) ? [] : [{case: c, js: js[i], php: php[i]}]);
}

// A recorded divergence passes only while both answers stay exactly as recorded.
function splitKnown(diffs, list) {
	const recorded = new Map(list.map((k) => [caseKey(k), k]));
	const isKnown = (d) => {
		const k = recorded.get(caseKey(d.case));
		return k !== undefined && canon(k.js) === canon(d.js) && canon(k.php) === canon(d.php);
	};
	const expected = diffs.filter(isKnown);
	const stale = list.filter((k) => !expected.some((d) => caseKey(d.case) === caseKey(k)));
	return {unexpected: diffs.filter((d) => !isKnown(d)), expected, stale};
}

// The sprites are what npm run update drew, one row per region of the metadata and XX last.
function flagProblems(png, png2x, metadata) {
	const out = [];
	if (sha256(png) !== pins.flags.png || sha256(png2x) !== pins.flags.png2x) {
		out.push('dist/flags.png or dist/flags@2x.png is not the sprite npm run update drew');
	}
	if (pins.flags.order !== [...Object.keys(metadata.countries).sort(), 'XX'].join(' ')) {
		out.push('the flag rows (tools/pins.json flags.order) are not the regions of the metadata');
	}
	return out;
}

// pairs: [[name, dist file, docs copy], …] as buffers; null where a file is missing
function docsProblems(pairs) {
	return pairs.flatMap(([rel, a, b]) => (a !== null && b !== null && a.equals(b) ? [] : [`docs/redz.phone/${rel} differs from dist/ (run npm run build)`]));
}

const readOrNull = (file) => (fs.existsSync(file) ? fs.readFileSync(file) : null);

function failedExpectations(cases, results) {
	return cases.flatMap((c, i) => {
		const r = results[i];
		const wrongKey = Object.keys(c.expect ?? {}).find((k) => JSON.stringify(r[k]) !== JSON.stringify(c.expect[k]));
		const wrongExample = c.example !== undefined && !(r.ok && r.warning === null
			&& (r.type === c.example || (r.type === 'FIXED_LINE_OR_MOBILE' && ['MOBILE', 'FIXED_LINE'].includes(c.example))));
		return wrongKey || wrongExample ? [{case: c, got: r, key: wrongKey ?? 'example'}] : [];
	});
}

const started = Date.now();
const cases = [...corpus(), ...golden];
const inCorpus = new Set(cases.map(caseKey));
known.filter((k) => !inCorpus.has(caseKey(k))).forEach((k) => cases.push({in: k.in, country: k.country, types: k.types}));
let engine;
try {
	engine = jsEngine(metaText);
} catch (e) {
	console.log(`RED: the bundle refuses ${pins.meta.file}: ${e.message}`);
	process.exit(1);
}
const js = runJs(engine, cases);
const php = runPhp(cases);
const tree = readTree(VENDOR);
const diff = differences(cases, js, php.results);

const selftest = [];
if (identity({...meta, google: 'v0.0.0'}, engine, php).length === 0) {
	selftest.push('a different Google release in the metadata went unnoticed');
}
try {
	jsEngine(JSON.stringify({...meta, google: 'v0.0.0'}));
	selftest.push('the bundle accepted metadata of another Google release');
} catch {
	// refused, as it must
}
const planted = JSON.parse(metaText);
if (typeof planted.countries.TH?.[11]?.[1]?.[0] !== 'string') {
	selftest.push('cannot plant a TH rule change: the metadata layout is not the one the gate knows');
} else {
	planted.countries.TH[11][1][0] = '0{99}';
	const th = cases.flatMap((c, i) => c.country === 'TH' ? [i] : []);
	const thJs = runJs(jsEngine(JSON.stringify(planted)), th.map((i) => cases[i]));
	if (differences(th.map((i) => cases[i]), thJs, th.map((i) => php.results[i])).length === 0) {
		selftest.push('a changed TH mobile rule in the browser metadata gave no different answer');
	}
	if (!ruleDifferences(planted, php).includes('TH.MOBILE')) {
		selftest.push('a changed TH mobile rule in the browser metadata went unnoticed by the rule comparison');
	}
}
const wrongGolden = {...golden[0], expect: {...golden[0].expect, e164: '+0'}};
if (failedExpectations([wrongGolden], runJs(engine, [wrongGolden])).length === 0) {
	selftest.push('a wrong expected answer went unnoticed');
}
if (known.length && splitKnown(diff, known.map((k) => ({...k, js: {...k.js, e164: '+0'}}))).unexpected.length === 0) {
	selftest.push('a known divergence with changed answers went unnoticed');
}
const editedTree = {...tree};
const victim = Object.keys(editedTree).find((f) => f.endsWith('PhoneNumberUtil.php'));
editedTree[victim] = Buffer.concat([editedTree[victim], Buffer.from('\n')]);
if (treeHash(editedTree) === pins.giggsey.tree_sha256) {
	selftest.push('an edited vendor file went unnoticed');
}
const png = readOrNull(path.join(ROOT, 'dist', 'flags.png')) ?? Buffer.alloc(0);
const png2x = readOrNull(path.join(ROOT, 'dist', 'flags@2x.png')) ?? Buffer.alloc(0);
if (flagProblems(Buffer.concat([png, Buffer.from([0])]), png2x, meta).length === 0) {
	selftest.push('a changed flag sprite went unnoticed');
}
const docsPairs = docsFiles().map(([from, to]) => [path.relative(path.join(ROOT, 'dist'), from), readOrNull(from), readOrNull(to)]);
if (docsProblems(docsPairs.map(([rel, a], i) => [rel, a, i === 0 && a !== null ? Buffer.concat([a, Buffer.from(' ')]) : a])).length === 0) {
	selftest.push('a demo copy that differs from dist/ went unnoticed');
}

const problems = identity(meta, engine, php);
if (treeHash(tree) !== pins.giggsey.tree_sha256) {
	problems.push('php/libphonenumber is not the pinned giggsey-lite tree (run npm run update)');
}
if (sha256(metaText) !== pins.meta.sha256) {
	problems.push(`${pins.meta.file} is not the file npm run update generated from the pinned XML`);
}
const ruleDiff = ruleDifferences(meta, php);
if (ruleDiff.length) {
	problems.push(`rules differ between the browser metadata and PHP: ${ruleDiff.slice(0, 20).join(', ')}${ruleDiff.length > 20 ? ` (+${ruleDiff.length - 20})` : ''}`);
}
for (const minify of [false, true]) {
	const options = bundleOptions(minify);
	const fresh = (await esbuild.build({...options, write: false})).outputFiles[0].text;
	if (!fs.existsSync(options.outfile) || fs.readFileSync(options.outfile, 'utf8') !== fresh) {
		problems.push(`${path.relative(ROOT, options.outfile)} is stale (run npm run build)`);
	}
}
if (readOrNull(path.join(ROOT, 'dist', 'redz.phone.css'))?.toString('utf8') !== await buildCss(esbuild)) {
	problems.push('dist/redz.phone.css is stale (run npm run build)');
}
problems.push(...flagProblems(png, png2x, meta), ...docsProblems(docsPairs));
const {unexpected, expected, stale} = splitKnown(diff, known);
if (stale.length) {
	problems.push(`tests/known.json no longer matches what the engines answer: ${stale.map((k) => k.in).join(', ')}`);
}
const expectations = [...failedExpectations(cases, js).map((f) => ({side: 'js', ...f})), ...failedExpectations(cases, php.results).map((f) => ({side: 'php', ...f}))];

console.log(`REDZ.Phone ${pkg.version}, Google ${pins.google.tag}: ${cases.length} cases (${golden.length} hand-written) in ${((Date.now() - started) / 1000).toFixed(1)} s`);
console.log(selftest.length ? `SELFTEST RED: ${selftest.join('; ')}` : 'selftest: 9 planted breaks caught');
problems.forEach((p) => console.log(`RED: ${p}`));
console.log(unexpected.length ? `RED: ${unexpected.length} answers differ between the browser and PHP` : `parity: browser = PHP on every case (${expected.length} recorded in tests/known.json)`);
console.log(expectations.length ? `RED: ${expectations.length} answers differ from the expected ones` : 'expectations: all met');
[...unexpected.slice(0, 15), ...expectations.slice(0, 15)].forEach((d) => console.log(JSON.stringify(d)));
if (selftest.length || problems.length || unexpected.length || expectations.length) {
	fs.mkdirSync(path.join(ROOT, '.cache'), {recursive: true});
	writeJson(path.join(ROOT, '.cache', 'gate-report.json'), {selftest, problems, diff: unexpected, expectations});
	process.exit(1);
}
console.log('GREEN');
