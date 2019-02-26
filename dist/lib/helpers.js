"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var utilities_1 = require("./utilities");
var operations_1 = require("./operations");
var FILTER_STRING_REGEX = /.+:.*:/gi;
// const FILTER_STRING_REGEX = /.+:.*:.+/gi
var alwaysTrueFilterEvaluator = function (item, l) { return true; };
var isInterpretable = function (str) {
    /* Currently unused because of recursivelySplitString
    if (str.startsWith('(') && str.endsWith(')')) {
      return true
    }
    if (str === AND || str === OR) {
      return true
    }
    */
    if (str.match(FILTER_STRING_REGEX)) {
        return true;
    }
    return false;
};
var stripParens = function (s) {
    if (s.startsWith('(') && s.endsWith(')')) {
        return s.slice(1, -1);
    }
    return s;
};
// Idk how to Type the return value for recursive functions
// This should ultimately return String[][]
var recursivelySplitString = function (input, depth) {
    var strippedInput = stripParens(input);
    // Must check for balanced parens. Blindly stripping based on the start and end characters is not safe.
    // e.g: (name:=:james) OR (name:=:jane) would horribly fail
    if (!utilities_1.parenthesesAreBalanced(strippedInput)) {
        strippedInput = input;
    }
    var split = utilities_1.splitBalanced(strippedInput);
    if (split.length === 0 || split.length === 1) {
        if (depth === 0) {
            // If no recursion is needed
            return [strippedInput];
        }
        return strippedInput;
    }
    return split.map(function (s) { return recursivelySplitString(s, depth + 1); });
};
var stringToFilterEvaluator = function (filterString, facets) {
    var _a = filterString.split(':'), key = _a[0], operation = _a[1], parameters = _a[2];
    var facetKey = key;
    // Handle raw queries that don't match lapidary syntax
    if (!isInterpretable(filterString)) {
        return operations_1.DefaultEvaluationGenerator(facetKey, parameters);
    }
    if (!facetKey || !facets[facetKey]) {
        throw new Error("Invalid facet key: \"" + facetKey + "\". Unable to interpret \"" + filterString + "\"");
    }
    /*// If the regex is ever switched back to /.+:.*:.+/gi this will probably need to be re-enabled
    if (!facets[facetKey]) {
      throw new Error(`Invalid facet ${facetKey}. Unable to interpret "${filterString}"`)
    }
    */
    var filterGenerator = facets[facetKey].operations[operation];
    if (!filterGenerator) {
        throw new Error("Invalid operation \"" + operation + "\" for \"" + facetKey + "\"");
    }
    return filterGenerator(facetKey, parameters);
};
exports.traverseEvaluationTree = function (item, evalutionTree, l) {
    if (!evalutionTree) {
        return false;
    }
    // TODO: I have no idea how to do typechecking on union types. Maybe refactor the EvaluationTree and EvaluationTreeLeaf to be the same type.
    if (evalutionTree.hasOwnProperty('filterEvaluator')) {
        return evalutionTree.filterEvaluator(item, l);
    }
    var tree = evalutionTree;
    switch (tree.joinType) {
        case constants_1.AND:
            return (exports.traverseEvaluationTree(item, tree.left, l) &&
                !tree.invert === exports.traverseEvaluationTree(item, tree.right, l));
        case constants_1.OR:
            return (exports.traverseEvaluationTree(item, tree.left, l) ||
                !tree.invert === exports.traverseEvaluationTree(item, tree.right, l));
        case constants_1.XOR:
            /* // from: http://www.howtocreate.co.uk/xor.html
              if( !foo != !bar ) {
                ...
              }
            */
            return (!exports.traverseEvaluationTree(item, tree.left, l) !=
                !(!tree.invert === exports.traverseEvaluationTree(item, tree.right, l)));
        default:
            throw new Error("Unrecognized join type \"" + tree.joinType + "\"");
    }
};
exports.recursivelyGenerateEvaluators = function (split, facets) {
    if (Array.isArray(split)) {
        if (split.length < 1) {
            throw new Error('Invalid syntax');
        }
        // Special case for when the query string starts with NOT. e.g. "NOT (is::duplicate)"
        // TODO: Is the boolean check for && split[1] really necessary? I don't think so...
        // TODO: This does not support leading "OR NOT" queries. Which I don't think are valid anyway given that
        // the alwaysTrueFilterEvaluator will cause them to always be true.
        // TODO: WTF does OR NOT do anyway??? test it!
        // "first:=:james OR NOT last:=:collins" is the inverse of "(NOT first:=:james) AND last:=:collins"
        if (split[0] === constants_1.NOT && split[1]) {
            return {
                left: { filterEvaluator: alwaysTrueFilterEvaluator, raw: 'TRUE' },
                joinType: constants_1.AND,
                invert: true,
                right: exports.recursivelyGenerateEvaluators(split.slice(1), facets)
            };
        }
        // Case like (foo:=:bar) which will become ["foo:=:bar"]
        if (split.length === 1) {
            return exports.recursivelyGenerateEvaluators(split[0], facets);
        }
        // Explicit join type
        if (split[1] === constants_1.OR || split[1] === constants_1.AND || split[1] === constants_1.XOR) {
            var inverted_1 = split[2] && split[2] === constants_1.NOT;
            return {
                left: exports.recursivelyGenerateEvaluators(split[0], facets),
                joinType: split[1],
                invert: inverted_1,
                right: exports.recursivelyGenerateEvaluators(split.slice(inverted_1 ? 3 : 2), facets)
            };
        }
        // Implicit "AND" join type
        var inverted = split[1] && split[1] === constants_1.NOT;
        return {
            left: exports.recursivelyGenerateEvaluators(split[0], facets),
            joinType: constants_1.AND,
            invert: inverted,
            right: exports.recursivelyGenerateEvaluators(split.slice(inverted ? 2 : 1), facets)
        };
    }
    // String as EvaluationLeaf
    return {
        filterEvaluator: stringToFilterEvaluator(split, facets),
        raw: split
    };
};
var generateEvaluationTree = function (input, facets) {
    // Replace instances of multiple spaces with a single space
    var squashedInput = input.replace(/\s\s+/g, ' ').trim();
    var split = recursivelySplitString(squashedInput, 0);
    var evaluationTree = exports.recursivelyGenerateEvaluators(split, facets);
    return evaluationTree;
};
exports.generateEvaluationTree = generateEvaluationTree;
//# sourceMappingURL=helpers.js.map