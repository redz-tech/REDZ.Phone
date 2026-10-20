<?php
// Gate helper: runs the cases of tools/gate.mjs through the PHP engine and dumps the rules PHP reads.
// Usage: php tools/gate.php < cases.json   (a JSON list of [input, country, types])

declare(strict_types=1);

require __DIR__ . '/../php/redz.phone.php';

use libphonenumber\PhoneMetadata;
use libphonenumber\PhoneNumberUtil;

const GATE_TYPES = ['FIXED_LINE', 'MOBILE', 'TOLL_FREE', 'PREMIUM_RATE', 'PERSONAL_NUMBER', 'VOICEMAIL', 'UAN', 'PAGER', 'VOIP', 'SHARED_COST'];

function Gate_Value(?string $value): ?string {
	return $value === null || $value === '' ? null : $value;
}

function Gate_Rules(PhoneMetadata $m): array {
	$general = $m->getGeneralDesc()->getPossibleLength();
	$row = [
		'code' => (string)$m->getCountryCode(),
		'idd' => Gate_Value($m->getInternationalPrefix()),
		'preferredIdd' => Gate_Value($m->getPreferredInternationalPrefix()),
		'prefix' => Gate_Value($m->getNationalPrefix()),
		'prefixForParsing' => Gate_Value($m->getNationalPrefixForParsing()) ?? Gate_Value($m->getNationalPrefix()),
		'prefixTransform' => Gate_Value($m->getNationalPrefixTransformRule()),
		'leadingDigits' => Gate_Value($m->getLeadingDigits()),
		'pattern' => $m->getGeneralDesc()->getNationalNumberPattern(),
		'lengths' => $general,
	];
	foreach (GATE_TYPES as $type) {
		$desc = REDZ_Phone_Desc($m, $type);
		$row[$type] = $desc === null ? null : [$desc->getNationalNumberPattern(), $desc->getPossibleLength() ?: $general];
	}
	return $row;
}

$util = PhoneNumberUtil::getInstance();
$rules = [];
foreach ($util->getSupportedRegions() as $region) {
	$rules[$region] = Gate_Rules($util->getMetadataForRegion($region));
}
foreach ($util->getSupportedGlobalNetworkCallingCodes() as $code) {
	$rules[(string)$code] = Gate_Rules($util->getMetadataForNonGeographicalRegion($code));
}
$codes = [];
foreach ($util->getSupportedCallingCodes() as $code) {
	$codes[(string)$code] = $util->getRegionCodesForCountryCode($code);
}

$cases = json_decode((string)stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR);
echo json_encode([
	'version' => REDZ_Phone_Version(),
	'google' => REDZ_Phone_Google(),
	'countries' => REDZ_Phone_Countries(),
	'rules' => $rules,
	'codes' => $codes,
	'results' => array_map(static fn(array $c): array => REDZ_Phone_Parse($c[0], $c[1], $c[2]), $cases),
], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
