// Pins one Google libphonenumber release on both sides: browser metadata, vendored giggsey-lite, gate examples,
// and the flag sprite of its regions.
// Usage: npm run update -- v9.0.41   (then npm run build && npm run gate)
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import sharp from 'sharp';
import {ROOT, VENDOR, PINS, sha256, readJson, writeJson, readTree, treeHash} from './common.mjs';

const require = createRequire(import.meta.url);
const generator = require('libphonenumber-metadata-generator');
const CACHE = path.join(ROOT, '.cache');
const LITE = 'giggsey/libphonenumber-for-php-lite';
const FLAGS = path.join(ROOT, 'node_modules', 'flag-icons');
// Regions whose flag-icons file is not named after the region; XX (no country) closes the sprite.
const FLAG_FILES = {AC: 'sh-ac', TA: 'sh-ta'};

const tag = process.argv[2] ?? '';
if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
	console.error('Usage: npm run update -- v9.0.41');
	process.exit(1);
}

async function download(url, file) {
	if (!fs.existsSync(file)) {
		const res = await fetch(url, {headers: {'User-Agent': 'redz-phone-update'}});
		if (!res.ok) {
			throw new Error(`${url}: HTTP ${res.status}`);
		}
		fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
	}
	return fs.readFileSync(file);
}

// Packagist p2 lists versions in the composer/2.0 minified form: each entry repeats only what changed.
async function packagistVersion(name, version) {
	const res = await fetch(`https://repo.packagist.org/p2/${name}.json`, {headers: {'User-Agent': 'redz-phone-update'}});
	if (!res.ok) {
		throw new Error(`packagist ${name}: HTTP ${res.status}`);
	}
	let prev = {};
	for (const entry of (await res.json()).packages[name]) {
		const full = {...prev, ...entry};
		Object.keys(entry).filter((k) => entry[k] === '__unset').forEach((k) => delete full[k]);
		if (full.version === version) {
			return full;
		}
		prev = full;
	}
	throw new Error(`${name} ${version} is not on Packagist yet`);
}

// One column of 4:3 flags; the browser picks a row by percentage, so any display size works.
async function flagSprite(order, width) {
	const height = width * 3 / 4;
	const tiles = await Promise.all(order.map(async (iso, i) => ({
		input: await sharp(fs.readFileSync(path.join(FLAGS, 'flags', '4x3', `${FLAG_FILES[iso] ?? iso.toLowerCase()}.svg`)))
			.resize(width, height, {fit: 'fill', kernel: 'lanczos3'}).png().toBuffer(),
		left: 0,
		top: i * height,
	})));
	const canvas = {width, height: order.length * height, channels: 4, background: {r: 0, g: 0, b: 0, alpha: 0}};
	const flat = await sharp({create: canvas}).composite(tiles).png().toBuffer();
	return sharp(flat).png({palette: true, quality: 100, compressionLevel: 9, effort: 10}).toBuffer();
}

fs.mkdirSync(CACHE, {recursive: true});

const xmlUrl = `https://raw.githubusercontent.com/google/libphonenumber/${tag}/resources/PhoneNumberMetadata.xml`;
const xml = await download(xmlUrl, path.join(CACHE, `google-${tag}.xml`));
const full = await generator.generate(xml.toString('utf8'), {withPhoneNumberTypes: true, withPhoneNumberTypeExamples: true});
const min = generator.minify(await generator.generate(xml.toString('utf8'), {withPhoneNumberTypes: true}));

// The field shows one example per region as a placeholder and in its messages: a mobile number where there is one.
const sample = {};
for (const iso of Object.keys(min.countries).sort()) {
	const examples = full.countries[iso].examples ?? {};
	sample[iso] = examples.mobile ?? examples.fixed_line ?? Object.values(examples)[0] ?? '';
}

const metaDir = path.join(ROOT, 'dist', 'meta');
fs.mkdirSync(metaDir, {recursive: true});
fs.readdirSync(metaDir).filter((f) => f.endsWith('.json')).forEach((f) => fs.rmSync(path.join(metaDir, f)));
const metaText = JSON.stringify({google: tag, examples: sample, ...min});
fs.writeFileSync(path.join(metaDir, `${tag}.json`), metaText);

const flagOrder = [...Object.keys(min.countries).sort(), 'XX'];
const flagVersion = readJson(path.join(FLAGS, 'package.json')).version;
const sprite = await flagSprite(flagOrder, 20);
const sprite2x = await flagSprite(flagOrder, 40);
fs.writeFileSync(path.join(ROOT, 'dist', 'flags.png'), sprite);
fs.writeFileSync(path.join(ROOT, 'dist', 'flags@2x.png'), sprite2x);

const lpjsDir = path.join(ROOT, 'node_modules', 'libphonenumber-js');
const lpjsTag = fs.readFileSync(path.join(lpjsDir, 'CHANGELOG.md'), 'utf8').match(/Updated metadata to version (\d+\.\d+\.\d+)/)?.[1];
if (`v${lpjsTag}` === tag) {
	const same = fs.readFileSync(path.join(lpjsDir, 'metadata.max.json'), 'utf8') === JSON.stringify(min);
	console.log(`metadata vs libphonenumber-js metadata.max.json (${tag}): ${same ? 'identical' : 'DIFFERENT — check the generator version'}`);
} else {
	console.log(`libphonenumber-js carries v${lpjsTag}, not ${tag}: no cross-check of the generated metadata`);
}

const examples = {google: tag, countries: {}, nonGeographic: {}};
for (const [id, c] of Object.entries(full.countries)) {
	examples.countries[id] = {code: c.phone_code, prefix: c.national_prefix ?? '', examples: c.examples ?? {}};
}
for (const [code, c] of Object.entries(full.nonGeographic)) {
	examples.nonGeographic[code] = {examples: c.examples ?? {}};
}
writeJson(path.join(ROOT, 'tests', 'examples.json'), examples);

const lite = await packagistVersion(LITE, tag.slice(1));
const commit = lite.dist.reference;
const tarball = await download(`https://api.github.com/repos/${LITE}/tarball/${commit}`, path.join(CACHE, `lite-${commit}.tar.gz`));
const unpack = path.join(CACHE, `lite-${commit}`);
fs.rmSync(unpack, {recursive: true, force: true});
fs.mkdirSync(unpack);
execFileSync('tar', ['-xzf', path.join(CACHE, `lite-${commit}.tar.gz`), '-C', unpack]);
const top = path.join(unpack, fs.readdirSync(unpack)[0]);
const versionFile = fs.readFileSync(path.join(top, 'METADATA-VERSION.php'), 'utf8');
if (!versionFile.includes(`return '${tag}';`)) {
	throw new Error(`${LITE} ${tag.slice(1)} does not declare metadata ${tag}`);
}
fs.rmSync(VENDOR, {recursive: true, force: true});
fs.mkdirSync(VENDOR, {recursive: true});
fs.cpSync(path.join(top, 'src'), path.join(VENDOR, 'src'), {recursive: true});
fs.copyFileSync(path.join(top, 'LICENSE.txt'), path.join(VENDOR, 'LICENSE.txt'));
fs.copyFileSync(path.join(top, 'METADATA-VERSION.php'), path.join(VENDOR, 'METADATA-VERSION.php'));

writeJson(PINS, {
	google: {tag, xml: xmlUrl, xml_sha256: sha256(xml)},
	giggsey: {package: LITE, version: lite.version, commit, tarball_sha256: sha256(tarball), tree_sha256: treeHash(readTree(VENDOR))},
	generator: {version: readJson(path.join(ROOT, 'node_modules', 'libphonenumber-metadata-generator', 'package.json')).version, format: generator.version},
	meta: {file: `dist/meta/${tag}.json`, sha256: sha256(metaText)},
	flags: {package: 'flag-icons', version: flagVersion, png: sha256(sprite), png2x: sha256(sprite2x), order: flagOrder.join(' ')},
});
console.log(`pinned ${tag}: dist/meta/${tag}.json, php/libphonenumber (${LITE} ${lite.version} @ ${commit.slice(0, 7)}), tests/examples.json, dist/flags.png (flag-icons ${flagVersion})`);
