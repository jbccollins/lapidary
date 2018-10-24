"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var utilities_1 = require("./utilities");
var operations_1 = require("./operations");
var EXPRESSION_REGEX = /.+:.*:/gi;
// const EXPRESSION_REGEX = /.+:.*:.+/gi
var isInterpretable = function (str) {
    /* Currently unused because of recursivelySplitString
    if (str.startsWith('(') && str.endsWith(')')) {
      return true
    }
    if (str === AND || str === OR) {
      return true
    }
    */
    if (str.match(EXPRESSION_REGEX)) {
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
var predicateToFilterEvaluator = function (predicate, facets) {
    var _a = predicate.split(':'), key = _a[0], operation = _a[1], expression = _a[2];
    var facetKey = key;
    // Handle raw queries that don't match lapidary syntax
    if (!isInterpretable(predicate)) {
        return operations_1.DefaultEvaluationGenerator(facetKey, expression);
    }
    if (expression && facetKey) {
        if (!facets[facetKey]) {
            throw new Error("Invalid facet key: \"" + facetKey + "\". Unable to interpret \"" + predicate + "\"");
        }
    }
    /*// If the regex is ever switched back to /.+:.*:.+/gi this will probably need to be re-enabled
    if (!facets[facetKey]) {
      throw new Error(`Invalid facet ${facetKey}. Unable to interpret "${predicate}"`)
    }
    */
    var filterGenerator = facets[facetKey].operations[operation];
    if (!filterGenerator) {
        throw new Error("Invalid operation " + operation + " for " + facetKey);
    }
    return filterGenerator(facetKey, expression);
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
    // TODO: This is kinda messy.... And I'm not even sure the last case is necessary
    if (tree.left && tree.right) {
        if (tree.joinType === constants_1.AND) {
            return (exports.traverseEvaluationTree(item, tree.left, l) && exports.traverseEvaluationTree(item, tree.right, l));
        }
        return exports.traverseEvaluationTree(item, tree.left, l) || exports.traverseEvaluationTree(item, tree.right, l);
    }
    return exports.traverseEvaluationTree(item, tree.left, l);
};
exports.recursivelyGenerateEvaluators = function (split, facets) {
    if (Array.isArray(split)) {
        if (split.length < 1) {
            throw new Error('Invalid syntax');
        }
        // Case like (foo:=:bar) which will become ["foo:=bar"]
        if (split.length === 1) {
            return {
                left: exports.recursivelyGenerateEvaluators(split[0], facets),
                joinType: null,
                right: null
            };
        }
        // Explicit join type
        if (split[1] === constants_1.OR || split[1] === constants_1.AND) {
            return {
                left: exports.recursivelyGenerateEvaluators(split[0], facets),
                joinType: split[1],
                right: exports.recursivelyGenerateEvaluators(split.slice(2), facets)
            };
        }
        // Implicit "AND" join type
        return {
            left: exports.recursivelyGenerateEvaluators(split[0], facets),
            joinType: constants_1.AND,
            right: exports.recursivelyGenerateEvaluators(split.slice(1), facets)
        };
    }
    // String as EvaluationLeaf
    return {
        filterEvaluator: predicateToFilterEvaluator(split, facets)
    };
};
var generateEvaluationTree = function (input, facets) {
    // Replace instances of multiple spaces with a single space
    var squashedInput = input.replace(/\s\s+/g, ' ').trim();
    //  console.log('>>>>>>>>>>>> HELLO')
    var split = recursivelySplitString(squashedInput, 0);
    var evaluationTree = exports.recursivelyGenerateEvaluators(split, facets);
    return evaluationTree;
};
exports.generateEvaluationTree = generateEvaluationTree;
//# sourceMappingURL=helpers.js.map