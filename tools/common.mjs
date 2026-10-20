import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VENDOR = path.join(ROOT, 'php', 'libphonenumber');
export const PINS = path.join(ROOT, 'tools', 'pins.json');

export const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

export const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, '\t') + '\n');

export function listFiles(dir, base = dir) {
	return fs.readdirSync(dir, {withFileTypes: true})
		.flatMap((e) => e.isDirectory() ? listFiles(path.join(dir, e.name), base) : [path.relative(base, path.join(dir, e.name))])
		.sort();
}

// files: {relativePath: Buffer}; the order of keys does not matter
export function treeHash(files) {
	const lines = Object.keys(files).sort().map((rel) => rel.split(path.sep).join('/') + '\0' + sha256(files[rel]) + '\n');
	return sha256(lines.join(''));
}

export function readTree(dir) {
	return Object.fromEntries(listFiles(dir).map((rel) => [rel, fs.readFileSync(path.join(dir, rel))]));
}

// esbuild options of dist/redz.phone.js; the gate rebuilds in memory with them to catch a stale dist
export function bundleOptions(minify) {
	const pkg = readJson(path.join(ROOT, 'package.json'));
	const pins = readJson(PINS);
	return {
		entryPoints: [path.join(ROOT, 'src', 'redz.phone.js')],
		outfile: path.join(ROOT, 'dist', minify ? 'redz.phone.min.js' : 'redz.phone.js'),
		bundle: true,
		minify,
		format: 'iife',
		globalName: 'REDZ.Phone',
		target: 'es2018',
		charset: 'utf8',
		define: {REDZ_PHONE_VERSION: JSON.stringify(pkg.version), REDZ_PHONE_GOOGLE: JSON.stringify(pins.google.tag), REDZ_PHONE_FLAGS: JSON.stringify(pins.flags.order)},
		banner: {js: `/*! REDZ.Phone ${pkg.version} | MIT | metadata: Google libphonenumber ${pins.google.tag} (Apache-2.0) | engine: libphonenumber-js (MIT) | icons: Bootstrap Icons (MIT), Simple Icons (CC0) | see NOTICE */`},
		logLevel: 'warning',
	};
}

// dist/redz.phone.css: src/redz.phone.css minified, image URLs untouched (the sprites sit next to it)
export async function buildCss(esbuild) {
	const pkg = readJson(path.join(ROOT, 'package.json'));
	const source = fs.readFileSync(path.join(ROOT, 'src', 'redz.phone.css'), 'utf8');
	const {code} = await esbuild.transform(source, {loader: 'css', minify: true, charset: 'utf8', banner: `/*! REDZ.Phone ${pkg.version} | MIT | flags: flag-icons (MIT) | see NOTICE */`});
	return code;
}

// What the demo in docs/ uses: copies of the release files, kept equal by npm run build and checked by the gate.
export function docsFiles() {
	const pins = readJson(PINS);
	return ['redz.phone.min.js', 'redz.phone.css', 'flags.png', 'flags@2x.png', pins.meta.file.replace(/^dist\//, '')]
		.map((rel) => [path.join(ROOT, 'dist', rel), path.join(ROOT, 'docs', 'redz.phone', rel)]);
}
