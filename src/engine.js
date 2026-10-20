// REDZ.Phone — phone number engine for the browser; php/redz.phone.php answers every input the same way.
import {parsePhoneNumberWithError, ParseError, Metadata, isSupportedCountry} from 'libphonenumber-js/core';
import {checkNumberLengthForType} from '../node_modules/libphonenumber-js/es6/helpers/checkNumberLength.js';

/* global REDZ_PHONE_VERSION, REDZ_PHONE_GOOGLE */
const MAX_INPUT = 256;
const MAX_DIGITS = 24;
const TYPES = ['FIXED_LINE', 'MOBILE', 'FIXED_LINE_OR_MOBILE', 'TOLL_FREE', 'PREMIUM_RATE', 'SHARED_COST', 'VOIP', 'PERSONAL_NUMBER', 'PAGER', 'UAN', 'VOICEMAIL'];
// Zero of every Unicode decimal-digit run (Nd, Unicode 17); the PHP engine carries the same list.
const DIGIT_ZEROS = [0x30, 0x660, 0x6F0, 0x7C0, 0x966, 0x9E6, 0xA66, 0xAE6, 0xB66, 0xBE6, 0xC66, 0xCE6, 0xD66, 0xDE6, 0xE50, 0xED0, 0xF20, 0x1040, 0x1090, 0x17E0, 0x1810, 0x1946, 0x19D0, 0x1A80, 0x1A90, 0x1B50, 0x1BB0, 0x1C40, 0x1C50, 0xA620, 0xA8D0, 0xA900, 0xA9D0, 0xA9F0, 0xAA50, 0xABF0, 0xFF10, 0x104A0, 0x10D30, 0x10D40, 0x11066, 0x110F0, 0x11136, 0x111D0, 0x112F0, 0x11450, 0x114D0, 0x11650, 0x116C0, 0x116D0, 0x116DA, 0x11730, 0x118E0, 0x11950, 0x11BF0, 0x11C50, 0x11D50, 0x11DA0, 0x11DE0, 0x11F50, 0x16130, 0x16A60, 0x16AC0, 0x16B50, 0x16D70, 0x1CCF0, 0x1D7CE, 0x1D7D8, 0x1D7E2, 0x1D7EC, 0x1D7F6, 0x1E140, 0x1E2F0, 0x1E4F0, 0x1E5F1, 0x1E950, 0x1FBF0];
const SCRIPT = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : '';

export const version = REDZ_PHONE_VERSION;
export const google = REDZ_PHONE_GOOGLE;

let meta = null;
let loading = null;

export function ready() {
	return meta !== null;
}

export function setMeta(json) {
	if (!json || !json.countries || !json.country_calling_codes) {
		throw new Error('REDZ.Phone: not a metadata file');
	}
	if (json.google !== google) {
		throw new Error(`REDZ.Phone ${version} needs metadata ${google}, got ${json.google}`);
	}
	meta = json;
}

export function load(url) {
	if (meta) {
		return Promise.resolve();
	}
	if (!loading) {
		const src = url || new URL(`meta/${google}.json`, SCRIPT || location.href).href;
		loading = fetch(src)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`REDZ.Phone: ${src} answered HTTP ${res.status}`);
				}
				return res.json().catch(() => {
					throw new Error(`REDZ.Phone: ${src} is not a metadata file`);
				});
			})
			.then(setMeta)
			.catch((e) => {
				loading = null;
				throw e;
			});
	}
	return loading;
}

function needMeta() {
	if (!meta) {
		throw new Error('REDZ.Phone: metadata is not loaded, call REDZ.Phone.load() first');
	}
}

export function countries() {
	needMeta();
	const out = {};
	Object.keys(meta.countries).sort().forEach((iso) => {
		out[iso] = meta.countries[iso][0];
	});
	return out;
}

// Google's example number of the country (mobile where there is one) in the national format; '' if none.
export function example(country) {
	needMeta();
	country = String(country ?? '').trim().toUpperCase();
	const nsn = isSupportedCountry(country, meta) ? meta.examples?.[country] : '';
	if (!nsn) {
		return '';
	}
	try {
		return parsePhoneNumberWithError(nsn, {defaultCountry: country, extract: false}, meta).formatNational();
	} catch {
		return '';
	}
}

// The calling code these digits start with, or ''; calling codes never prefix one another.
export function codeOf(digits) {
	needMeta();
	for (let n = 1; n <= 3 && n <= digits.length; n++) {
		const code = digits.slice(0, n);
		if (meta.country_calling_codes[code] || meta.nonGeographic?.[code]) {
			return code;
		}
	}
	return '';
}

// Regions of a calling code, main region first; none for global codes such as 800.
export function regionsOf(code) {
	needMeta();
	return meta.country_calling_codes[code] ?? [];
}

export function normalize(input) {
	let plus = false;
	let digits = '';
	for (const ch of String(input ?? '')) {
		const cp = ch.codePointAt(0);
		if (cp === 0x2B || cp === 0xFF0B) {
			plus = plus || digits === '';
			continue;
		}
		for (const zero of DIGIT_ZEROS) {
			if (cp >= zero && cp <= zero + 9) {
				digits += String(cp - zero);
				break;
			}
		}
	}
	return (plus ? '+' : '') + digits;
}

export function parse(input, country, options) {
	needMeta();
	input = String(input ?? '');
	if (input.length > MAX_INPUT * 2 || [...input].length > MAX_INPUT) {
		return fail('too_long');
	}
	let s = normalize(input);
	const digits = s.replace('+', '');
	if (digits === '') {
		return fail('empty');
	}
	if (digits.length > MAX_DIGITS) {
		return fail('too_long');
	}
	country = String(country ?? '').trim().toUpperCase();
	if (!isSupportedCountry(country, meta)) {
		country = '';
	}
	const wanted = [].concat(options?.types ?? []).map((t) => String(t).toUpperCase());
	const types = TYPES.filter((t) => wanted.includes(t));
	if (s.startsWith('+0')) {
		s = digits;
	}
	if (s.startsWith('00')) {
		const asPlus = evaluate('+' + s.slice(2), '', types);
		if (country === '') {
			return asPlus;
		}
		const asDialled = evaluate(s, country, types);
		return rank(asDialled) > rank(asPlus) ? asDialled : asPlus;
	}
	if (!s.startsWith('+') && country === '') {
		return fail('no_country');
	}
	return evaluate(s, country, types);
}

function evaluate(s, country, types) {
	if (s.replace('+', '').length < 2) {
		return fail('too_short');
	}
	let number;
	try {
		number = parsePhoneNumberWithError(s, {defaultCountry: country || undefined, extract: false}, meta);
	} catch (e) {
		if (!(e instanceof ParseError)) {
			throw e;
		}
		return fail(['TOO_SHORT', 'NOT_A_NUMBER'].includes(e.message) ? 'too_short' : e.message === 'TOO_LONG' ? 'too_long' : 'invalid');
	}
	if (number.isValid()) {
		let type = number.getType();
		// The metadata cannot tell "no mobiles" from "mobiles = fixed lines"; Google says FIXED_LINE when there are none.
		if (type === 'FIXED_LINE_OR_MOBILE' && !new Metadata(meta).selectNumberingPlan(number.country).type('MOBILE')) {
			type = 'FIXED_LINE';
		}
		const result = describe(number, country, type);
		if (types.length && !typeAccepted(type, types)) {
			return {...result, ok: false, error: 'wrong_type'};
		}
		return result;
	}
	const plan = new Metadata(meta);
	plan.selectNumberingPlan(number.countryCallingCode);
	const reasons = types.length
		? types.map((t) => checkNumberLengthForType(number.nationalNumber, t, undefined, plan))
		: [checkNumberLengthForType(number.nationalNumber, undefined, undefined, plan)];
	if (reasons.includes('IS_POSSIBLE')) {
		return {...describe(number, country, null), warning: 'unallocated'};
	}
	const short = reasons.every((r) => r === 'TOO_SHORT');
	const long = reasons.every((r) => r === 'TOO_LONG');
	return fail(short ? 'too_short' : (long ? 'too_long' : 'invalid'));
}

function describe(number, country, type) {
	const code = number.countryCallingCode;
	let region;
	if (type) {
		region = number.country ?? null;
	} else {
		const regions = meta.country_calling_codes[code] ?? [];
		region = regions.includes(country) ? country : (regions[0] ?? null);
	}
	return {
		ok: true,
		error: null,
		warning: null,
		e164: number.number,
		country: region === '001' ? null : region,
		code,
		type,
		international: number.formatInternational(),
	};
}

function fail(error) {
	return {ok: false, error, warning: null, e164: null, country: null, code: null, type: null, international: null};
}

function typeAccepted(type, types) {
	return types.includes(type) || (type === 'FIXED_LINE_OR_MOBILE' && (types.includes('MOBILE') || types.includes('FIXED_LINE')));
}

function rank(result) {
	if (result.ok) {
		return result.warning === null ? 3 : 2;
	}
	return result.error === 'wrong_type' ? 1 : 0;
}
