"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a, _b, _c;
var date_fns_1 = require("date-fns");
var constants_1 = require("./constants");
var checkValue = function (v, facetKey) {
    if (typeof v === 'undefined' || v === '') {
        throw new Error("Expected a value for \"" + facetKey + "\"");
    }
};
// String quotes when doing string operations
var cleanString = function (s, facetKey) {
    checkValue(s, facetKey);
    return s.replace(/['"]+/g, '');
};
// Interpret string value as number
var cleanNumber = function (n, facetKey) {
    checkValue(n, facetKey);
    var num = Number(n);
    if (isNaN(num)) {
        throw new Error("Expected a numeric value for \"" + facetKey + "\". Received \"" + n + "\"");
    }
    return num;
};
var StringEqualityEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey] === cleanString(expression, facetKey);
    };
};
var StringCaseInsensetiveEqualityEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey].toLowerCase() === cleanString(expression, facetKey).toLowerCase();
    };
};
var StringContainsEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey].indexOf(cleanString(expression, facetKey)) >= 0;
    };
};
var StringNegativeEqualityEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey] !== cleanString(expression, facetKey);
    };
};
var StringNegativeCaseInsensitiveEqualityEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey].toLowerCase() !== cleanString(expression, facetKey).toLowerCase();
    };
};
var NumericEqualityEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey] === cleanNumber(expression, facetKey);
    };
};
var NumericNegativeEqualityEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey] !== cleanNumber(expression, facetKey);
    };
};
var NumericLTEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey] < cleanNumber(expression, facetKey);
    };
};
var NumericLTEEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey] <= cleanNumber(expression, facetKey);
    };
};
var NumericGTEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey] > cleanNumber(expression, facetKey);
    };
};
var NumericGTEEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return item[objectKey] >= cleanNumber(expression, facetKey);
    };
};
var NumericBetweenEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        var _a = expression.split(','), lower = _a[0], upper = _a[1];
        return (item[objectKey] > cleanNumber(lower, facetKey) &&
            item[objectKey] < cleanNumber(upper, facetKey));
    };
};
var NumericInclusiveBetweenEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        var _a = expression.split(','), lower = _a[0], upper = _a[1];
        return (item[objectKey] >= cleanNumber(lower, facetKey) &&
            item[objectKey] <= cleanNumber(upper, facetKey));
    };
};
var DateEqualityEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return date_fns_1.isEqual(date_fns_1.parse(item[objectKey]), date_fns_1.parse(cleanString(expression, facetKey)));
    };
};
var DateNegativeEqualityEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return !date_fns_1.isEqual(date_fns_1.parse(item[objectKey]), date_fns_1.parse(cleanString(expression, facetKey)));
    };
};
var DateLTEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return date_fns_1.isBefore(date_fns_1.parse(item[objectKey]), date_fns_1.parse(cleanString(expression, facetKey)));
    };
};
var DateLTEEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        var date1 = date_fns_1.parse(item[objectKey]);
        var date2 = date_fns_1.parse(cleanString(expression, facetKey));
        return date_fns_1.isBefore(date1, date2) || date_fns_1.isEqual(date1, date2);
    };
};
var DateGTEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        return date_fns_1.isAfter(date_fns_1.parse(item[objectKey]), date_fns_1.parse(cleanString(expression, facetKey)));
    };
};
var DateGTEEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        var date1 = date_fns_1.parse(item[objectKey]);
        var date2 = date_fns_1.parse(cleanString(expression, facetKey));
        return date_fns_1.isAfter(date1, date2) || date_fns_1.isEqual(date1, date2);
    };
};
var DateBetweenEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        var _a = expression.split(','), lower = _a[0], upper = _a[1];
        var date = date_fns_1.parse(item[objectKey]);
        var lowerDate = date_fns_1.parse(cleanString(lower, facetKey));
        var upperDate = date_fns_1.parse(cleanString(upper, facetKey));
        return date_fns_1.isAfter(date, lowerDate) && date_fns_1.isBefore(date, upperDate);
    };
};
var DateInclusiveBetweenEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) {
        var objectKey = l.getFacet(facetKey).objectKey;
        var _a = expression.split(','), lower = _a[0], upper = _a[1];
        var date = date_fns_1.parse(item[objectKey]);
        var lowerDate = date_fns_1.parse(cleanString(lower, facetKey));
        var upperDate = date_fns_1.parse(cleanString(upper, facetKey));
        return ((date_fns_1.isAfter(date, lowerDate) && date_fns_1.isBefore(date, upperDate)) ||
            date_fns_1.isEqual(date, lowerDate) ||
            date_fns_1.isEqual(date, upperDate));
    };
};
var DefaultEvaluationGenerator = function (facetKey, expression) {
    return function (item, l) { return l.defaultFacet(item, facetKey); };
};
exports.DefaultEvaluationGenerator = DefaultEvaluationGenerator;
var StringOperations = (_a = {},
    _a[constants_1.CASE_SENSITIVE_EQUAL] = StringEqualityEvaluationGenerator,
    _a[constants_1.CASE_SENSITIVE_NOT_EQUAL] = StringNegativeEqualityEvaluationGenerator,
    _a[constants_1.CASE_INSENSITIVE_EQUAL] = StringCaseInsensetiveEqualityEvaluationGenerator,
    _a[constants_1.CASE_INSENSITIVE_NOT_EQUAL] = StringNegativeCaseInsensitiveEqualityEvaluationGenerator,
    _a[constants_1.CONTAINS] = StringContainsEvaluationGenerator,
    _a);
exports.StringOperations = StringOperations;
var NumericOperations = (_b = {},
    _b[constants_1.EQUAL] = NumericEqualityEvaluationGenerator,
    _b[constants_1.NOT_EQUAL] = NumericNegativeEqualityEvaluationGenerator,
    _b[constants_1.GREATER_THAN] = NumericGTEvaluationGenerator,
    _b[constants_1.LESS_THAN] = NumericLTEvaluationGenerator,
    _b[constants_1.GREATER_THAN_OR_EQUAL] = NumericGTEEvaluationGenerator,
    _b[constants_1.LESS_THAN_OR_EQUAL] = NumericLTEEvaluationGenerator,
    _b[constants_1.BETWEEN] = NumericBetweenEvaluationGenerator,
    _b[constants_1.INCLUSIVE_BETWEEN] = NumericInclusiveBetweenEvaluationGenerator,
    _b);
exports.NumericOperations = NumericOperations;
var DateOperations = (_c = {},
    _c[constants_1.EQUAL] = DateEqualityEvaluationGenerator,
    _c[constants_1.NOT_EQUAL] = DateNegativeEqualityEvaluationGenerator,
    _c[constants_1.GREATER_THAN] = DateGTEvaluationGenerator,
    _c[constants_1.LESS_THAN] = DateLTEvaluationGenerator,
    _c[constants_1.GREATER_THAN_OR_EQUAL] = DateGTEEvaluationGenerator,
    _c[constants_1.LESS_THAN_OR_EQUAL] = DateLTEEvaluationGenerator,
    _c[constants_1.BETWEEN] = DateBetweenEvaluationGenerator,
    _c[constants_1.INCLUSIVE_BETWEEN] = DateInclusiveBetweenEvaluationGenerator,
    _c);
exports.DateOperations = DateOperations;
//# sourceMappingURL=operations.js.map