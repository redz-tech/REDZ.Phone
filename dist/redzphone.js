/*! REDZ.Phone 0.2.0 | MIT | metadata: Google libphonenumber v9.0.41 (Apache-2.0) | engine: libphonenumber-js (MIT) | icons: Bootstrap Icons (MIT), Simple Icons (CC0) | see NOTICE */
var REDZ = REDZ || {};
REDZ.Phone = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/redzphone.js
  var redzphone_exports = {};
  __export(redzphone_exports, {
    countries: () => countries,
    example: () => example,
    field: () => field,
    google: () => google,
    load: () => load,
    normalize: () => normalize,
    parse: () => parse2,
    ready: () => ready,
    setMeta: () => setMeta,
    version: () => version
  });

  // node_modules/libphonenumber-js/es6/tools/semver-compare.js
  function semver_compare_default(a, b) {
    a = a.split("-");
    b = b.split("-");
    var pa = a[0].split(".");
    var pb = b[0].split(".");
    for (var i = 0; i < 3; i++) {
      var na = Number(pa[i]);
      var nb = Number(pb[i]);
      if (na > nb) return 1;
      if (nb > na) return -1;
      if (!isNaN(na) && isNaN(nb)) return 1;
      if (isNaN(na) && !isNaN(nb)) return -1;
    }
    if (a[1] && b[1]) {
      return a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0;
    }
    return !a[1] && b[1] ? 1 : a[1] && !b[1] ? -1 : 0;
  }

  // node_modules/libphonenumber-js/es6/helpers/isObject.js
  var objectConstructor = {}.constructor;
  function isObject(object) {
    return object !== void 0 && object !== null && object.constructor === objectConstructor;
  }

  // node_modules/libphonenumber-js/es6/helpers/isCallingCode.js
  var CALLING_CODE_REG_EXP = /^\d+$/;
  function isCallingCode(string) {
    return CALLING_CODE_REG_EXP.test(string);
  }

  // node_modules/libphonenumber-js/es6/metadata.js
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof(o);
  }
  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  var V3 = "1.2.0";
  var V4 = "1.7.35";
  var DEFAULT_EXT_PREFIX = " ext. ";
  var Metadata = /* @__PURE__ */ (function() {
    function Metadata2(metadata) {
      _classCallCheck(this, Metadata2);
      validateMetadata(metadata);
      this.metadata = metadata;
      setVersion.call(this, metadata);
    }
    return _createClass(Metadata2, [{
      key: "getCountries",
      value: function getCountries() {
        return Object.keys(this.metadata.countries).filter(function(_) {
          return _ !== "001";
        });
      }
    }, {
      key: "getCountryMetadata",
      value: function getCountryMetadata(countryCode) {
        return this.metadata.countries[countryCode];
      }
    }, {
      key: "nonGeographic",
      value: function nonGeographic() {
        if (this.v1 || this.v2 || this.v3) return;
        return this.metadata.nonGeographic || this.metadata.nonGeographical;
      }
    }, {
      key: "hasCountry",
      value: function hasCountry(country) {
        return this.getCountryMetadata(country) !== void 0;
      }
    }, {
      key: "hasCallingCode",
      value: function hasCallingCode(callingCode) {
        if (this.getCountryCodesForCallingCode(callingCode)) {
          return true;
        }
        if (this.nonGeographic()) {
          if (this.nonGeographic()[callingCode]) {
            return true;
          }
        } else {
          var countryCodes = this.countryCallingCodes()[callingCode];
          if (countryCodes && countryCodes.length === 1 && countryCodes[0] === "001") {
            return true;
          }
        }
      }
    }, {
      key: "isNonGeographicCallingCode",
      value: function isNonGeographicCallingCode(callingCode) {
        if (this.nonGeographic()) {
          return this.nonGeographic()[callingCode] ? true : false;
        } else {
          return this.getCountryCodesForCallingCode(callingCode) ? false : true;
        }
      }
      // Deprecated.
    }, {
      key: "country",
      value: function country(countryCode) {
        return this.selectNumberingPlan(countryCode);
      }
      /**
       * Selects a telephone numbering plan based on either a country code or a calling code.
       * @param {string} argument — Country code or calling code.
       * @param {string} legacyArgumentCallingCode — Legacy argument: calling code, if the first argument is not passed.
       */
    }, {
      key: "selectNumberingPlan",
      value: function selectNumberingPlan(argument, legacyArgumentCallingCode) {
        var countryCode;
        var callingCode;
        if (argument) {
          if (isCallingCode(argument)) {
            callingCode = argument;
          } else {
            countryCode = argument;
          }
        }
        if (legacyArgumentCallingCode) {
          callingCode = legacyArgumentCallingCode;
        }
        if (countryCode && countryCode !== "001") {
          var countryMetadata = this.getCountryMetadata(countryCode);
          if (!countryMetadata) {
            throw new Error("Unknown country: ".concat(countryCode));
          }
          this.numberingPlan = new NumberingPlan(countryMetadata, this);
        } else if (callingCode) {
          if (!this.hasCallingCode(callingCode)) {
            throw new Error("Unknown calling code: ".concat(callingCode));
          }
          this.numberingPlan = new NumberingPlan(this.getNumberingPlanMetadata(callingCode), this);
        } else {
          this.numberingPlan = void 0;
        }
        return this;
      }
    }, {
      key: "getCountryCodesForCallingCode",
      value: function getCountryCodesForCallingCode(callingCode) {
        var countryCodes = this.countryCallingCodes()[callingCode];
        if (countryCodes) {
          if (countryCodes.length === 1 && countryCodes[0].length === 3) {
            return;
          }
          return countryCodes;
        }
      }
    }, {
      key: "getCountryCodeForCallingCode",
      value: function getCountryCodeForCallingCode(callingCode) {
        var countryCodes = this.getCountryCodesForCallingCode(callingCode);
        if (countryCodes) {
          return countryCodes[0];
        }
      }
    }, {
      key: "getNumberingPlanMetadata",
      value: function getNumberingPlanMetadata(callingCode) {
        var countryCode = this.getCountryCodeForCallingCode(callingCode);
        if (countryCode) {
          return this.getCountryMetadata(countryCode);
        }
        if (this.nonGeographic()) {
          var metadata = this.nonGeographic()[callingCode];
          if (metadata) {
            return metadata;
          }
        } else {
          var countryCodes = this.countryCallingCodes()[callingCode];
          if (countryCodes && countryCodes.length === 1 && countryCodes[0] === "001") {
            return this.metadata.countries["001"];
          }
        }
      }
      // Deprecated.
    }, {
      key: "countryCallingCode",
      value: function countryCallingCode() {
        return this.numberingPlan.callingCode();
      }
      // Deprecated.
    }, {
      key: "IDDPrefix",
      value: function IDDPrefix() {
        return this.numberingPlan.IDDPrefix();
      }
      // Deprecated.
    }, {
      key: "defaultIDDPrefix",
      value: function defaultIDDPrefix() {
        return this.numberingPlan.defaultIDDPrefix();
      }
      // Deprecated.
    }, {
      key: "nationalNumberPattern",
      value: function nationalNumberPattern() {
        return this.numberingPlan.nationalNumberPattern();
      }
      // Deprecated.
    }, {
      key: "possibleLengths",
      value: function possibleLengths() {
        return this.numberingPlan.possibleLengths();
      }
      // Deprecated.
    }, {
      key: "formats",
      value: function formats() {
        return this.numberingPlan.formats();
      }
      // Deprecated.
    }, {
      key: "nationalPrefixForParsing",
      value: function nationalPrefixForParsing() {
        return this.numberingPlan.nationalPrefixForParsing();
      }
      // Deprecated.
    }, {
      key: "nationalPrefixTransformRule",
      value: function nationalPrefixTransformRule() {
        return this.numberingPlan.nationalPrefixTransformRule();
      }
      // Deprecated.
    }, {
      key: "leadingDigits",
      value: function leadingDigits() {
        return this.numberingPlan.leadingDigits();
      }
      // Deprecated.
    }, {
      key: "hasTypes",
      value: function hasTypes() {
        return this.numberingPlan.hasTypes();
      }
      // Deprecated.
    }, {
      key: "type",
      value: function type(_type) {
        return this.numberingPlan.type(_type);
      }
      // Deprecated.
    }, {
      key: "ext",
      value: function ext() {
        return this.numberingPlan.ext();
      }
    }, {
      key: "countryCallingCodes",
      value: function countryCallingCodes() {
        if (this.v1) return this.metadata.country_phone_code_to_countries;
        return this.metadata.country_calling_codes;
      }
      // Deprecated.
    }, {
      key: "chooseCountryByCountryCallingCode",
      value: function chooseCountryByCountryCallingCode(callingCode) {
        return this.selectNumberingPlan(callingCode);
      }
    }, {
      key: "hasSelectedNumberingPlan",
      value: function hasSelectedNumberingPlan() {
        return this.numberingPlan !== void 0;
      }
    }]);
  })();
  var NumberingPlan = /* @__PURE__ */ (function() {
    function NumberingPlan2(metadata, globalMetadataObject) {
      _classCallCheck(this, NumberingPlan2);
      this.globalMetadataObject = globalMetadataObject;
      this.metadata = metadata;
      setVersion.call(this, globalMetadataObject.metadata);
    }
    return _createClass(NumberingPlan2, [{
      key: "callingCode",
      value: function callingCode() {
        return this.metadata[0];
      }
      // When multiple countries share the same calling code,
      // all phone number formatting rules are included in the metadata
      // of the "default" country for that calling code.
      // Any other countries' metdata doesn't include any formatting rules.
      // Google developers said that such storage architecture was chosen for performance reasons.
      //
      // For example, for NANPA region ("North American Numbering Plan Administration",
      // which includes USA, Canada, Cayman Islands, Bahamas, etc) all formatting rules
      // are contained in the metadata of `US` country.
      //
      // This is not public API.
      //
    }, {
      key: "_getDefaultCountryMetadataForThisCallingCode",
      value: function _getDefaultCountryMetadataForThisCallingCode() {
        return this.globalMetadataObject.getNumberingPlanMetadata(this.callingCode());
      }
      // Deprecated.
    }, {
      key: "getDefaultCountryMetadataForRegion",
      value: function getDefaultCountryMetadataForRegion() {
        return this._getDefaultCountryMetadataForThisCallingCode();
      }
      // Is always present.
    }, {
      key: "IDDPrefix",
      value: function IDDPrefix() {
        if (this.v1 || this.v2) return;
        return this.metadata[1];
      }
      // Is only present when a country supports multiple IDD prefixes.
    }, {
      key: "defaultIDDPrefix",
      value: function defaultIDDPrefix() {
        if (this.v1 || this.v2) return;
        return this.metadata[12];
      }
    }, {
      key: "nationalNumberPattern",
      value: function nationalNumberPattern() {
        if (this.v1 || this.v2) return this.metadata[1];
        return this.metadata[2];
      }
      // "possible length" data is always present in Google's metadata.
    }, {
      key: "possibleLengths",
      value: function possibleLengths() {
        if (this.v1) return;
        return this.metadata[this.v2 ? 2 : 3];
      }
    }, {
      key: "_getFormats",
      value: function _getFormats(metadata) {
        return metadata[this.v1 ? 2 : this.v2 ? 3 : 4];
      }
      // For countries of the same region (e.g. NANPA)
      // formats are all stored in the "main" country for that region.
      // E.g. "RU" and "KZ", "US" and "CA".
    }, {
      key: "formats",
      value: function formats() {
        var _this = this;
        var formats2 = this._getFormats(this.metadata) || this._getFormats(this._getDefaultCountryMetadataForThisCallingCode()) || [];
        return formats2.map(function(_) {
          return new Format(_, _this);
        });
      }
    }, {
      key: "nationalPrefix",
      value: function nationalPrefix() {
        return this.metadata[this.v1 ? 3 : this.v2 ? 4 : 5];
      }
    }, {
      key: "_getNationalPrefixFormattingRule",
      value: function _getNationalPrefixFormattingRule(metadata) {
        return metadata[this.v1 ? 4 : this.v2 ? 5 : 6];
      }
      // For countries of the same region (e.g. NANPA)
      // national prefix formatting rule is stored in the "main" country for that region.
      // E.g. "RU" and "KZ", "US" and "CA".
    }, {
      key: "nationalPrefixFormattingRule",
      value: function nationalPrefixFormattingRule() {
        return this._getNationalPrefixFormattingRule(this.metadata) || this._getNationalPrefixFormattingRule(this._getDefaultCountryMetadataForThisCallingCode());
      }
    }, {
      key: "_nationalPrefixForParsing",
      value: function _nationalPrefixForParsing() {
        return this.metadata[this.v1 ? 5 : this.v2 ? 6 : 7];
      }
    }, {
      key: "nationalPrefixForParsing",
      value: function nationalPrefixForParsing() {
        return this._nationalPrefixForParsing() || this.nationalPrefix();
      }
    }, {
      key: "nationalPrefixTransformRule",
      value: function nationalPrefixTransformRule() {
        return this.metadata[this.v1 ? 6 : this.v2 ? 7 : 8];
      }
    }, {
      key: "_getNationalPrefixIsOptionalWhenFormatting",
      value: function _getNationalPrefixIsOptionalWhenFormatting() {
        return !!this.metadata[this.v1 ? 7 : this.v2 ? 8 : 9];
      }
      // For countries of the same region (e.g. NANPA)
      // "national prefix is optional when formatting" flag is
      // stored in the "main" country for that region.
      // E.g. "RU" and "KZ", "US" and "CA".
    }, {
      key: "nationalPrefixIsOptionalWhenFormattingInNationalFormat",
      value: function nationalPrefixIsOptionalWhenFormattingInNationalFormat() {
        return this._getNationalPrefixIsOptionalWhenFormatting(this.metadata) || this._getNationalPrefixIsOptionalWhenFormatting(this._getDefaultCountryMetadataForThisCallingCode());
      }
    }, {
      key: "leadingDigits",
      value: function leadingDigits() {
        return this.metadata[this.v1 ? 8 : this.v2 ? 9 : 10];
      }
    }, {
      key: "types",
      value: function types() {
        return this.metadata[this.v1 ? 9 : this.v2 ? 10 : 11];
      }
    }, {
      key: "hasTypes",
      value: function hasTypes() {
        if (this.types() && this.types().length === 0) {
          return false;
        }
        return !!this.types();
      }
    }, {
      key: "type",
      value: function type(_type2) {
        if (this.hasTypes() && getType(this.types(), _type2)) {
          return new Type(getType(this.types(), _type2), this);
        }
      }
    }, {
      key: "ext",
      value: function ext() {
        if (this.v1 || this.v2) return DEFAULT_EXT_PREFIX;
        return this.metadata[13] || DEFAULT_EXT_PREFIX;
      }
    }]);
  })();
  var Format = /* @__PURE__ */ (function() {
    function Format2(format, metadata) {
      _classCallCheck(this, Format2);
      this._format = format;
      this.metadata = metadata;
    }
    return _createClass(Format2, [{
      key: "pattern",
      value: function pattern() {
        return this._format[0];
      }
    }, {
      key: "format",
      value: function format() {
        return this._format[1];
      }
    }, {
      key: "leadingDigitsPatterns",
      value: function leadingDigitsPatterns() {
        return this._format[2] || [];
      }
    }, {
      key: "nationalPrefixFormattingRule",
      value: function nationalPrefixFormattingRule() {
        return this._format[3] || this.metadata.nationalPrefixFormattingRule();
      }
    }, {
      key: "nationalPrefixIsOptionalWhenFormattingInNationalFormat",
      value: function nationalPrefixIsOptionalWhenFormattingInNationalFormat() {
        return !!this._format[4] || this.metadata.nationalPrefixIsOptionalWhenFormattingInNationalFormat();
      }
    }, {
      key: "nationalPrefixIsMandatoryWhenFormattingInNationalFormat",
      value: function nationalPrefixIsMandatoryWhenFormattingInNationalFormat() {
        return this.usesNationalPrefix() && !this.nationalPrefixIsOptionalWhenFormattingInNationalFormat();
      }
      // Checks whether national prefix formatting rule contains national prefix.
    }, {
      key: "usesNationalPrefix",
      value: function usesNationalPrefix() {
        return this.nationalPrefixFormattingRule() && // Check that national prefix formatting rule is not a "dummy" one.
        !FIRST_GROUP_ONLY_PREFIX_PATTERN.test(this.nationalPrefixFormattingRule()) ? true : false;
      }
    }, {
      key: "internationalFormat",
      value: function internationalFormat() {
        return this._format[5] || this.format();
      }
    }]);
  })();
  var FIRST_GROUP_ONLY_PREFIX_PATTERN = /^\(?\$1\)?$/;
  var Type = /* @__PURE__ */ (function() {
    function Type2(type, metadata) {
      _classCallCheck(this, Type2);
      this.type = type;
      this.metadata = metadata;
    }
    return _createClass(Type2, [{
      key: "pattern",
      value: function pattern() {
        if (this.metadata.v1) return this.type;
        return this.type[0];
      }
    }, {
      key: "possibleLengths",
      value: function possibleLengths() {
        if (this.metadata.v1) return;
        return this.type[1] || this.metadata.possibleLengths();
      }
    }]);
  })();
  function getType(types, type) {
    switch (type) {
      case "FIXED_LINE":
        return types[0];
      case "MOBILE":
        return types[1];
      case "TOLL_FREE":
        return types[2];
      case "PREMIUM_RATE":
        return types[3];
      case "PERSONAL_NUMBER":
        return types[4];
      case "VOICEMAIL":
        return types[5];
      case "UAN":
        return types[6];
      case "PAGER":
        return types[7];
      case "VOIP":
        return types[8];
      case "SHARED_COST":
        return types[9];
    }
  }
  function validateMetadata(metadata) {
    if (!metadata) {
      throw new Error("[libphonenumber-js] `metadata` argument not passed. Check your arguments.");
    }
    if (!isObject(metadata) || !isObject(metadata.countries)) {
      throw new Error("[libphonenumber-js] `metadata` argument was passed but it's not a valid metadata. Must be an object having `.countries` child object property. Got ".concat(isObject(metadata) ? "an object of shape: { " + Object.keys(metadata).join(", ") + " }" : "a " + typeOf(metadata) + ": " + metadata, "."));
    }
  }
  var typeOf = function typeOf2(_) {
    return _typeof(_);
  };
  function getCountryCallingCode(country, metadataJson) {
    var metadata = new Metadata(metadataJson);
    if (metadata.hasCountry(country)) {
      return metadata.selectNumberingPlan(country).countryCallingCode();
    }
    throw new Error("Unknown country: ".concat(country));
  }
  function isSupportedCountry(country, metadataJson) {
    return metadataJson.countries.hasOwnProperty(country);
  }
  function setVersion(metadata) {
    var version2 = metadata.version;
    if (typeof version2 === "number") {
      this.v1 = version2 === 1;
      this.v2 = version2 === 2;
      this.v3 = version2 === 3;
      this.v4 = version2 === 4;
    } else {
      if (!version2) {
        this.v1 = true;
      } else if (semver_compare_default(version2, V3) === -1) {
        this.v2 = true;
      } else if (semver_compare_default(version2, V4) === -1) {
        this.v3 = true;
      } else {
        this.v4 = true;
      }
    }
  }

  // node_modules/libphonenumber-js/es6/helpers/mergeArrays.js
  function _createForOfIteratorHelperLoose(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function mergeArrays(a, b) {
    var merged = a.slice();
    for (var _iterator = _createForOfIteratorHelperLoose(b), _step; !(_step = _iterator()).done; ) {
      var element = _step.value;
      if (a.indexOf(element) < 0) {
        merged.push(element);
      }
    }
    return merged.sort(function(a2, b2) {
      return a2 - b2;
    });
  }

  // node_modules/libphonenumber-js/es6/helpers/checkNumberLength.js
  function checkNumberLength(nationalNumber, country, metadata) {
    return checkNumberLengthForType(nationalNumber, void 0, country, metadata);
  }
  function checkNumberLengthForType(nationalNumber, type, country, metadata) {
    if (country) {
      metadata = new Metadata(metadata.metadata);
      metadata.selectNumberingPlan(country);
    }
    var type_info = metadata.type(type);
    var possible_lengths = type_info && type_info.possibleLengths() || metadata.possibleLengths();
    if (!possible_lengths) {
      return "IS_POSSIBLE";
    }
    if (type === "FIXED_LINE_OR_MOBILE") {
      if (!metadata.type("FIXED_LINE")) {
        return checkNumberLengthForType(nationalNumber, "MOBILE", country, metadata);
      }
      var mobile_type = metadata.type("MOBILE");
      if (mobile_type) {
        possible_lengths = mergeArrays(possible_lengths, mobile_type.possibleLengths());
      }
    } else if (type && !type_info) {
      return "INVALID_LENGTH";
    }
    var actual_length = nationalNumber.length;
    var minimum_length = possible_lengths[0];
    if (minimum_length === actual_length) {
      return "IS_POSSIBLE";
    }
    if (minimum_length > actual_length) {
      return "TOO_SHORT";
    }
    if (possible_lengths[possible_lengths.length - 1] < actual_length) {
      return "TOO_LONG";
    }
    return possible_lengths.indexOf(actual_length, 1) >= 0 ? "IS_POSSIBLE" : "INVALID_LENGTH";
  }

  // node_modules/libphonenumber-js/es6/isPossible.js
  function isPossiblePhoneNumber(input, options, metadataJson) {
    if (options === void 0) {
      options = {};
    }
    var metadata = new Metadata(metadataJson);
    if (options.v2) {
      if (!input.countryCallingCode) {
        throw new Error("Invalid phone number object passed");
      }
      metadata.selectNumberingPlan(input.country || input.countryCallingCode);
    } else {
      if (!input.phone) {
        return false;
      }
      if (input.country) {
        if (!metadata.hasCountry(input.country)) {
          throw new Error("Unknown country: ".concat(input.country));
        }
        metadata.selectNumberingPlan(input.country);
      } else {
        if (!input.countryCallingCode) {
          throw new Error("Invalid phone number object passed");
        }
        metadata.selectNumberingPlan(input.countryCallingCode);
      }
    }
    if (metadata.possibleLengths()) {
      return isPossibleNumber(input.phone || input.nationalNumber, metadata);
    }
    if (input.countryCallingCode && metadata.isNonGeographicCallingCode(input.countryCallingCode)) {
      return true;
    }
    throw new Error('Missing "possibleLengths" in metadata. Perhaps the metadata has been generated before v1.0.18.');
  }
  function isPossibleNumber(nationalNumber, metadata) {
    switch (checkNumberLength(nationalNumber, void 0, metadata)) {
      case "IS_POSSIBLE":
        return true;
      // This library ignores "local-only" phone numbers (for simplicity).
      // See the readme for more info on what are "local-only" phone numbers.
      // case 'IS_POSSIBLE_LOCAL_ONLY':
      // 	return !isInternational
      default:
        return false;
    }
  }

  // node_modules/libphonenumber-js/es6/helpers/matchesEntirely.js
  function matchesEntirely(text, regularExpressionText) {
    text = text || "";
    return new RegExp("^(?:" + regularExpressionText + ")$").test(text);
  }

  // node_modules/libphonenumber-js/es6/helpers/getNumberType.js
  function _createForOfIteratorHelperLoose2(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray2(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray2(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray2(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray2(r, a) : void 0;
    }
  }
  function _arrayLikeToArray2(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  var NON_FIXED_LINE_PHONE_TYPES = ["MOBILE", "PREMIUM_RATE", "TOLL_FREE", "SHARED_COST", "VOIP", "PERSONAL_NUMBER", "PAGER", "UAN", "VOICEMAIL"];
  function getNumberType(input, options, metadataJson) {
    options = options || {};
    if (!input.country && !input.countryCallingCode) {
      return;
    }
    var metadata = new Metadata(metadataJson);
    metadata.selectNumberingPlan(input.country || input.countryCallingCode);
    var nationalNumber = options.v2 ? input.nationalNumber : input.phone;
    if (!matchesEntirely(nationalNumber, metadata.nationalNumberPattern())) {
      return;
    }
    if (isNumberTypeEqualTo(nationalNumber, "FIXED_LINE", metadata)) {
      if (metadata.type("MOBILE") && metadata.type("MOBILE").pattern() === "") {
        return "FIXED_LINE_OR_MOBILE";
      }
      if (!metadata.type("MOBILE")) {
        return "FIXED_LINE_OR_MOBILE";
      }
      if (isNumberTypeEqualTo(nationalNumber, "MOBILE", metadata)) {
        return "FIXED_LINE_OR_MOBILE";
      }
      return "FIXED_LINE";
    }
    for (var _iterator = _createForOfIteratorHelperLoose2(NON_FIXED_LINE_PHONE_TYPES), _step; !(_step = _iterator()).done; ) {
      var type = _step.value;
      if (isNumberTypeEqualTo(nationalNumber, type, metadata)) {
        return type;
      }
    }
  }
  function isNumberTypeEqualTo(nationalNumber, type, metadata) {
    var typeDefinition = metadata.type(type);
    if (!typeDefinition || !typeDefinition.pattern()) {
      return false;
    }
    if (typeDefinition.possibleLengths() && typeDefinition.possibleLengths().indexOf(nationalNumber.length) < 0) {
      return false;
    }
    return matchesEntirely(nationalNumber, typeDefinition.pattern());
  }

  // node_modules/libphonenumber-js/es6/isValid.js
  function isValidNumber(input, options, metadataJson) {
    options = options || {};
    var metadata = new Metadata(metadataJson);
    metadata.selectNumberingPlan(input.country || input.countryCallingCode);
    if (metadata.hasTypes()) {
      return getNumberType(input, options, metadata.metadata) !== void 0;
    }
    var nationalNumber = options.v2 ? input.nationalNumber : input.phone;
    return matchesEntirely(nationalNumber, metadata.nationalNumberPattern());
  }

  // node_modules/libphonenumber-js/es6/helpers/isCountryCode.js
  var COUNTRY_CODE_REG_EXP = /^[A-Z]{2}$/;
  function isCountryCode(string) {
    return COUNTRY_CODE_REG_EXP.test(string);
  }

  // node_modules/libphonenumber-js/es6/helpers/getCountryAndCallingCodeFromOneOfThem.js
  var USE_NON_GEOGRAPHIC_COUNTRY_CODE = false;
  function getCountryAndCallingCodeFromOneOfThem(countryOrCallingCode, metadataJson) {
    var country;
    var callingCode;
    var metadata = new Metadata(metadataJson);
    if (isCountryCode(countryOrCallingCode)) {
      country = countryOrCallingCode;
      metadata.selectNumberingPlan(country);
      callingCode = metadata.countryCallingCode();
    } else {
      callingCode = countryOrCallingCode;
      if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
        if (metadata.isNonGeographicCallingCode(callingCode)) {
          country = "001";
        }
      }
    }
    return {
      country,
      callingCode
    };
  }

  // node_modules/libphonenumber-js/es6/helpers/getPossibleCountriesForNumber.js
  function getPossibleCountriesForNumber(callingCode, nationalNumber, metadata) {
    var _metadata = new Metadata(metadata);
    var possibleCountries = _metadata.getCountryCodesForCallingCode(callingCode);
    if (!possibleCountries) {
      return [];
    }
    return possibleCountries.filter(function(country) {
      return couldNationalNumberBelongToCountry(nationalNumber, country, metadata);
    });
  }
  function couldNationalNumberBelongToCountry(nationalNumber, country, metadataJson) {
    var metadata = new Metadata(metadataJson);
    metadata.selectNumberingPlan(country);
    return metadata.numberingPlan.possibleLengths().indexOf(nationalNumber.length) >= 0;
  }

  // node_modules/libphonenumber-js/es6/constants.js
  var MIN_LENGTH_FOR_NSN = 2;
  var MAX_LENGTH_FOR_NSN = 17;
  var MAX_LENGTH_COUNTRY_CODE = 3;
  var VALID_DIGITS = "0-9０-９٠-٩۰-۹";
  var DASHES = "-‐-―−ー－";
  var SLASHES = "／/";
  var DOTS = "．.";
  var WHITESPACE = "  ­​⁠　";
  var BRACKETS = "()（）［］\\[\\]";
  var TILDES = "~⁓∼～";
  var VALID_PUNCTUATION = "".concat(DASHES).concat(SLASHES).concat(DOTS).concat(WHITESPACE).concat(BRACKETS).concat(TILDES);
  var PLUS_CHARS = "+＋";

  // node_modules/libphonenumber-js/es6/helpers/stripIddPrefix.js
  var CAPTURING_DIGIT_PATTERN = new RegExp("([" + VALID_DIGITS + "])");
  function stripIddPrefix(number, country, callingCode, metadataJson) {
    if (!country) {
      return;
    }
    var metadata = new Metadata(metadataJson);
    metadata.selectNumberingPlan(country || callingCode);
    var IDDPrefixPattern = new RegExp(metadata.IDDPrefix());
    if (number.search(IDDPrefixPattern) !== 0) {
      return;
    }
    number = number.slice(number.match(IDDPrefixPattern)[0].length);
    var matchedGroups = number.match(CAPTURING_DIGIT_PATTERN);
    if (matchedGroups && matchedGroups[1] != null && matchedGroups[1].length > 0) {
      if (matchedGroups[1] === "0") {
        return;
      }
    }
    return number;
  }

  // node_modules/libphonenumber-js/es6/helpers/extractNationalNumberFromPossiblyIncompleteNumber.js
  function extractNationalNumberFromPossiblyIncompleteNumber(number, metadata) {
    if (number && metadata.numberingPlan.nationalPrefixForParsing()) {
      var prefixPattern = new RegExp("^(?:" + metadata.numberingPlan.nationalPrefixForParsing() + ")");
      var prefixMatch = prefixPattern.exec(number);
      if (prefixMatch) {
        var nationalNumber;
        var carrierCode;
        var capturedGroupsCount = prefixMatch.length - 1;
        var hasCapturedGroups = capturedGroupsCount > 0 && prefixMatch[capturedGroupsCount];
        if (metadata.nationalPrefixTransformRule() && hasCapturedGroups) {
          nationalNumber = number.replace(prefixPattern, metadata.nationalPrefixTransformRule());
          if (capturedGroupsCount > 1) {
            carrierCode = prefixMatch[1];
          }
        } else {
          var prefixBeforeNationalNumber = prefixMatch[0];
          nationalNumber = number.slice(prefixBeforeNationalNumber.length);
          if (hasCapturedGroups) {
            carrierCode = prefixMatch[1];
          }
        }
        var nationalPrefix;
        if (hasCapturedGroups) {
          var possiblePositionOfTheFirstCapturedGroup = number.indexOf(prefixMatch[1]);
          var possibleNationalPrefix = number.slice(0, possiblePositionOfTheFirstCapturedGroup);
          if (possibleNationalPrefix === metadata.numberingPlan.nationalPrefix()) {
            nationalPrefix = metadata.numberingPlan.nationalPrefix();
          }
        } else {
          nationalPrefix = prefixMatch[0];
        }
        return {
          nationalNumber,
          nationalPrefix,
          carrierCode
        };
      }
    }
    return {
      nationalNumber: number
    };
  }

  // node_modules/libphonenumber-js/es6/helpers/getCountryByNationalNumber.js
  function _createForOfIteratorHelperLoose3(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray3(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray3(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray3(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray3(r, a) : void 0;
    }
  }
  function _arrayLikeToArray3(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function getCountryByNationalNumber(nationalNumber, countries2, metadataJson) {
    var metadata = new Metadata(metadataJson);
    for (var _iterator = _createForOfIteratorHelperLoose3(countries2), _step; !(_step = _iterator()).done; ) {
      var country = _step.value;
      metadata.selectNumberingPlan(country);
      if (metadata.leadingDigits()) {
        if (nationalNumber && nationalNumber.search(metadata.leadingDigits()) === 0) {
          return country;
        }
      } else if (getNumberType({
        phone: nationalNumber,
        country
      }, void 0, metadata.metadata)) {
        return country;
      }
    }
  }

  // node_modules/libphonenumber-js/es6/helpers/getCountryByCallingCode.js
  var USE_NON_GEOGRAPHIC_COUNTRY_CODE2 = false;
  function getCountryByCallingCode(callingCode, _ref) {
    var nationalNumber = _ref.nationalNumber, metadata = _ref.metadata;
    if (USE_NON_GEOGRAPHIC_COUNTRY_CODE2) {
      if (metadata.isNonGeographicCallingCode(callingCode)) {
        return "001";
      }
    }
    var possibleCountries = metadata.getCountryCodesForCallingCode(callingCode);
    if (!possibleCountries) {
      return;
    }
    if (possibleCountries.length === 1) {
      return possibleCountries[0];
    }
    return getCountryByNationalNumber(nationalNumber, possibleCountries, metadata.metadata);
  }

  // node_modules/libphonenumber-js/es6/helpers/extractNationalNumber.js
  function extractNationalNumber(number, country, metadata) {
    var _extractNationalNumbe = extractNationalNumberFromPossiblyIncompleteNumber(number, metadata), carrierCode = _extractNationalNumbe.carrierCode, nationalNumber = _extractNationalNumbe.nationalNumber;
    if (nationalNumber !== number) {
      if (!shouldHaveExtractedNationalPrefix(number, nationalNumber, metadata)) {
        return {
          nationalNumber: number
        };
      }
      if (metadata.numberingPlan.possibleLengths()) {
        if (!country) {
          country = getCountryByCallingCode(metadata.numberingPlan.callingCode(), {
            nationalNumber,
            metadata
          });
        }
        if (!isPossibleIncompleteNationalNumber(nationalNumber, country, metadata)) {
          return {
            nationalNumber: number
          };
        }
      }
    }
    return {
      nationalNumber,
      carrierCode
    };
  }
  function shouldHaveExtractedNationalPrefix(nationalNumberBefore, nationalNumberAfter, metadata) {
    if (matchesEntirely(nationalNumberBefore, metadata.nationalNumberPattern()) && !matchesEntirely(nationalNumberAfter, metadata.nationalNumberPattern())) {
      return false;
    }
    return true;
  }
  function isPossibleIncompleteNationalNumber(nationalNumber, country, metadata) {
    switch (checkNumberLength(nationalNumber, country, metadata)) {
      case "TOO_SHORT":
      case "INVALID_LENGTH":
        return false;
      default:
        return true;
    }
  }

  // node_modules/libphonenumber-js/es6/helpers/extractCountryCallingCodeFromInternationalNumberWithoutPlusSign.js
  function extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(number, country, defaultCountry, defaultCallingCode, metadataJson) {
    if (!(country || defaultCountry || defaultCallingCode)) {
      return {
        number
      };
    }
    var countryCallingCode = country || defaultCountry ? getCountryCallingCode(country || defaultCountry, metadataJson) : defaultCallingCode;
    if (number.indexOf(countryCallingCode) === 0) {
      var metadata = new Metadata(metadataJson);
      metadata.selectNumberingPlan(country || defaultCountry || defaultCallingCode);
      var possibleShorterNumber = number.slice(countryCallingCode.length);
      var _extractNationalNumbe = extractNationalNumber(possibleShorterNumber, void 0, metadata), possibleShorterNationalNumber = _extractNationalNumbe.nationalNumber;
      var _extractNationalNumbe2 = extractNationalNumber(number, void 0, metadata), nationalNumber = _extractNationalNumbe2.nationalNumber;
      if (!matchesEntirely(nationalNumber, metadata.nationalNumberPattern()) && matchesEntirely(possibleShorterNationalNumber, metadata.nationalNumberPattern()) || checkNumberLength(nationalNumber, void 0, metadata) === "TOO_LONG") {
        return {
          countryCallingCode,
          number: possibleShorterNumber
        };
      }
    }
    return {
      number
    };
  }

  // node_modules/libphonenumber-js/es6/helpers/extractCountryCallingCode.js
  function extractCountryCallingCode(number, country, defaultCountry, defaultCallingCode, metadataJson) {
    if (!number) {
      return {};
    }
    var isNumberWithIddPrefix;
    if (number[0] !== "+") {
      var numberWithoutIDD = stripIddPrefix(number, country || defaultCountry, defaultCallingCode, metadataJson);
      if (numberWithoutIDD && numberWithoutIDD !== number) {
        isNumberWithIddPrefix = true;
        number = "+" + numberWithoutIDD;
      } else {
        if (country || defaultCountry || defaultCallingCode) {
          var _extractCountryCallin = extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(number, country, defaultCountry, defaultCallingCode, metadataJson), countryCallingCode = _extractCountryCallin.countryCallingCode, shorterNumber = _extractCountryCallin.number;
          if (countryCallingCode) {
            return {
              countryCallingCodeSource: "FROM_NUMBER_WITHOUT_PLUS_SIGN",
              countryCallingCode,
              number: shorterNumber
            };
          }
        }
        return {
          // No need to set it to `UNSPECIFIED`. It can be just `undefined`.
          // countryCallingCodeSource: 'UNSPECIFIED',
          number
        };
      }
    }
    if (number[1] === "0") {
      return {};
    }
    var metadata = new Metadata(metadataJson);
    var i = 2;
    while (i - 1 <= MAX_LENGTH_COUNTRY_CODE && i <= number.length) {
      var _countryCallingCode = number.slice(1, i);
      if (metadata.hasCallingCode(_countryCallingCode)) {
        metadata.selectNumberingPlan(_countryCallingCode);
        return {
          countryCallingCodeSource: isNumberWithIddPrefix ? "FROM_NUMBER_WITH_IDD" : "FROM_NUMBER_WITH_PLUS_SIGN",
          countryCallingCode: _countryCallingCode,
          number: number.slice(i)
        };
      }
      i++;
    }
    return {};
  }

  // node_modules/libphonenumber-js/es6/helpers/applyInternationalSeparatorStyle.js
  function applyInternationalSeparatorStyle(formattedNumber) {
    return formattedNumber.replace(new RegExp("[".concat(VALID_PUNCTUATION, "]+"), "g"), " ").trim();
  }

  // node_modules/libphonenumber-js/es6/helpers/formatNationalNumberUsingFormat.js
  var FIRST_GROUP_PATTERN = /(\$\d)/;
  function formatNationalNumberUsingFormat(number, format, _ref) {
    var useInternationalFormat = _ref.useInternationalFormat, withNationalPrefix = _ref.withNationalPrefix, carrierCode = _ref.carrierCode, metadata = _ref.metadata;
    var formattedNumber = number.replace(new RegExp(format.pattern()), useInternationalFormat ? format.internationalFormat() : (
      // This library doesn't use `domestic_carrier_code_formatting_rule`,
      // because that one is only used when formatting phone numbers
      // for dialing from a mobile phone, and this is not a dialing library.
      // carrierCode && format.domesticCarrierCodeFormattingRule()
      // 	// First, replace the $CC in the formatting rule with the desired carrier code.
      // 	// Then, replace the $FG in the formatting rule with the first group
      // 	// and the carrier code combined in the appropriate way.
      // 	? format.format().replace(FIRST_GROUP_PATTERN, format.domesticCarrierCodeFormattingRule().replace('$CC', carrierCode))
      // 	: (
      // 		withNationalPrefix && format.nationalPrefixFormattingRule()
      // 			? format.format().replace(FIRST_GROUP_PATTERN, format.nationalPrefixFormattingRule())
      // 			: format.format()
      // 	)
      withNationalPrefix && format.nationalPrefixFormattingRule() ? format.format().replace(FIRST_GROUP_PATTERN, format.nationalPrefixFormattingRule()) : format.format()
    ));
    if (useInternationalFormat) {
      return applyInternationalSeparatorStyle(formattedNumber);
    }
    return formattedNumber;
  }

  // node_modules/libphonenumber-js/es6/helpers/getIddPrefix.js
  var SINGLE_IDD_PREFIX_REG_EXP = /^[\d]+(?:[~\u2053\u223C\uFF5E][\d]+)?$/;
  function getIddPrefix(country, callingCode, metadata) {
    var countryMetadata = new Metadata(metadata);
    countryMetadata.selectNumberingPlan(country || callingCode);
    if (countryMetadata.defaultIDDPrefix()) {
      return countryMetadata.defaultIDDPrefix();
    }
    if (SINGLE_IDD_PREFIX_REG_EXP.test(countryMetadata.IDDPrefix())) {
      return countryMetadata.IDDPrefix();
    }
  }

  // node_modules/libphonenumber-js/es6/helpers/extension/createExtensionPattern.js
  var RFC3966_EXTN_PREFIX = ";ext=";
  var getExtensionDigitsPattern = function getExtensionDigitsPattern2(maxLength) {
    return "([".concat(VALID_DIGITS, "]{1,").concat(maxLength, "})");
  };
  function createExtensionPattern(purpose) {
    var extLimitAfterExplicitLabel = "20";
    var extLimitAfterLikelyLabel = "15";
    var extLimitAfterAmbiguousChar = "9";
    var extLimitWhenNotSure = "6";
    var possibleSeparatorsBetweenNumberAndExtLabel = "[  \\t,]*";
    var possibleCharsAfterExtLabel = "[:\\.．]?[  \\t,-]*";
    var optionalExtnSuffix = "#?";
    var explicitExtLabels = "(?:e?xt(?:ensi(?:ó?|ó))?n?|ｅ?ｘｔｎ?|доб|anexo)";
    var ambiguousExtLabels = "(?:[xｘ#＃~～]|int|ｉｎｔ)";
    var ambiguousSeparator = "[- ]+";
    var possibleSeparatorsNumberExtLabelNoComma = "[  \\t]*";
    var autoDiallingAndExtLabelsFound = "(?:,{2}|;)";
    var rfcExtn = RFC3966_EXTN_PREFIX + getExtensionDigitsPattern(extLimitAfterExplicitLabel);
    var explicitExtn = possibleSeparatorsBetweenNumberAndExtLabel + explicitExtLabels + possibleCharsAfterExtLabel + getExtensionDigitsPattern(extLimitAfterExplicitLabel) + optionalExtnSuffix;
    var ambiguousExtn = possibleSeparatorsBetweenNumberAndExtLabel + ambiguousExtLabels + possibleCharsAfterExtLabel + getExtensionDigitsPattern(extLimitAfterAmbiguousChar) + optionalExtnSuffix;
    var americanStyleExtnWithSuffix = ambiguousSeparator + getExtensionDigitsPattern(extLimitWhenNotSure) + "#";
    var autoDiallingExtn = possibleSeparatorsNumberExtLabelNoComma + autoDiallingAndExtLabelsFound + possibleCharsAfterExtLabel + getExtensionDigitsPattern(extLimitAfterLikelyLabel) + optionalExtnSuffix;
    var onlyCommasExtn = possibleSeparatorsNumberExtLabelNoComma + "(?:,)+" + possibleCharsAfterExtLabel + getExtensionDigitsPattern(extLimitAfterAmbiguousChar) + optionalExtnSuffix;
    return rfcExtn + "|" + explicitExtn + "|" + ambiguousExtn + "|" + americanStyleExtnWithSuffix + "|" + autoDiallingExtn + "|" + onlyCommasExtn;
  }

  // node_modules/libphonenumber-js/es6/helpers/isViablePhoneNumber.js
  var MIN_LENGTH_PHONE_NUMBER_PATTERN = "[" + VALID_DIGITS + "]{" + MIN_LENGTH_FOR_NSN + "}";
  var VALID_PHONE_NUMBER = "[" + PLUS_CHARS + "]{0,1}(?:[" + VALID_PUNCTUATION + "]*[" + VALID_DIGITS + "]){3,}[" + VALID_PUNCTUATION + VALID_DIGITS + "]*";
  var VALID_PHONE_NUMBER_START_REG_EXP = new RegExp("^[" + PLUS_CHARS + "]{0,1}(?:[" + VALID_PUNCTUATION + "]*[" + VALID_DIGITS + "]){1,2}$", "i");
  var VALID_PHONE_NUMBER_WITH_EXTENSION = VALID_PHONE_NUMBER + // Phone number extensions
  "(?:" + createExtensionPattern() + ")?";
  var VALID_PHONE_NUMBER_PATTERN = new RegExp(
    // Either a short two-digit-only phone number
    "^" + MIN_LENGTH_PHONE_NUMBER_PATTERN + "$|^" + VALID_PHONE_NUMBER_WITH_EXTENSION + "$",
    "i"
  );
  function isViablePhoneNumber(number) {
    return number.length >= MIN_LENGTH_FOR_NSN && VALID_PHONE_NUMBER_PATTERN.test(number);
  }
  function isViablePhoneNumberStart(number) {
    return VALID_PHONE_NUMBER_START_REG_EXP.test(number);
  }

  // node_modules/libphonenumber-js/es6/helpers/RFC3966.js
  function formatRFC3966(_ref) {
    var number = _ref.number, ext = _ref.ext;
    if (!number) {
      return "";
    }
    if (number[0] !== "+") {
      throw new Error('"formatRFC3966()" expects "number" to be in E.164 format.');
    }
    return "tel:".concat(number).concat(ext ? ";ext=" + ext : "");
  }

  // node_modules/libphonenumber-js/es6/format.js
  var DEFAULT_OPTIONS = {
    formatExtension: function formatExtension(formattedNumber, extension, metadata) {
      return "".concat(formattedNumber).concat(metadata.ext()).concat(extension);
    }
  };
  function formatNumber(input, format, options, metadataJson) {
    if (options) {
      options = merge({}, DEFAULT_OPTIONS, options);
    } else {
      options = DEFAULT_OPTIONS;
    }
    var metadata = new Metadata(metadataJson);
    if (input.country && input.country !== "001") {
      if (!metadata.hasCountry(input.country)) {
        throw new Error("Unknown country: ".concat(input.country));
      }
      metadata.selectNumberingPlan(input.country);
    } else if (input.countryCallingCode) {
      metadata.selectNumberingPlan(input.countryCallingCode);
    } else return input.phone || "";
    var countryCallingCode = metadata.countryCallingCode();
    var nationalNumber = options.v2 ? input.nationalNumber : input.phone;
    var number;
    switch (format) {
      case "NATIONAL":
        if (!nationalNumber) {
          return "";
        }
        number = formatNationalNumber(nationalNumber, input.carrierCode, "NATIONAL", metadata, options);
        return addExtension(number, input.ext, metadata, options.formatExtension);
      case "INTERNATIONAL":
        if (!nationalNumber) {
          return "+".concat(countryCallingCode);
        }
        number = formatNationalNumber(nationalNumber, null, "INTERNATIONAL", metadata, options);
        number = "+".concat(countryCallingCode, " ").concat(number);
        return addExtension(number, input.ext, metadata, options.formatExtension);
      case "E.164":
        return "+".concat(countryCallingCode).concat(nationalNumber);
      case "RFC3966":
        return formatRFC3966({
          number: "+".concat(countryCallingCode).concat(nationalNumber),
          ext: input.ext
        });
      // For reference, here's Google's IDD formatter:
      // https://github.com/google/libphonenumber/blob/32719cf74e68796788d1ca45abc85dcdc63ba5b9/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberUtil.java#L1546
      // Not saying that this IDD formatter replicates it 1:1, but it seems to work.
      // Who would even need to format phone numbers in IDD format anyway?
      case "IDD":
        if (!options.fromCountry) {
          return;
        }
        var formattedNumber = formatIDD(nationalNumber, input.carrierCode, countryCallingCode, options.fromCountry, metadata);
        if (!formattedNumber) {
          return;
        }
        return addExtension(formattedNumber, input.ext, metadata, options.formatExtension);
      default:
        throw new Error('Unknown "format" argument passed to "formatNumber()": "'.concat(format, '"'));
    }
  }
  function formatNationalNumber(number, carrierCode, formatAs, metadata, options) {
    var format = chooseFormatForNumber(metadata.formats(), number);
    if (!format) {
      return number;
    }
    return formatNationalNumberUsingFormat(number, format, {
      useInternationalFormat: formatAs === "INTERNATIONAL",
      withNationalPrefix: format.nationalPrefixIsOptionalWhenFormattingInNationalFormat() && options && options.nationalPrefix === false ? false : true,
      carrierCode,
      metadata
    });
  }
  function chooseFormatForNumber(availableFormats, nationalNumber) {
    return pickFirstMatchingElement(availableFormats, function(format) {
      if (format.leadingDigitsPatterns().length > 0) {
        var lastLeadingDigitsPattern = format.leadingDigitsPatterns()[format.leadingDigitsPatterns().length - 1];
        if (nationalNumber.search(lastLeadingDigitsPattern) !== 0) {
          return false;
        }
      }
      return matchesEntirely(nationalNumber, format.pattern());
    });
  }
  function addExtension(formattedNumber, ext, metadata, formatExtension2) {
    return ext ? formatExtension2(formattedNumber, ext, metadata) : formattedNumber;
  }
  function formatIDD(nationalNumber, carrierCode, countryCallingCode, fromCountry, metadata) {
    var fromCountryCallingCode = getCountryCallingCode(fromCountry, metadata.metadata);
    if (fromCountryCallingCode === countryCallingCode) {
      var formattedNumber = formatNationalNumber(nationalNumber, carrierCode, "NATIONAL", metadata);
      if (countryCallingCode === "1") {
        return countryCallingCode + " " + formattedNumber;
      }
      return formattedNumber;
    }
    var iddPrefix = getIddPrefix(fromCountry, void 0, metadata.metadata);
    if (iddPrefix) {
      return "".concat(iddPrefix, " ").concat(countryCallingCode, " ").concat(formatNationalNumber(nationalNumber, null, "INTERNATIONAL", metadata));
    }
  }
  function merge() {
    var i = 1;
    for (var _len = arguments.length, objects = new Array(_len), _key = 0; _key < _len; _key++) {
      objects[_key] = arguments[_key];
    }
    while (i < objects.length) {
      if (objects[i]) {
        for (var key in objects[i]) {
          objects[0][key] = objects[i][key];
        }
      }
      i++;
    }
    return objects[0];
  }
  function pickFirstMatchingElement(elements, testFunction) {
    var i = 0;
    while (i < elements.length) {
      if (testFunction(elements[i])) {
        return elements[i];
      }
      i++;
    }
  }

  // node_modules/libphonenumber-js/es6/PhoneNumber.js
  function _typeof2(o) {
    "@babel/helpers - typeof";
    return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof2(o);
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey2(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _classCallCheck2(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties2(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey2(o.key), o);
    }
  }
  function _createClass2(e, r, t) {
    return r && _defineProperties2(e.prototype, r), t && _defineProperties2(e, t), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey2(t) {
    var i = _toPrimitive2(t, "string");
    return "symbol" == _typeof2(i) ? i : i + "";
  }
  function _toPrimitive2(t, r) {
    if ("object" != _typeof2(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof2(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  var PhoneNumber = /* @__PURE__ */ (function() {
    function PhoneNumber2(countryOrCountryCallingCode, nationalNumber, metadata) {
      _classCallCheck2(this, PhoneNumber2);
      if (!countryOrCountryCallingCode) {
        throw new TypeError("First argument is required");
      }
      if (typeof countryOrCountryCallingCode !== "string") {
        throw new TypeError("First argument must be a string");
      }
      if (countryOrCountryCallingCode[0] === "+" && !nationalNumber) {
        throw new TypeError("`metadata` argument not passed");
      }
      if (isObject(nationalNumber) && isObject(nationalNumber.countries)) {
        metadata = nationalNumber;
        var e164Number = countryOrCountryCallingCode;
        if (!E164_NUMBER_REGEXP.test(e164Number)) {
          throw new Error('Invalid `number` argument passed: must consist of a "+" followed by digits');
        }
        var _extractCountryCallin = extractCountryCallingCode(e164Number, void 0, void 0, void 0, metadata), _countryCallingCode = _extractCountryCallin.countryCallingCode, number = _extractCountryCallin.number;
        nationalNumber = number;
        countryOrCountryCallingCode = _countryCallingCode;
        if (!nationalNumber) {
          throw new Error("Invalid `number` argument passed: too short");
        }
      }
      if (!nationalNumber) {
        throw new TypeError("`nationalNumber` argument is required");
      }
      if (typeof nationalNumber !== "string") {
        throw new TypeError("`nationalNumber` argument must be a string");
      }
      validateMetadata(metadata);
      var _getCountryAndCalling = getCountryAndCallingCodeFromOneOfThem(countryOrCountryCallingCode, metadata), country = _getCountryAndCalling.country, countryCallingCode = _getCountryAndCalling.callingCode;
      this.country = country;
      this.countryCallingCode = countryCallingCode;
      this.nationalNumber = nationalNumber;
      this.number = "+" + this.countryCallingCode + this.nationalNumber;
      this.getMetadata = function() {
        return metadata;
      };
    }
    return _createClass2(PhoneNumber2, [{
      key: "setExt",
      value: function setExt(ext) {
        this.ext = ext;
      }
    }, {
      key: "getPossibleCountries",
      value: function getPossibleCountries() {
        if (this.country) {
          return [this.country];
        }
        return getPossibleCountriesForNumber(this.countryCallingCode, this.nationalNumber, this.getMetadata());
      }
    }, {
      key: "isPossible",
      value: function isPossible() {
        return isPossiblePhoneNumber(this, {
          v2: true
        }, this.getMetadata());
      }
    }, {
      key: "isValid",
      value: function isValid() {
        return isValidNumber(this, {
          v2: true
        }, this.getMetadata());
      }
    }, {
      key: "isNonGeographic",
      value: function isNonGeographic() {
        var metadata = new Metadata(this.getMetadata());
        return metadata.isNonGeographicCallingCode(this.countryCallingCode);
      }
    }, {
      key: "isEqual",
      value: function isEqual(phoneNumber) {
        return this.number === phoneNumber.number && this.ext === phoneNumber.ext;
      }
      // `validateLength()` method was originally meant to be an equivalent for `validatePhoneNumberLength()`.
      //
      // Later, it became apparent that it's not really a true equivalent.
      // The reason is that a `PhoneNumber` instance is not created
      // when the phone number string is too short for it to be considered a valid phone number:
      // * When there must be at least 2 national (significant) number digits: `"1"`.
      // * When the country calling code part of an international number is incomplete: `"+12"`.
      //
      // So leaving this `validateLength()` method here would suggest a hidden anti-pattern
      // of using it instead of `validatePhoneNumberLength()` while ignoring
      // the "too short to be even possible" case from phone number length validation.
      // And ignoring that case wouldn't make any sense in a real-world application
      // because it would still be a valid case that should be handled.
      //
      // Because of that, this method was eventually commented out in order to not introduce
      // that kind of an anti-pattern.
      //
      // validateLength() {
      // 	const result = checkNumberLength(
      // 		this.nationalNumber,
      // 		undefined,
      // 		this.getMetadata()
      // 	)
      // 	if (result !== 'IS_POSSIBLE') {
      // 		return result
      // 	}
      // }
    }, {
      key: "getType",
      value: function getType2() {
        return getNumberType(this, {
          v2: true
        }, this.getMetadata());
      }
    }, {
      key: "format",
      value: function format(_format, options) {
        return formatNumber(this, _format, options ? _objectSpread(_objectSpread({}, options), {}, {
          v2: true
        }) : {
          v2: true
        }, this.getMetadata());
      }
    }, {
      key: "formatNational",
      value: function formatNational(options) {
        return this.format("NATIONAL", options);
      }
    }, {
      key: "formatInternational",
      value: function formatInternational(options) {
        return this.format("INTERNATIONAL", options);
      }
    }, {
      key: "getURI",
      value: function getURI(options) {
        return this.format("RFC3966", options);
      }
    }]);
  })();
  var E164_NUMBER_REGEXP = /^\+\d+$/;

  // node_modules/libphonenumber-js/es6/ParseError.js
  function _typeof3(o) {
    "@babel/helpers - typeof";
    return _typeof3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof3(o);
  }
  function _defineProperties3(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey3(o.key), o);
    }
  }
  function _createClass3(e, r, t) {
    return r && _defineProperties3(e.prototype, r), t && _defineProperties3(e, t), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey3(t) {
    var i = _toPrimitive3(t, "string");
    return "symbol" == _typeof3(i) ? i : i + "";
  }
  function _toPrimitive3(t, r) {
    if ("object" != _typeof3(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof3(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _classCallCheck3(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _callSuper(t, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
  }
  function _possibleConstructorReturn(t, e) {
    if (e && ("object" == _typeof3(e) || "function" == typeof e)) return e;
    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
    return _assertThisInitialized(t);
  }
  function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
  }
  function _inherits(t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: true, configurable: true } }), Object.defineProperty(t, "prototype", { writable: false }), e && _setPrototypeOf(t, e);
  }
  function _wrapNativeSuper(t) {
    var r = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
    return _wrapNativeSuper = function _wrapNativeSuper2(t2) {
      if (null === t2 || !_isNativeFunction(t2)) return t2;
      if ("function" != typeof t2) throw new TypeError("Super expression must either be null or a function");
      if (void 0 !== r) {
        if (r.has(t2)) return r.get(t2);
        r.set(t2, Wrapper);
      }
      function Wrapper() {
        return _construct(t2, arguments, _getPrototypeOf(this).constructor);
      }
      return Wrapper.prototype = Object.create(t2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }), _setPrototypeOf(Wrapper, t2);
    }, _wrapNativeSuper(t);
  }
  function _construct(t, e, r) {
    if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
    var o = [null];
    o.push.apply(o, e);
    var p = new (t.bind.apply(t, o))();
    return r && _setPrototypeOf(p, r.prototype), p;
  }
  function _isNativeReflectConstruct() {
    try {
      var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t2) {
    }
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
      return !!t;
    })();
  }
  function _isNativeFunction(t) {
    try {
      return -1 !== Function.toString.call(t).indexOf("[native code]");
    } catch (n) {
      return "function" == typeof t;
    }
  }
  function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
      return t2.__proto__ = e2, t2;
    }, _setPrototypeOf(t, e);
  }
  function _getPrototypeOf(t) {
    return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
      return t2.__proto__ || Object.getPrototypeOf(t2);
    }, _getPrototypeOf(t);
  }
  var ParseError = /* @__PURE__ */ (function(_Error) {
    function ParseError2(code) {
      var _this;
      _classCallCheck3(this, ParseError2);
      _this = _callSuper(this, ParseError2, [code]);
      Object.setPrototypeOf(_this, ParseError2.prototype);
      _this.name = _this.constructor.name;
      return _this;
    }
    _inherits(ParseError2, _Error);
    return _createClass3(ParseError2);
  })(/* @__PURE__ */ _wrapNativeSuper(Error));

  // node_modules/libphonenumber-js/es6/helpers/extension/extractExtension.js
  var EXTN_PATTERN = new RegExp("(?:" + createExtensionPattern() + ")$", "i");
  function extractExtension(number) {
    var start = number.search(EXTN_PATTERN);
    if (start < 0) {
      return {};
    }
    var numberWithoutExtension = number.slice(0, start);
    var matches = number.match(EXTN_PATTERN);
    var i = 1;
    while (i < matches.length) {
      if (matches[i]) {
        return {
          number: numberWithoutExtension,
          ext: matches[i]
        };
      }
      i++;
    }
  }

  // node_modules/libphonenumber-js/es6/helpers/parseDigits.js
  var DIGITS = {
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "０": "0",
    // Fullwidth digit 0
    "１": "1",
    // Fullwidth digit 1
    "２": "2",
    // Fullwidth digit 2
    "３": "3",
    // Fullwidth digit 3
    "４": "4",
    // Fullwidth digit 4
    "５": "5",
    // Fullwidth digit 5
    "６": "6",
    // Fullwidth digit 6
    "７": "7",
    // Fullwidth digit 7
    "８": "8",
    // Fullwidth digit 8
    "９": "9",
    // Fullwidth digit 9
    "٠": "0",
    // Arabic-indic digit 0
    "١": "1",
    // Arabic-indic digit 1
    "٢": "2",
    // Arabic-indic digit 2
    "٣": "3",
    // Arabic-indic digit 3
    "٤": "4",
    // Arabic-indic digit 4
    "٥": "5",
    // Arabic-indic digit 5
    "٦": "6",
    // Arabic-indic digit 6
    "٧": "7",
    // Arabic-indic digit 7
    "٨": "8",
    // Arabic-indic digit 8
    "٩": "9",
    // Arabic-indic digit 9
    "۰": "0",
    // Eastern-Arabic digit 0
    "۱": "1",
    // Eastern-Arabic digit 1
    "۲": "2",
    // Eastern-Arabic digit 2
    "۳": "3",
    // Eastern-Arabic digit 3
    "۴": "4",
    // Eastern-Arabic digit 4
    "۵": "5",
    // Eastern-Arabic digit 5
    "۶": "6",
    // Eastern-Arabic digit 6
    "۷": "7",
    // Eastern-Arabic digit 7
    "۸": "8",
    // Eastern-Arabic digit 8
    "۹": "9"
    // Eastern-Arabic digit 9
  };
  function parseDigit(character) {
    return DIGITS[character];
  }

  // node_modules/libphonenumber-js/es6/parseIncompletePhoneNumber.js
  function _createForOfIteratorHelperLoose4(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray4(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray4(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray4(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray4(r, a) : void 0;
    }
  }
  function _arrayLikeToArray4(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function parseIncompletePhoneNumber(string) {
    var result2 = "";
    for (var _iterator = _createForOfIteratorHelperLoose4(string.split("")), _step; !(_step = _iterator()).done; ) {
      var character = _step.value;
      result2 += parsePhoneNumberCharacter(character, result2) || "";
    }
    return result2;
  }
  function parsePhoneNumberCharacter(character, prevParsedCharacters, eventListener) {
    if (character === "+") {
      if (prevParsedCharacters) {
        if (typeof eventListener === "function") {
          eventListener("end");
        }
        return;
      }
      return "+";
    }
    return parseDigit(character);
  }

  // node_modules/libphonenumber-js/es6/helpers/extractPhoneContext.js
  var PLUS_SIGN = "+";
  var RFC3966_VISUAL_SEPARATOR_ = "[\\-\\.\\(\\)]?";
  var RFC3966_PHONE_DIGIT_ = "([" + VALID_DIGITS + "]|" + RFC3966_VISUAL_SEPARATOR_ + ")";
  var RFC3966_GLOBAL_NUMBER_DIGITS_ = "^\\" + PLUS_SIGN + RFC3966_PHONE_DIGIT_ + "*[" + VALID_DIGITS + "]" + RFC3966_PHONE_DIGIT_ + "*$";
  var RFC3966_GLOBAL_NUMBER_DIGITS_PATTERN_ = new RegExp(RFC3966_GLOBAL_NUMBER_DIGITS_, "g");
  var ALPHANUM_ = VALID_DIGITS;
  var RFC3966_DOMAINLABEL_ = "[" + ALPHANUM_ + "]+((\\-)*[" + ALPHANUM_ + "])*";
  var VALID_ALPHA_ = "a-zA-Z";
  var RFC3966_TOPLABEL_ = "[" + VALID_ALPHA_ + "]+((\\-)*[" + ALPHANUM_ + "])*";
  var RFC3966_DOMAINNAME_ = "^(" + RFC3966_DOMAINLABEL_ + "\\.)*" + RFC3966_TOPLABEL_ + "\\.?$";
  var RFC3966_DOMAINNAME_PATTERN_ = new RegExp(RFC3966_DOMAINNAME_, "g");
  var RFC3966_PREFIX_ = "tel:";
  var RFC3966_PHONE_CONTEXT_ = ";phone-context=";
  var RFC3966_ISDN_SUBADDRESS_ = ";isub=";
  function extractPhoneContext(numberToExtractFrom) {
    var indexOfPhoneContext = numberToExtractFrom.indexOf(RFC3966_PHONE_CONTEXT_);
    if (indexOfPhoneContext < 0) {
      return null;
    }
    var phoneContextStart = indexOfPhoneContext + RFC3966_PHONE_CONTEXT_.length;
    if (phoneContextStart >= numberToExtractFrom.length) {
      return "";
    }
    var phoneContextEnd = numberToExtractFrom.indexOf(";", phoneContextStart);
    if (phoneContextEnd >= 0) {
      return numberToExtractFrom.substring(phoneContextStart, phoneContextEnd);
    } else {
      return numberToExtractFrom.substring(phoneContextStart);
    }
  }
  function isPhoneContextValid(phoneContext) {
    if (phoneContext === null) {
      return true;
    }
    if (phoneContext.length === 0) {
      return false;
    }
    return RFC3966_GLOBAL_NUMBER_DIGITS_PATTERN_.test(phoneContext) || RFC3966_DOMAINNAME_PATTERN_.test(phoneContext);
  }

  // node_modules/libphonenumber-js/es6/helpers/extractFormattedPhoneNumberFromPossibleRfc3966NumberUri.js
  function extractFormattedPhoneNumberFromPossibleRfc3966NumberUri(numberToParse, _ref) {
    var extractFormattedPhoneNumber = _ref.extractFormattedPhoneNumber;
    var phoneContext = extractPhoneContext(numberToParse);
    if (!isPhoneContextValid(phoneContext)) {
      throw new ParseError("NOT_A_NUMBER");
    }
    var phoneNumberString;
    if (phoneContext === null) {
      phoneNumberString = extractFormattedPhoneNumber(numberToParse) || "";
    } else {
      phoneNumberString = "";
      if (phoneContext.charAt(0) === PLUS_SIGN) {
        phoneNumberString += phoneContext;
      }
      var indexOfRfc3966Prefix = numberToParse.indexOf(RFC3966_PREFIX_);
      var indexOfNationalNumber;
      if (indexOfRfc3966Prefix >= 0) {
        indexOfNationalNumber = indexOfRfc3966Prefix + RFC3966_PREFIX_.length;
      } else {
        indexOfNationalNumber = 0;
      }
      var indexOfPhoneContext = numberToParse.indexOf(RFC3966_PHONE_CONTEXT_);
      phoneNumberString += numberToParse.substring(indexOfNationalNumber, indexOfPhoneContext);
    }
    var indexOfIsdn = phoneNumberString.indexOf(RFC3966_ISDN_SUBADDRESS_);
    if (indexOfIsdn > 0) {
      phoneNumberString = phoneNumberString.substring(0, indexOfIsdn);
    }
    if (phoneNumberString !== "") {
      return phoneNumberString;
    }
  }

  // node_modules/libphonenumber-js/es6/parse.js
  var MAX_INPUT_STRING_LENGTH = 250;
  var PHONE_NUMBER_START_PATTERN = new RegExp("[" + PLUS_CHARS + VALID_DIGITS + "]");
  var AFTER_PHONE_NUMBER_END_PATTERN = new RegExp("[^" + VALID_DIGITS + "#]+$");
  var USE_NON_GEOGRAPHIC_COUNTRY_CODE3 = false;
  function parse(text, options, metadataJson) {
    options = options || {};
    var metadata = new Metadata(metadataJson);
    if (options.defaultCountry && !metadata.hasCountry(options.defaultCountry)) {
      if (options.v2) {
        throw new ParseError("INVALID_COUNTRY");
      }
      throw new Error("Unknown country: ".concat(options.defaultCountry));
    }
    var _parseInput = parseInput(text, options.v2, options.extract), formattedPhoneNumber = _parseInput.number, ext = _parseInput.ext, error = _parseInput.error;
    if (!formattedPhoneNumber) {
      if (options.v2) {
        if (error === "TOO_SHORT") {
          throw new ParseError("TOO_SHORT");
        }
        throw new ParseError("NOT_A_NUMBER");
      }
      return {};
    }
    var _parsePhoneNumber = parsePhoneNumber(
      formattedPhoneNumber,
      options.defaultCountry,
      options.defaultCallingCode,
      // If `country` is returned, its numbering plan will also be selected in `metadata`.
      // Otherwise, if `countryCallingCode` is returned, its numbering plan will also be selected in `metadata`.
      // Otherwise, if neither `country` nor `countryCallingCode` are returned, no numbering plan will be selected in `metadata`.
      metadata
    ), country = _parsePhoneNumber.country, nationalNumber = _parsePhoneNumber.nationalNumber, countryCallingCode = _parsePhoneNumber.countryCallingCode, countryCallingCodeSource = _parsePhoneNumber.countryCallingCodeSource, carrierCode = _parsePhoneNumber.carrierCode;
    if (!metadata.hasSelectedNumberingPlan()) {
      if (options.v2) {
        throw new ParseError("INVALID_COUNTRY");
      }
      return {};
    }
    if (!nationalNumber || nationalNumber.length < MIN_LENGTH_FOR_NSN) {
      if (options.v2) {
        throw new ParseError("TOO_SHORT");
      }
      return {};
    }
    if (nationalNumber.length > MAX_LENGTH_FOR_NSN) {
      if (options.v2) {
        throw new ParseError("TOO_LONG");
      }
      return {};
    }
    if (options.v2) {
      var phoneNumber = new PhoneNumber(countryCallingCode, nationalNumber, metadata.metadata);
      if (country) {
        phoneNumber.country = country;
      }
      if (carrierCode) {
        phoneNumber.carrierCode = carrierCode;
      }
      if (ext) {
        phoneNumber.ext = ext;
      }
      phoneNumber.__countryCallingCodeSource = countryCallingCodeSource;
      return phoneNumber;
    }
    var valid = (options.extended ? metadata.hasSelectedNumberingPlan() : country) ? matchesEntirely(nationalNumber, metadata.nationalNumberPattern()) : false;
    if (!options.extended) {
      return valid ? result(country, nationalNumber, ext) : {};
    }
    return {
      country,
      countryCallingCode,
      carrierCode,
      valid,
      possible: valid ? true : options.extended === true && metadata.possibleLengths() && isPossibleNumber(nationalNumber, metadata) ? true : false,
      phone: nationalNumber,
      ext
    };
  }
  function _extractFormattedPhoneNumber(text, extract, throwOnError) {
    if (!text) {
      return;
    }
    if (text.length > MAX_INPUT_STRING_LENGTH) {
      if (throwOnError) {
        throw new ParseError("TOO_LONG");
      }
      return;
    }
    if (extract === false) {
      return text;
    }
    var startsAt = text.search(PHONE_NUMBER_START_PATTERN);
    if (startsAt < 0) {
      return;
    }
    return text.slice(startsAt).replace(AFTER_PHONE_NUMBER_END_PATTERN, "");
  }
  function parseInput(text, v2, extract) {
    var number = extractFormattedPhoneNumberFromPossibleRfc3966NumberUri(text, {
      extractFormattedPhoneNumber: function extractFormattedPhoneNumber(text2) {
        return _extractFormattedPhoneNumber(text2, extract, v2);
      }
    });
    if (!number) {
      return {};
    }
    if (!isViablePhoneNumber(number)) {
      if (isViablePhoneNumberStart(number)) {
        return {
          error: "TOO_SHORT"
        };
      }
      return {};
    }
    var withExtensionStripped = extractExtension(number);
    if (withExtensionStripped.ext) {
      return withExtensionStripped;
    }
    return {
      number
    };
  }
  function result(country, nationalNumber, ext) {
    var result2 = {
      country,
      phone: nationalNumber
    };
    if (ext) {
      result2.ext = ext;
    }
    return result2;
  }
  function parsePhoneNumber(formattedPhoneNumber, defaultCountry, defaultCallingCode, metadata) {
    var _extractCountryCallin = extractCountryCallingCode(
      parseIncompletePhoneNumber(formattedPhoneNumber),
      void 0,
      // `defaultCountry` and `defaultCallingCode` are only used to detect
      // if it's an "international" phone number or not. They won't be used
      // to derive the resulting `countryCallingCode` from them, or anything like that.
      defaultCountry,
      defaultCallingCode,
      metadata.metadata
    ), countryCallingCodeSource = _extractCountryCallin.countryCallingCodeSource, countryCallingCode = _extractCountryCallin.countryCallingCode, number = _extractCountryCallin.number;
    var country;
    if (countryCallingCode) {
      metadata.selectNumberingPlan(countryCallingCode);
    } else if (number && (defaultCountry || defaultCallingCode)) {
      if (defaultCountry) {
        country = defaultCountry;
        metadata.selectNumberingPlan(defaultCountry);
        countryCallingCode = metadata.numberingPlan.callingCode();
      } else {
        metadata.selectNumberingPlan(defaultCallingCode);
        countryCallingCode = defaultCallingCode;
        if (USE_NON_GEOGRAPHIC_COUNTRY_CODE3) {
          if (metadata.isNonGeographicCallingCode(countryCallingCode)) {
            country = "001";
          }
        }
      }
    } else return {};
    if (!number) {
      return {
        countryCallingCodeSource,
        countryCallingCode
      };
    }
    var _extractNationalNumbe = extractNationalNumber(parseIncompletePhoneNumber(number), void 0, metadata), nationalNumber = _extractNationalNumbe.nationalNumber, carrierCode = _extractNationalNumbe.carrierCode;
    var exactCountry = getCountryByCallingCode(countryCallingCode, {
      nationalNumber,
      metadata
    });
    if (exactCountry) {
      country = exactCountry;
      if (exactCountry === "001") {
      } else {
        metadata.selectNumberingPlan(country);
      }
    }
    return {
      country,
      countryCallingCode,
      countryCallingCodeSource,
      nationalNumber,
      carrierCode
    };
  }

  // node_modules/libphonenumber-js/es6/parsePhoneNumberWithError_.js
  function _typeof4(o) {
    "@babel/helpers - typeof";
    return _typeof4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof4(o);
  }
  function ownKeys2(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys2(Object(t), true).forEach(function(r2) {
        _defineProperty2(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys2(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty2(e, r, t) {
    return (r = _toPropertyKey4(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _toPropertyKey4(t) {
    var i = _toPrimitive4(t, "string");
    return "symbol" == _typeof4(i) ? i : i + "";
  }
  function _toPrimitive4(t, r) {
    if ("object" != _typeof4(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof4(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function parsePhoneNumberWithError(text, options, metadata) {
    return parse(text, _objectSpread2(_objectSpread2({}, options), {}, {
      v2: true
    }), metadata);
  }

  // node_modules/libphonenumber-js/es6/normalizeArguments.js
  function _typeof5(o) {
    "@babel/helpers - typeof";
    return _typeof5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof5(o);
  }
  function ownKeys3(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread3(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys3(Object(t), true).forEach(function(r2) {
        _defineProperty3(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys3(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty3(e, r, t) {
    return (r = _toPropertyKey5(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _toPropertyKey5(t) {
    var i = _toPrimitive5(t, "string");
    return "symbol" == _typeof5(i) ? i : i + "";
  }
  function _toPrimitive5(t, r) {
    if ("object" != _typeof5(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof5(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray5(r, e) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray5(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray5(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray5(r, a) : void 0;
    }
  }
  function _arrayLikeToArray5(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r2) {
        o = true, n = r2;
      } finally {
        try {
          if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function normalizeArguments(args) {
    var _Array$prototype$slic = Array.prototype.slice.call(args), _Array$prototype$slic2 = _slicedToArray(_Array$prototype$slic, 4), arg_1 = _Array$prototype$slic2[0], arg_2 = _Array$prototype$slic2[1], arg_3 = _Array$prototype$slic2[2], arg_4 = _Array$prototype$slic2[3];
    var text;
    var options;
    var metadata;
    if (typeof arg_1 === "string") {
      text = arg_1;
    } else throw new TypeError("A text for parsing must be a string.");
    if (!arg_2 || typeof arg_2 === "string") {
      if (arg_4) {
        options = arg_3;
        metadata = arg_4;
      } else {
        options = void 0;
        metadata = arg_3;
      }
      if (arg_2) {
        options = _objectSpread3({
          defaultCountry: arg_2
        }, options);
      }
    } else if (isObject(arg_2)) {
      if (arg_3) {
        options = arg_2;
        metadata = arg_3;
      } else {
        metadata = arg_2;
      }
    } else throw new Error("Invalid second argument: ".concat(arg_2));
    return {
      text,
      options,
      metadata
    };
  }

  // node_modules/libphonenumber-js/es6/parsePhoneNumberWithError.js
  function parsePhoneNumberWithError2() {
    var _normalizeArguments = normalizeArguments(arguments), text = _normalizeArguments.text, options = _normalizeArguments.options, metadata = _normalizeArguments.metadata;
    return parsePhoneNumberWithError(text, options, metadata);
  }

  // src/engine.js
  var MAX_INPUT = 256;
  var MAX_DIGITS = 24;
  var TYPES = ["FIXED_LINE", "MOBILE", "FIXED_LINE_OR_MOBILE", "TOLL_FREE", "PREMIUM_RATE", "SHARED_COST", "VOIP", "PERSONAL_NUMBER", "PAGER", "UAN", "VOICEMAIL"];
  var DIGIT_ZEROS = [48, 1632, 1776, 1984, 2406, 2534, 2662, 2790, 2918, 3046, 3174, 3302, 3430, 3558, 3664, 3792, 3872, 4160, 4240, 6112, 6160, 6470, 6608, 6784, 6800, 6992, 7088, 7232, 7248, 42528, 43216, 43264, 43472, 43504, 43600, 44016, 65296, 66720, 68912, 68928, 69734, 69872, 69942, 70096, 70384, 70736, 70864, 71248, 71360, 71376, 71386, 71472, 71904, 72016, 72688, 72784, 73040, 73120, 73184, 73552, 90416, 92768, 92864, 93008, 93552, 118e3, 120782, 120792, 120802, 120812, 120822, 123200, 123632, 124144, 124401, 125264, 130032];
  var SCRIPT = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : "";
  var version = "0.2.0";
  var google = "v9.0.41";
  var meta = null;
  var loading = null;
  function ready() {
    return meta !== null;
  }
  function setMeta(json) {
    if (!json || !json.countries || !json.country_calling_codes) {
      throw new Error("REDZ.Phone: not a metadata file");
    }
    if (json.google !== google) {
      throw new Error(`REDZ.Phone ${version} needs metadata ${google}, got ${json.google}`);
    }
    meta = json;
  }
  function load(url) {
    if (meta) {
      return Promise.resolve();
    }
    if (!loading) {
      const src = url || new URL(`meta/${google}.json`, SCRIPT || location.href).href;
      loading = fetch(src).then((res) => {
        if (!res.ok) {
          throw new Error(`REDZ.Phone: ${src} answered HTTP ${res.status}`);
        }
        return res.json().catch(() => {
          throw new Error(`REDZ.Phone: ${src} is not a metadata file`);
        });
      }).then(setMeta).catch((e) => {
        loading = null;
        throw e;
      });
    }
    return loading;
  }
  function needMeta() {
    if (!meta) {
      throw new Error("REDZ.Phone: metadata is not loaded, call REDZ.Phone.load() first");
    }
  }
  function countries() {
    needMeta();
    const out = {};
    Object.keys(meta.countries).sort().forEach((iso) => {
      out[iso] = meta.countries[iso][0];
    });
    return out;
  }
  function example(country) {
    var _a;
    needMeta();
    country = String(country != null ? country : "").trim().toUpperCase();
    const nsn = isSupportedCountry(country, meta) ? (_a = meta.examples) == null ? void 0 : _a[country] : "";
    if (!nsn) {
      return "";
    }
    try {
      return parsePhoneNumberWithError2(nsn, { defaultCountry: country, extract: false }, meta).formatNational();
    } catch (e) {
      return "";
    }
  }
  function codeOf(digits) {
    var _a;
    needMeta();
    for (let n = 1; n <= 3 && n <= digits.length; n++) {
      const code = digits.slice(0, n);
      if (meta.country_calling_codes[code] || ((_a = meta.nonGeographic) == null ? void 0 : _a[code])) {
        return code;
      }
    }
    return "";
  }
  function regionsOf(code) {
    var _a;
    needMeta();
    return (_a = meta.country_calling_codes[code]) != null ? _a : [];
  }
  function normalize(input) {
    let plus = false;
    let digits = "";
    for (const ch of String(input != null ? input : "")) {
      const cp = ch.codePointAt(0);
      if (cp === 43 || cp === 65291) {
        plus = plus || digits === "";
        continue;
      }
      for (const zero of DIGIT_ZEROS) {
        if (cp >= zero && cp <= zero + 9) {
          digits += String(cp - zero);
          break;
        }
      }
    }
    return (plus ? "+" : "") + digits;
  }
  function parse2(input, country, options) {
    var _a;
    needMeta();
    input = String(input != null ? input : "");
    if (input.length > MAX_INPUT * 2 || [...input].length > MAX_INPUT) {
      return fail("too_long");
    }
    let s = normalize(input);
    const digits = s.replace("+", "");
    if (digits === "") {
      return fail("empty");
    }
    if (digits.length > MAX_DIGITS) {
      return fail("too_long");
    }
    country = String(country != null ? country : "").trim().toUpperCase();
    if (!isSupportedCountry(country, meta)) {
      country = "";
    }
    const wanted = [].concat((_a = options == null ? void 0 : options.types) != null ? _a : []).map((t) => String(t).toUpperCase());
    const types = TYPES.filter((t) => wanted.includes(t));
    if (s.startsWith("+0")) {
      s = digits;
    }
    if (s.startsWith("00")) {
      const asPlus = evaluate("+" + s.slice(2), "", types);
      if (country === "") {
        return asPlus;
      }
      const asDialled = evaluate(s, country, types);
      return rank(asDialled) > rank(asPlus) ? asDialled : asPlus;
    }
    if (!s.startsWith("+") && country === "") {
      return fail("no_country");
    }
    return evaluate(s, country, types);
  }
  function evaluate(s, country, types) {
    if (s.replace("+", "").length < 2) {
      return fail("too_short");
    }
    let number;
    try {
      number = parsePhoneNumberWithError2(s, { defaultCountry: country || void 0, extract: false }, meta);
    } catch (e) {
      if (!(e instanceof ParseError)) {
        throw e;
      }
      return fail(["TOO_SHORT", "NOT_A_NUMBER"].includes(e.message) ? "too_short" : e.message === "TOO_LONG" ? "too_long" : "invalid");
    }
    if (number.isValid()) {
      let type = number.getType();
      if (type === "FIXED_LINE_OR_MOBILE" && !new Metadata(meta).selectNumberingPlan(number.country).type("MOBILE")) {
        type = "FIXED_LINE";
      }
      const result2 = describe(number, country, type);
      if (types.length && !typeAccepted(type, types)) {
        return { ...result2, ok: false, error: "wrong_type" };
      }
      return result2;
    }
    const plan = new Metadata(meta);
    plan.selectNumberingPlan(number.countryCallingCode);
    const reasons = types.length ? types.map((t) => checkNumberLengthForType(number.nationalNumber, t, void 0, plan)) : [checkNumberLengthForType(number.nationalNumber, void 0, void 0, plan)];
    if (reasons.includes("IS_POSSIBLE")) {
      return { ...describe(number, country, null), warning: "unallocated" };
    }
    const short = reasons.every((r) => r === "TOO_SHORT");
    const long = reasons.every((r) => r === "TOO_LONG");
    return fail(short ? "too_short" : long ? "too_long" : "invalid");
  }
  function describe(number, country, type) {
    var _a, _b, _c;
    const code = number.countryCallingCode;
    let region;
    if (type) {
      region = (_a = number.country) != null ? _a : null;
    } else {
      const regions = (_b = meta.country_calling_codes[code]) != null ? _b : [];
      region = regions.includes(country) ? country : (_c = regions[0]) != null ? _c : null;
    }
    return {
      ok: true,
      error: null,
      warning: null,
      e164: number.number,
      country: region === "001" ? null : region,
      code,
      type,
      international: number.formatInternational()
    };
  }
  function fail(error) {
    return { ok: false, error, warning: null, e164: null, country: null, code: null, type: null, international: null };
  }
  function typeAccepted(type, types) {
    return types.includes(type) || type === "FIXED_LINE_OR_MOBILE" && (types.includes("MOBILE") || types.includes("FIXED_LINE"));
  }
  function rank(result2) {
    if (result2.ok) {
      return result2.warning === null ? 3 : 2;
    }
    return result2.error === "wrong_type" ? 1 : 0;
  }

  // src/field.js
  var FLAGS = "AC AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TA TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW XX".split(" ");
  var NONE = "XX";
  var TEXTS = {
    country: "Country",
    choose: "Choose a country",
    search: "Country or code",
    countries: "Countries",
    nothing: "Nothing found",
    ok: "{number} · {country}",
    example: "Example: {example}",
    empty: "Enter a phone number",
    no_country: "Choose a country or start the number with +",
    too_short: "Too short for {country}.",
    too_long: "Too long for {country}.",
    invalid: "Not a valid number for {country}.",
    bad_code: "Check the country code.",
    wrong_type: "Enter a mobile number.",
    unallocated: "This number looks unusual for {country}. Please check it.",
    confirm: "The number is correct",
    methods: "How should we contact you?",
    method: "Choose how we should contact you",
    call: "Call",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    line: "LINE"
  };
  var ICONS = {
    call: [16, "M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"],
    whatsapp: [24, "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"],
    telegram: [24, "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"],
    line: [24, "M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"]
  };
  var SAVED = ["dir", "autocomplete", "inputmode", "placeholder", "aria-describedby", "aria-invalid"];
  var fields = /* @__PURE__ */ new WeakMap();
  var byLanguage = /* @__PURE__ */ new Map();
  var serial = 0;
  function field(input, options = {}) {
    var _a, _b, _c, _d, _e, _f;
    if (fields.has(input)) {
      return fields.get(input);
    }
    const o = { country: "auto", popular: [], types: ["MOBILE"], methods: [], method: "", methodRequired: false, lang: "", texts: {}, list: "float", hidden: {}, placeholder: true, meta: void 0, ...options };
    const t = { ...TEXTS, ...o.texts };
    const id = `rzp${++serial}`;
    const lang = o.lang || ((_a = input.closest("[lang]")) == null ? void 0 : _a.lang) || navigator.language || "en";
    const methods = [].concat(o.methods || []).filter((m) => ICONS[m]);
    const nameOf = namer(lang);
    const samples = {};
    const sampleOf = (iso) => {
      var _a2;
      return (_a2 = samples[iso]) != null ? _a2 : samples[iso] = example(iso);
    };
    const st = {
      country: pickable(o.country === "auto" ? browserCountry() : o.country),
      method: methods.includes(o.method) ? o.method : "",
      confirmed: "",
      revealed: false,
      off: false,
      result: null,
      valid: false,
      note: "",
      open: false,
      items: null,
      visible: [],
      active: -1
    };
    let codes = {};
    const saved = Object.fromEntries(SAVED.map((a) => [a, input.getAttribute(a)]));
    const savedPad = [input.style.paddingLeft, input.style.paddingRight];
    const cs = getComputedStyle(input);
    const pad = [parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), parseFloat(cs.paddingRight) + parseFloat(cs.borderRightWidth)].map((v) => v || 0);
    const root = el("div", o.list === "inline" ? "rzp rzp-inline" : "rzp");
    const line = el("div", "rzp-line");
    const button = el("button", "rzp-country", { type: "button", "aria-haspopup": "listbox", "aria-expanded": "false", "aria-controls": `${id}-list` });
    const flag = el("span", "rzp-flag", { "aria-hidden": "true" });
    const dial = el("span", "rzp-code", { dir: "ltr" });
    button.append(flag, dial, el("span", "rzp-caret", { "aria-hidden": "true" }));
    const panel = el("div", "rzp-list", { id: `${id}-list`, hidden: "" });
    const search = el("input", "rzp-search", { type: "text", role: "combobox", "aria-expanded": "true", "aria-autocomplete": "list", "aria-controls": `${id}-options`, "aria-label": t.search, placeholder: t.search, autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
    const listbox = el("ul", "rzp-options", { id: `${id}-options`, role: "listbox", "aria-label": t.countries });
    const empty = el("div", "rzp-empty", { hidden: "" }, t.nothing);
    panel.append(search, listbox, empty);
    const note = el("div", "rzp-note", { id: `${id}-note`, "aria-live": "polite" });
    const confirm = el("label", "rzp-confirm");
    const tick = el("input", "", { type: "checkbox" });
    confirm.append(tick, el("span", "", {}, t.confirm));
    input.before(root);
    line.append(button, input);
    root.append(line, panel, note);
    const radios = methods.map((m) => {
      const b = el("button", `rzp-method rzp-method-${m}`, { type: "button", role: "radio", "aria-checked": "false", tabindex: "-1" });
      b.dataset.method = m;
      b.append(icon(m), el("span", "", {}, t[m]));
      return b;
    });
    const group = el("div", "rzp-radios", { role: "radiogroup" });
    if (radios.length) {
      const box = el("div", "rzp-methods");
      if (t.methods) {
        box.append(el("div", "rzp-methods-label", { id: `${id}-methods` }, t.methods));
        group.setAttribute("aria-labelledby", `${id}-methods`);
      }
      group.append(...radios);
      box.append(group);
      root.append(box);
    }
    const hidden = {};
    for (const key of ["e164", "country", "method"]) {
      if ((_b = o.hidden) == null ? void 0 : _b[key]) {
        hidden[key] = el("input", "", { type: "hidden", name: o.hidden[key] });
        root.append(hidden[key]);
      }
    }
    input.dir = (_c = saved.dir) != null ? _c : "ltr";
    input.autocomplete = (_d = saved.autocomplete) != null ? _d : "tel";
    input.inputMode = (_e = saved.inputmode) != null ? _e : "tel";
    input.setAttribute("aria-describedby", [saved["aria-describedby"], note.id].filter(Boolean).join(" "));
    const host = (_f = input.parentElement) == null ? void 0 : _f.closest("label");
    const hostFor = host && !host.htmlFor ? input.id ? "" : `${id}-input` : null;
    if (hostFor !== null) {
      input.id || (input.id = hostFor);
      host.htmlFor = input.id;
    }
    function repad() {
      const rtl = getComputedStyle(root).direction === "rtl";
      const side = rtl ? 1 : 0;
      [input.style.paddingLeft, input.style.paddingRight] = savedPad;
      if (st.off) {
        return;
      }
      button.style.paddingLeft = button.style.paddingRight = "";
      button.style[rtl ? "paddingRight" : "paddingLeft"] = `${pad[side]}px`;
      input.style[rtl ? "paddingRight" : "paddingLeft"] = `${button.offsetWidth}px`;
    }
    const resize = typeof ResizeObserver === "function" ? new ResizeObserver(repad) : null;
    resize == null ? void 0 : resize.observe(button);
    function shown() {
      var _a2;
      const r = st.result;
      const n = normalize(input.value);
      const code = (r == null ? void 0 : r.code) || (ready() && /^\+[1-9]/.test(n) ? codeOf(n.slice(1)) : "");
      if (code && !regionsOf(code).length) {
        return { iso: NONE, code };
      }
      return { iso: st.country || NONE, code: st.country ? (_a2 = codes[st.country]) != null ? _a2 : "" : "" };
    }
    function place() {
      const s = shown();
      return s.iso !== NONE ? nameOf(s.iso) : s.code ? `+${s.code}` : "";
    }
    function follow() {
      const r = st.result;
      if (r.country) {
        st.country = r.country;
        return;
      }
      const n = normalize(input.value);
      const code = r.code || (/^\+[1-9]/.test(n) ? codeOf(n.slice(1)) : "");
      const regions = code ? regionsOf(code) : [];
      if (regions.length && !regions.includes(st.country)) {
        st.country = regions[0];
      }
    }
    function badCode() {
      const n = normalize(input.value).replace(/^00/, "+");
      return /^\+[1-9]\d{2}/.test(n) && codeOf(n.slice(1)) === "";
    }
    function methodOk() {
      return !o.methodRequired || !methods.length || st.method !== "";
    }
    function assess() {
      var _a2;
      if (st.off || !ready()) {
        return { valid: !input.required || input.value.trim() !== "", kind: "", show: false };
      }
      const r = st.result;
      if (r.error === "empty") {
        return { valid: !input.required, kind: "error", show: st.revealed && input.required, nodes: fill(t.empty) };
      }
      if (r.ok && r.warning) {
        return { valid: st.confirmed === r.e164 && methodOk(), kind: "warn", show: true, nodes: fill(t.unallocated, { country: place() }), confirm: true };
      }
      if (r.ok) {
        return !methodOk() && st.revealed ? { valid: false, kind: "error", show: true, nodes: fill(t.method) } : { valid: methodOk(), kind: "ok", show: true, nodes: r.country ? fill(t.ok, { number: r.international, country: place() }) : fill("{number}", { number: r.international }) };
      }
      const key = r.error === "invalid" && badCode() ? "bad_code" : r.error;
      const nodes = fill((_a2 = t[key]) != null ? _a2 : t.invalid, { country: place() });
      const sample = ["too_short", "too_long", "invalid", "wrong_type"].includes(key) ? sampleOf(st.country) : "";
      if (sample) {
        nodes.append(" ", fill(t.example, { example: sample }));
      }
      return { valid: false, kind: "error", show: st.revealed || key === "too_long", nodes };
    }
    function render() {
      var _a2;
      root.classList.toggle("is-off", st.off);
      const s = shown();
      paint(flag, s.iso);
      dial.textContent = s.code ? `+${s.code}` : "";
      button.setAttribute("aria-label", s.iso !== NONE ? `${t.country}: ${nameOf(s.iso)}${s.code ? ` +${s.code}` : ""}` : s.code ? `+${s.code}` : t.choose);
      if (o.placeholder && ready() && !st.off) {
        input.placeholder = sampleOf(st.country);
      }
      const a = assess();
      st.valid = a.valid;
      const text = a.nodes ? a.nodes.textContent : "";
      const key = a.show ? `${a.kind}|${text}|${st.confirmed}` : "";
      if (key !== st.note) {
        st.note = key;
        note.className = a.show ? `rzp-note is-${a.kind}` : "rzp-note";
        note.replaceChildren(...a.show ? [a.nodes] : []);
        if (a.show && a.confirm) {
          tick.checked = st.confirmed !== "" && st.confirmed === st.result.e164;
          note.append(confirm);
        }
      }
      if (a.show && a.kind === "error") {
        input.setAttribute("aria-invalid", "true");
      } else if (saved["aria-invalid"] === null) {
        input.removeAttribute("aria-invalid");
      }
      input.setCustomValidity(a.valid ? "" : text || t.empty);
      radios.forEach((b, i) => {
        const on2 = b.dataset.method === st.method;
        b.setAttribute("aria-checked", String(on2));
        b.tabIndex = on2 || st.method === "" && i === 0 ? 0 : -1;
      });
      group.classList.toggle("is-missing", !methodOk() && st.revealed);
      if (hidden.e164) {
        hidden.e164.value = ((_a2 = st.result) == null ? void 0 : _a2.ok) ? st.result.e164 : "";
      }
      if (hidden.country) {
        hidden.country.value = st.country;
      }
      if (hidden.method) {
        hidden.method.value = st.method;
      }
      repad();
    }
    function evaluate2() {
      if (!st.off && ready()) {
        st.result = parse2(input.value, st.country, { types: o.types });
        follow();
      }
    }
    function update() {
      evaluate2();
      render();
      input.dispatchEvent(new CustomEvent("redzphone", { bubbles: true, detail: state() }));
    }
    function state() {
      var _a2;
      return { valid: st.valid, input: input.value, country: st.country, method: st.method, confirmed: ((_a2 = st.result) == null ? void 0 : _a2.warning) ? st.confirmed === st.result.e164 : false, result: st.result };
    }
    function build() {
      var _a2;
      const all = Object.keys(codes).map((iso) => ({ iso, code: codes[iso], name: nameOf(iso) }));
      const collate = collator(lang);
      all.sort((a, b) => collate(a.name, b.name));
      const make = (c, prefix) => {
        const li = el("li", "", { role: "option", id: `${id}-${prefix}${c.iso}`, "aria-selected": "false" });
        const f = el("span", "rzp-flag", { "aria-hidden": "true" });
        paint(f, c.iso);
        li.dataset.iso = c.iso;
        li.append(f, el("span", "rzp-name", {}, c.name), el("span", "rzp-dial", { dir: "ltr" }, `+${c.code}`));
        return { ...c, li };
      };
      const popular = [].concat(o.popular || []).map((iso) => String(iso).toUpperCase()).filter((iso, i, list) => codes[iso] && list.indexOf(iso) === i);
      st.items = { popular: popular.map((iso) => make(all.find((c) => c.iso === iso), "p")), all: all.map((c) => make(c, "o")) };
      (_a2 = st.items.popular[st.items.popular.length - 1]) == null ? void 0 : _a2.li.classList.add("rzp-last");
    }
    function keys(c) {
      var _a2;
      (_a2 = c.keys) != null ? _a2 : c.keys = [c.name, english(c.iso), endonym(c.iso)].filter(Boolean).map(fold);
      return c.keys;
    }
    function score(c, q, digits) {
      if (digits !== "") {
        return c.code.startsWith(digits) ? c.code === digits ? 0 : 1 : 9;
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
      var _a2;
      const q = fold(search.value.trim());
      let list;
      if (q === "") {
        list = [...st.items.popular, ...st.items.all];
      } else {
        const digits = /^\+?\d+$/.test(q) ? q.replace("+", "") : "";
        list = st.items.all.map((c) => ({ c, s: score(c, q, digits) })).filter((x) => x.s < 9).sort((a, b) => a.s - b.s).map((x) => x.c);
      }
      list.forEach((c) => c.li.setAttribute("aria-selected", String(c.iso === st.country)));
      (_a2 = st.visible[st.active]) == null ? void 0 : _a2.li.classList.remove("is-active");
      listbox.replaceChildren(...list.map((c) => c.li));
      empty.hidden = list.length > 0;
      st.visible = list;
      st.active = -1;
      activate(q === "" ? Math.max(0, list.findIndex((c) => c.iso === st.country)) : 0, q === "");
    }
    function activate(i, center = false) {
      var _a2;
      (_a2 = st.visible[st.active]) == null ? void 0 : _a2.li.classList.remove("is-active");
      const c = st.visible[i];
      st.active = c ? i : -1;
      if (!c) {
        search.removeAttribute("aria-activedescendant");
        return;
      }
      c.li.classList.add("is-active");
      search.setAttribute("aria-activedescendant", c.li.id);
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
    function open(seed = "") {
      if (st.off || st.open) {
        return;
      }
      if (!ready()) {
        load(o.meta).then(() => open(seed), () => {
        });
        return;
      }
      if (!st.items) {
        build();
      }
      st.open = true;
      panel.hidden = false;
      root.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      search.value = seed;
      filter();
      search.focus();
      document.addEventListener("pointerdown", outside, true);
    }
    function close(focusButton) {
      if (!st.open) {
        return;
      }
      st.open = false;
      panel.hidden = true;
      root.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", outside, true);
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
      const code = /^\+[1-9]/.test(n) ? codeOf(n.slice(1)) : "";
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
    listen(input, "input", update);
    listen(input, "change", update);
    listen(input, "blur", () => {
      if (input.value.trim() !== "" && !st.revealed) {
        st.revealed = true;
        render();
      }
    });
    listen(input, "invalid", () => {
      st.revealed = true;
      render();
    });
    if (input.form) {
      listen(input.form, "reset", () => setTimeout(update));
    }
    listen(button, "click", () => st.open ? close(true) : open());
    listen(button, "keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        open();
      } else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        open(e.key);
      }
    });
    listen(search, "input", filter);
    listen(search, "keydown", (e) => {
      const step = { ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8 }[e.key];
      if (step) {
        e.preventDefault();
        activate(Math.min(st.visible.length - 1, Math.max(0, st.active + step)));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (st.visible[st.active]) {
          choose(st.visible[st.active].iso);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        close(true);
      }
    });
    listen(panel, "mousedown", (e) => {
      if (e.target !== search) {
        e.preventDefault();
      }
    });
    listen(panel, "focusout", (e) => {
      if (!panel.contains(e.relatedTarget) && e.relatedTarget !== button) {
        close(false);
      }
    });
    listen(listbox, "click", (e) => {
      const li = e.target.closest("li");
      if (li) {
        choose(li.dataset.iso);
      }
    });
    listen(listbox, "mousemove", (e) => {
      const i = st.visible.findIndex((c) => c.li === e.target.closest("li"));
      if (i >= 0 && i !== st.active) {
        activate(i);
      }
    });
    listen(tick, "change", () => {
      st.confirmed = tick.checked ? st.result.e164 : "";
      update();
    });
    listen(group, "click", (e) => {
      const b = e.target.closest(".rzp-method");
      if (b) {
        pickMethod(b);
      }
    });
    listen(group, "keydown", (e) => {
      const rtl = getComputedStyle(root).direction === "rtl";
      const step = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
      const at = radios.indexOf(document.activeElement);
      if (step && at >= 0) {
        e.preventDefault();
        pickMethod(radios[(at + step + radios.length) % radios.length]);
      }
    });
    function destroy() {
      close(false);
      on.forEach(([target, type, fn, opts]) => target.removeEventListener(type, fn, opts));
      resize == null ? void 0 : resize.disconnect();
      root.before(input);
      root.remove();
      SAVED.forEach((a) => saved[a] === null ? input.removeAttribute(a) : input.setAttribute(a, saved[a]));
      [input.style.paddingLeft, input.style.paddingRight] = savedPad;
      if (hostFor !== null) {
        host.removeAttribute("for");
        if (hostFor !== "") {
          input.removeAttribute("id");
        }
      }
      input.setCustomValidity("");
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
        input.value = value != null ? value : "";
        if (country !== void 0) {
          st.country = pickable(country);
        }
        update();
        return api;
      },
      destroy
    };
    fields.set(input, api);
    if (ready()) {
      codes = countries();
    }
    evaluate2();
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
        input.dispatchEvent(new CustomEvent("redzphone", { bubbles: true, detail: state() }));
      }
      console.warn(e.message);
    });
    return api;
  }
  function el(tag, className, attrs = {}, text = "") {
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
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.append(path);
    return svg;
  }
  function fill(text, values = {}) {
    const out = document.createDocumentFragment();
    String(text).split(/(\{\w+\})/).forEach((part) => {
      var _a;
      const key = (_a = /^\{(\w+)\}$/.exec(part)) == null ? void 0 : _a[1];
      if (key === void 0 || !(key in values)) {
        if (part) {
          out.append(part);
        }
      } else {
        out.append(key === "country" ? values[key] : el("span", "", { dir: "ltr" }, values[key]));
      }
    });
    return out;
  }
  function paint(node, iso) {
    const i = FLAGS.includes(iso) ? FLAGS.indexOf(iso) : FLAGS.length - 1;
    node.style.backgroundPosition = `0 ${i / (FLAGS.length - 1) * 100}%`;
  }
  function pickable(iso) {
    const up = String(iso != null ? iso : "").trim().toUpperCase();
    return up !== NONE && FLAGS.includes(up) ? up : "";
  }
  function browserCountry() {
    var _a;
    const tag = navigator.languages && navigator.languages[0] || navigator.language || "";
    try {
      return pickable(new Intl.Locale(tag).region);
    } catch (e) {
      return pickable((_a = /-([a-z]{2})(?:-|$)/i.exec(tag)) == null ? void 0 : _a[1]);
    }
  }
  function displayNames(lang) {
    if (!byLanguage.has(lang)) {
      let names = null;
      try {
        names = new Intl.DisplayNames([lang, "en"], { type: "region" });
      } catch (e) {
        try {
          names = new Intl.DisplayNames(["en"], { type: "region" });
        } catch (e2) {
          names = null;
        }
      }
      byLanguage.set(lang, names);
    }
    return byLanguage.get(lang);
  }
  function namer(lang) {
    const names = displayNames(lang);
    return (iso) => (names == null ? void 0 : names.of(iso)) || iso;
  }
  function english(iso) {
    var _a;
    return ((_a = displayNames("en")) == null ? void 0 : _a.of(iso)) || "";
  }
  function endonym(iso) {
    var _a;
    try {
      return ((_a = displayNames(new Intl.Locale(`und-${iso}`).maximize().language)) == null ? void 0 : _a.of(iso)) || "";
    } catch (e) {
      return "";
    }
  }
  function collator(lang) {
    try {
      return new Intl.Collator(lang).compare;
    } catch (e) {
      return (a, b) => a < b ? -1 : a > b ? 1 : 0;
    }
  }
  function fold(s) {
    return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  }
  function dropDigits(raw, n) {
    const chars = [...raw];
    let i = 0;
    for (; i < chars.length && n > 0; i++) {
      if (/\d/.test(normalize(chars[i]))) {
        n--;
      }
    }
    return chars.slice(i).join("").replace(/^[\s\-.)\]/]+/, "");
  }
  return __toCommonJS(redzphone_exports);
})();
