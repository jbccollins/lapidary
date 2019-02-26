"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BETWEEN = 'between';
exports.BETWEEN = BETWEEN;
var CASE_INSENSITIVE_EQUAL = '=';
exports.CASE_INSENSITIVE_EQUAL = CASE_INSENSITIVE_EQUAL;
var CASE_INSENSITIVE_NOT_EQUAL = '!=';
exports.CASE_INSENSITIVE_NOT_EQUAL = CASE_INSENSITIVE_NOT_EQUAL;
var CASE_SENSITIVE_EQUAL = '==';
exports.CASE_SENSITIVE_EQUAL = CASE_SENSITIVE_EQUAL;
var CASE_SENSITIVE_NOT_EQUAL = '!==';
exports.CASE_SENSITIVE_NOT_EQUAL = CASE_SENSITIVE_NOT_EQUAL;
var CONTAINS = 'contains';
exports.CONTAINS = CONTAINS;
var EQUAL = '=';
exports.EQUAL = EQUAL;
var GREATER_THAN = '>';
exports.GREATER_THAN = GREATER_THAN;
var GREATER_THAN_OR_EQUAL = '>=';
exports.GREATER_THAN_OR_EQUAL = GREATER_THAN_OR_EQUAL;
var IMPLICIT = '';
exports.IMPLICIT = IMPLICIT;
var INCLUSIVE_BETWEEN = 'inbetween';
exports.INCLUSIVE_BETWEEN = INCLUSIVE_BETWEEN;
var IS = 'is';
exports.IS = IS;
var LESS_THAN = '<';
exports.LESS_THAN = LESS_THAN;
var LESS_THAN_OR_EQUAL = '<=';
exports.LESS_THAN_OR_EQUAL = LESS_THAN_OR_EQUAL;
var NOT_EQUAL = '!=';
exports.NOT_EQUAL = NOT_EQUAL;
var NUMERIC = 'numeric';
exports.NUMERIC = NUMERIC;
var STRING = 'string';
exports.STRING = STRING;
var COMPARISONS = [
    NOT_EQUAL,
    LESS_THAN,
    GREATER_THAN,
    LESS_THAN_OR_EQUAL,
    GREATER_THAN_OR_EQUAL,
    EQUAL,
    CONTAINS
];
exports.COMPARISONS = COMPARISONS;
var AND = 'AND';
exports.AND = AND;
var OR = 'OR';
exports.OR = OR;
var NOT = 'NOT';
exports.NOT = NOT;
var XOR = 'XOR';
exports.XOR = XOR;
/* SUGGESTION REGEX */
var FACET_SUGGESTION_REGEX = /\w+/gi;
exports.FACET_SUGGESTION_REGEX = FACET_SUGGESTION_REGEX;
//# sourceMappingURL=constants.js.map