<?php
/**
 * REDZ.Phone — phone number engine for PHP 8.5: normalisation, E.164, country and type on Google's rules.
 * dist/redz.phone.js answers every input the same way; tools/gate.mjs proves it.
 * @license MIT
 */

declare(strict_types=1);

use libphonenumber\NumberParseException;
use libphonenumber\PhoneMetadata;
use libphonenumber\PhoneNumber;
use libphonenumber\PhoneNumberDesc;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;

spl_autoload_register(static function (string $class): void {
	if (str_starts_with($class, 'libphonenumber\\')) {
		$file = __DIR__ . '/libphonenumber/src/' . strtr(substr($class, 15), '\\', '/') . '.php';
		if (is_file($file)) {
			require $file;
		}
	}
});

const REDZ_PHONE_VERSION = '0.3.0';
const REDZ_PHONE_MAX_INPUT = 256;
const REDZ_PHONE_MAX_DIGITS = 24;
const REDZ_PHONE_TYPES = ['FIXED_LINE', 'MOBILE', 'FIXED_LINE_OR_MOBILE', 'TOLL_FREE', 'PREMIUM_RATE', 'SHARED_COST', 'VOIP', 'PERSONAL_NUMBER', 'PAGER', 'UAN', 'VOICEMAIL'];
// Zero of every Unicode decimal-digit run (Nd, Unicode 17); the browser engine carries the same list.
const REDZ_PHONE_DIGIT_ZEROS = [0x30, 0x660, 0x6F0, 0x7C0, 0x966, 0x9E6, 0xA66, 0xAE6, 0xB66, 0xBE6, 0xC66, 0xCE6, 0xD66, 0xDE6, 0xE50, 0xED0, 0xF20, 0x1040, 0x1090, 0x17E0, 0x1810, 0x1946, 0x19D0, 0x1A80, 0x1A90, 0x1B50, 0x1BB0, 0x1C40, 0x1C50, 0xA620, 0xA8D0, 0xA900, 0xA9D0, 0xA9F0, 0xAA50, 0xABF0, 0xFF10, 0x104A0, 0x10D30, 0x10D40, 0x11066, 0x110F0, 0x11136, 0x111D0, 0x112F0, 0x11450, 0x114D0, 0x11650, 0x116C0, 0x116D0, 0x116DA, 0x11730, 0x118E0, 0x11950, 0x11BF0, 0x11C50, 0x11D50, 0x11DA0, 0x11DE0, 0x11F50, 0x16130, 0x16A60, 0x16AC0, 0x16B50, 0x16D70, 0x1CCF0, 0x1D7CE, 0x1D7D8, 0x1D7E2, 0x1D7EC, 0x1D7F6, 0x1E140, 0x1E2F0, 0x1E4F0, 0x1E5F1, 0x1E950, 0x1FBF0];
// International format separates groups with single spaces, as libphonenumber-js does.
const REDZ_PHONE_PUNCTUATION = '/[\-\x{2010}-\x{2015}\x{2212}\x{30FC}\x{FF0D}\x{FF0F}\/\x{FF0E}. \x{A0}\x{AD}\x{200B}\x{2060}\x{3000}()\x{FF08}\x{FF09}\x{FF3B}\x{FF3D}\[\]~\x{2053}\x{223C}\x{FF5E}]+/u';

function REDZ_Phone_Version(): string {
	return REDZ_PHONE_VERSION;
}

/** Google libphonenumber release the PHP side runs on, e.g. "v9.0.41". */
function REDZ_Phone_Google(): string {
	static $tag = null;
	return $tag ??= (string)(require __DIR__ . '/libphonenumber/METADATA-VERSION.php');
}

/** @return array<string, string> ISO region → calling code, sorted by region */
function REDZ_Phone_Countries(): array {
	$util = PhoneNumberUtil::getInstance();
	$out = [];
	foreach ($util->getSupportedRegions() as $region) {
		$out[$region] = (string)$util->getCountryCodeForRegion($region);
	}
	ksort($out);
	return $out;
}

/** Digits of any script become ASCII; only digits and a leading "+" survive. */
function REDZ_Phone_Normalize(string $input): string {
	$plus = false;
	$digits = '';
	foreach (mb_str_split(mb_scrub($input, 'UTF-8'), 1, 'UTF-8') as $ch) {
		$cp = mb_ord($ch, 'UTF-8');
		if ($cp === 0x2B || $cp === 0xFF0B) {
			$plus = $plus || $digits === '';
			continue;
		}
		foreach (REDZ_PHONE_DIGIT_ZEROS as $zero) {
			if ($cp >= $zero && $cp <= $zero + 9) {
				$digits .= (string)($cp - $zero);
				break;
			}
		}
	}
	return ($plus ? '+' : '') . $digits;
}

/**
 * @param string $country ISO region the form suggests ("" = none)
 * @param list<string> $types accepted number types, e.g. ['MOBILE']; [] = any
 * @return array{ok:bool, error:string|null, warning:string|null, e164:string|null, country:string|null, code:string|null, type:string|null, international:string|null}
 */
function REDZ_Phone_Parse(string $input, string $country = '', array $types = []): array {
	if (mb_strlen($input, 'UTF-8') > REDZ_PHONE_MAX_INPUT) {
		return REDZ_Phone_Fail('too_long');
	}
	$s = REDZ_Phone_Normalize($input);
	$digits = ltrim($s, '+');
	if ($digits === '') {
		return REDZ_Phone_Fail('empty');
	}
	if (strlen($digits) > REDZ_PHONE_MAX_DIGITS) {
		return REDZ_Phone_Fail('too_long');
	}
	$country = $country |> trim(...) |> strtoupper(...);
	if (!in_array($country, PhoneNumberUtil::getInstance()->getSupportedRegions(), true)) {
		$country = '';
	}
	$types = array_intersect(REDZ_PHONE_TYPES, array_map(static fn(mixed $t): string => is_string($t) ? strtoupper($t) : '', $types)) |> array_values(...);
	if (str_starts_with($s, '+0')) {
		$s = $digits;
	}
	if (str_starts_with($s, '00')) {
		$asPlus = REDZ_Phone_Evaluate('+' . substr($s, 2), '', $types);
		if ($country === '') {
			return $asPlus;
		}
		$asDialled = REDZ_Phone_Evaluate($s, $country, $types);
		return REDZ_Phone_Rank($asDialled) > REDZ_Phone_Rank($asPlus) ? $asDialled : $asPlus;
	}
	if (!str_starts_with($s, '+') && $country === '') {
		return REDZ_Phone_Fail('no_country');
	}
	return REDZ_Phone_Evaluate($s, $country, $types);
}

/** @internal */
function REDZ_Phone_Evaluate(string $s, string $country, array $types): array {
	if ((ltrim($s, '+') |> strlen(...)) < 2) {
		return REDZ_Phone_Fail('too_short');
	}
	$util = PhoneNumberUtil::getInstance();
	try {
		$number = $util->parse($s, $country === '' ? null : $country);
	} catch (NumberParseException $e) {
		return REDZ_Phone_Fail(match ($e->getErrorType()) {
			NumberParseException::NOT_A_NUMBER, NumberParseException::TOO_SHORT_AFTER_IDD, NumberParseException::TOO_SHORT_NSN => 'too_short',
			NumberParseException::TOO_LONG => 'too_long',
			default => 'invalid',
		});
	}
	if ($util->isValidNumber($number)) {
		$type = $util->getNumberType($number)->name;
		$result = REDZ_Phone_Result($number, $country, $type);
		if ($types !== [] && !REDZ_Phone_TypeAccepted($type, $types)) {
			return [...$result, 'ok' => false, 'error' => 'wrong_type'];
		}
		return $result;
	}
	$code = (int)$number->getCountryCode();
	$region = $util->getRegionCodeForCountryCode($code);
	$metadata = $region === PhoneNumberUtil::REGION_CODE_FOR_NON_GEO_ENTITY ? $util->getMetadataForNonGeographicalRegion($code) : $util->getMetadataForRegion($region);
	$nsn = $util->getNationalSignificantNumber($number);
	$reasons = array_map(static fn(string $t): string => REDZ_Phone_Length($metadata, $nsn, $t), $types === [] ? [''] : $types);
	if (in_array('IS_POSSIBLE', $reasons, true)) {
		return [...REDZ_Phone_Result($number, $country, null), 'warning' => 'unallocated'];
	}
	$short = array_all($reasons, static fn(string $r): bool => $r === 'TOO_SHORT');
	$long = array_all($reasons, static fn(string $r): bool => $r === 'TOO_LONG');
	return REDZ_Phone_Fail($short ? 'too_short' : ($long ? 'too_long' : 'invalid'));
}

/** @internal Length verdict of libphonenumber-js (Google's test without local-only lengths), so both sides agree. */
function REDZ_Phone_Length(PhoneMetadata $metadata, string $nsn, string $type): string {
	$general = $metadata->getGeneralDesc()->getPossibleLength();
	$desc = REDZ_Phone_Desc($metadata, $type);
	$lengths = $desc?->getPossibleLength() ?: $general;
	if ($type === 'FIXED_LINE_OR_MOBILE') {
		if (REDZ_Phone_Desc($metadata, 'FIXED_LINE') === null) {
			return REDZ_Phone_Length($metadata, $nsn, 'MOBILE');
		}
		$mobile = REDZ_Phone_Desc($metadata, 'MOBILE');
		if ($mobile !== null) {
			$lengths = array_merge($lengths, $mobile->getPossibleLength() ?: $general) |> array_unique(...);
			sort($lengths);
		}
	} elseif ($type !== '' && $desc === null) {
		return 'INVALID_LENGTH';
	}
	if ($lengths === []) {
		return 'IS_POSSIBLE';
	}
	$length = strlen($nsn);
	return match (true) {
		in_array($length, $lengths, true) => 'IS_POSSIBLE',
		$length < min($lengths) => 'TOO_SHORT',
		$length > max($lengths) => 'TOO_LONG',
		default => 'INVALID_LENGTH',
	};
}

/** @internal Description of a number type, null when the region has no such numbers. */
function REDZ_Phone_Desc(PhoneMetadata $metadata, string $type): ?PhoneNumberDesc {
	$desc = match ($type) {
		'FIXED_LINE' => $metadata->getFixedLine(),
		'MOBILE' => $metadata->getMobile(),
		'TOLL_FREE' => $metadata->getTollFree(),
		'PREMIUM_RATE' => $metadata->getPremiumRate(),
		'SHARED_COST' => $metadata->getSharedCost(),
		'VOIP' => $metadata->getVoip(),
		'PERSONAL_NUMBER' => $metadata->getPersonalNumber(),
		'PAGER' => $metadata->getPager(),
		'UAN' => $metadata->getUan(),
		'VOICEMAIL' => $metadata->getVoicemail(),
		default => null,
	};
	return $desc?->hasNationalNumberPattern() ? $desc : null;
}

/** @internal */
function REDZ_Phone_Result(PhoneNumber $number, string $country, ?string $type): array {
	$util = PhoneNumberUtil::getInstance();
	$code = (int)$number->getCountryCode();
	if ($type !== null) {
		$region = $util->getRegionCodeForNumber($number);
	} else {
		$regions = $util->getRegionCodesForCountryCode($code);
		$region = in_array($country, $regions, true) ? $country : ($regions[0] ?? null);
	}
	return [
		'ok' => true,
		'error' => null,
		'warning' => null,
		'e164' => $util->format($number, PhoneNumberFormat::E164),
		'country' => $region === PhoneNumberUtil::REGION_CODE_FOR_NON_GEO_ENTITY ? null : $region,
		'code' => (string)$code,
		'type' => $type,
		'international' => preg_replace(REDZ_PHONE_PUNCTUATION, ' ', $util->format($number, PhoneNumberFormat::INTERNATIONAL)) |> trim(...),
	];
}

/** @internal */
function REDZ_Phone_Fail(string $error): array {
	return ['ok' => false, 'error' => $error, 'warning' => null, 'e164' => null, 'country' => null, 'code' => null, 'type' => null, 'international' => null];
}

/** @internal */
function REDZ_Phone_TypeAccepted(string $type, array $types): bool {
	return in_array($type, $types, true)
		|| ($type === 'FIXED_LINE_OR_MOBILE' && (in_array('MOBILE', $types, true) || in_array('FIXED_LINE', $types, true)));
}

/** @internal */
function REDZ_Phone_Rank(array $result): int {
	return match (true) {
		$result['ok'] && $result['warning'] === null => 3,
		$result['ok'] => 2,
		$result['error'] === 'wrong_type' => 1,
		default => 0,
	};
}
