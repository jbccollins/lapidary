"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a, _b;
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
//# sourceMappingURL=operations.js.map