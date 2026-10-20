// Builds dist/redz.phone.js, dist/redz.phone.min.js (one IIFE, global REDZ.Phone) and dist/redz.phone.css for the pinned
// Google release, then copies the release files the demo needs into docs/redz.phone/.
// Usage: npm run build
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';
import {ROOT, bundleOptions, buildCss, docsFiles} from './common.mjs';

for (const minify of [false, true]) {
	const options = bundleOptions(minify);
	await esbuild.build(options);
	console.log(`built ${path.relative(ROOT, options.outfile)}`);
}
fs.writeFileSync(path.join(ROOT, 'dist', 'redz.phone.css'), await buildCss(esbuild));
console.log('built dist/redz.phone.css');

const docs = path.join(ROOT, 'docs', 'redz.phone');
fs.rmSync(docs, {recursive: true, force: true});
for (const [from, to] of docsFiles()) {
	fs.mkdirSync(path.dirname(to), {recursive: true});
	fs.copyFileSync(from, to);
}
console.log('copied the release files into docs/redz.phone/');
