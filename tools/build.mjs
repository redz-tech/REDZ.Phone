// Builds dist/redzphone.js, dist/redzphone.min.js (one IIFE, global REDZ.Phone) and dist/redzphone.css for the pinned
// Google release, then copies the release files the demo needs into docs/redzphone/.
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
fs.writeFileSync(path.join(ROOT, 'dist', 'redzphone.css'), await buildCss(esbuild));
console.log('built dist/redzphone.css');

const docs = path.join(ROOT, 'docs', 'redzphone');
fs.rmSync(docs, {recursive: true, force: true});
for (const [from, to] of docsFiles()) {
	fs.mkdirSync(path.dirname(to), {recursive: true});
	fs.copyFileSync(from, to);
}
console.log('copied the release files into docs/redzphone/');
