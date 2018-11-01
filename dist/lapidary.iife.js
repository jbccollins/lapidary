var lapidary = (function (exports) {
  'use strict';

  var BETWEEN = 'between';
  var CASE_INSENSITIVE_EQUAL = '=';
  var CASE_INSENSITIVE_NOT_EQUAL = '!=';
  var CASE_SENSITIVE_EQUAL = '==';
  var CASE_SENSITIVE_NOT_EQUAL = '!==';
  var CONTAINS = 'contains';
  var EQUAL = '=';
  var GREATER_THAN = '>';
  var GREATER_THAN_OR_EQUAL = '>=';
  var INCLUSIVE_BETWEEN = 'inbetween';
  var LESS_THAN = '<';
  var LESS_THAN_OR_EQUAL = '<=';
  var NOT_EQUAL = '!=';
  var AND = 'AND';
  var OR = 'OR';
  var NOT = 'NOT';
  /* SUGGESTION REGEX */
  var FACET_SUGGESTION_REGEX = /\w+/gi;

  var _a, _b;
  // String quotes when doing string operations
  var cleanString = function (s, facetKey) {
      if (typeof s === 'undefined' || s === '') {
          throw new Error("Expected a value for " + facetKey);
      }
      return s.replace(/['"]+/g, '');
  };
  // Interpret string value as number
  var cleanNumber = function (n, facetKey) {
      var num = Number(n);
      if (isNaN(num)) {
          throw new Error("Expected a numeric value for " + facetKey + ". Received \"" + n + "\"");
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
  var StringOperations = (_a = {},
      _a[CASE_SENSITIVE_EQUAL] = StringEqualityEvaluationGenerator,
      _a[CASE_SENSITIVE_NOT_EQUAL] = StringNegativeEqualityEvaluationGenerator,
      _a[CASE_INSENSITIVE_EQUAL] = StringCaseInsensetiveEqualityEvaluationGenerator,
      _a[CASE_INSENSITIVE_NOT_EQUAL] = StringNegativeCaseInsensitiveEqualityEvaluationGenerator,
      _a[CONTAINS] = StringContainsEvaluationGenerator,
      _a);
  var NumericOperations = (_b = {},
      _b[EQUAL] = NumericEqualityEvaluationGenerator,
      _b[NOT_EQUAL] = NumericNegativeEqualityEvaluationGenerator,
      _b[GREATER_THAN] = NumericGTEvaluationGenerator,
      _b[LESS_THAN] = NumericLTEvaluationGenerator,
      _b[GREATER_THAN_OR_EQUAL] = NumericGTEEvaluationGenerator,
      _b[LESS_THAN_OR_EQUAL] = NumericLTEEvaluationGenerator,
      _b[BETWEEN] = NumericBetweenEvaluationGenerator,
      _b[INCLUSIVE_BETWEEN] = NumericInclusiveBetweenEvaluationGenerator,
      _b);

  // https://gist.github.com/scottrippey/1349099
  var splitBalanced = function (input, 
  /* istanbul ignore next */
  split, open, close, toggle, escape) {
      if (split === void 0) { 
      /* istanbul ignore next */
      split = ' '; }
      if (open === void 0) { open = ''; }
      if (close === void 0) { close = ''; }
      if (toggle === void 0) { toggle = ''; }
      if (escape === void 0) { escape = ''; }
      // Build the pattern from params with defaults:
      var pattern = '([\\s\\S]*?)(e)?(?:(o)|(c)|(t)|(sp)|$)'
          .replace('sp', split)
          .replace('o', open || '[\\(\\{\\[]')
          .replace('c', close || '[\\)\\}\\]]')
          .replace('t', toggle || '[\'"]')
          .replace('e', escape || '[\\\\]');
      var r = new RegExp(pattern, 'gi');
      var stack = [];
      var buffer = [];
      var results = [];
      // Clone the input string
      var clonedInput = '' + input;
      clonedInput.replace(r, function ($0, $1, $e, $o, $c, $t, $s, i) {
          if ($e) {
              // Escape
              buffer.push($1, $s || $o || $c || $t);
              return $0; // Does nothing. Just satisfies Typescript's insatiable thirst for a string return;
          }
          else if ($o) {
              // Open
              stack.push($o);
          }
          else if ($c) {
              // Close
              stack.pop();
          }
          else if ($t) {
              // Toggle
              if (stack[stack.length - 1] !== $t)
                  stack.push($t);
              else
                  stack.pop();
          }
          else {
              // Split (if no stack) or EOF
              if ($s ? !stack.length : !$1) {
                  buffer.push($1);
                  results.push(buffer.join(''));
                  buffer = [];
                  return $0; // Does nothing. Just satisfies Typescript's insatiable thirst for a string return;
              }
          }
          buffer.push($0);
          return $0; // Does nothing. Just satisfies Typescript's insatiable thirst for a string return;
      });
      return results;
  };
  var setIn = function (target, keyPath, value) {
      if (keyPath.length === 0) {
          throw new Error('No keys provided in "keyPath" for "setIn"');
      }
      var i = 0;
      while (i < keyPath.length - 1) {
          target = target[keyPath[i]];
          i++;
      }
      target[keyPath[i]] = value;
  };
  var getIn = function (target, keyPath) {
      if (keyPath.length === 0) {
          return target;
      }
      if (keyPath.length === 1) {
          return target[keyPath[0]];
      }
      return getIn(target[keyPath[0]], keyPath.slice(1));
  };
  // https://codereview.stackexchange.com/questions/45991/balanced-parentheses
  var parenthesesAreBalanced = function (s) {
      var parentheses = '()';
      var stack = [];
      var i = 0;
      var character = null;
      var bracePosition = 0;
      for (i = 0; i < s.length; i++) {
          character = s[i];
          bracePosition = parentheses.indexOf(character);
          if (bracePosition === -1) {
              continue;
          }
          if (bracePosition % 2 === 0) {
              stack.push(bracePosition + 1); // push next expected brace position
          }
          else {
              if (stack.length === 0 || stack.pop() !== bracePosition) {
                  return false;
              }
          }
      }
      return stack.length === 0;
  };

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
      if (!parenthesesAreBalanced(strippedInput)) {
          strippedInput = input;
      }
      var split = splitBalanced(strippedInput);
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
          return DefaultEvaluationGenerator(facetKey, parameters);
      }
      if (parameters && facetKey) {
          if (!facets[facetKey]) {
              throw new Error("Invalid facet key: \"" + facetKey + "\". Unable to interpret \"" + filterString + "\"");
          }
      }
      /*// If the regex is ever switched back to /.+:.*:.+/gi this will probably need to be re-enabled
      if (!facets[facetKey]) {
        throw new Error(`Invalid facet ${facetKey}. Unable to interpret "${filterString}"`)
      }
      */
      var filterGenerator = facets[facetKey].operations[operation];
      if (!filterGenerator) {
          throw new Error("Invalid operation " + operation + " for " + facetKey);
      }
      return filterGenerator(facetKey, parameters);
  };
  var traverseEvaluationTree = function (item, evalutionTree, l) {
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
          if (tree.joinType === AND) {
              return (traverseEvaluationTree(item, tree.left, l) &&
                  !tree.invert === traverseEvaluationTree(item, tree.right, l));
          }
          return (traverseEvaluationTree(item, tree.left, l) ||
              !tree.invert === traverseEvaluationTree(item, tree.right, l));
      }
      return traverseEvaluationTree(item, tree.left, l);
  };
  var recursivelyGenerateEvaluators = function (split, facets) {
      if (Array.isArray(split)) {
          if (split.length < 1) {
              throw new Error('Invalid syntax');
          }
          // Special case for when the query string starts with NOT. e.g. "NOT (is::duplicate)"
          if (split[0] === NOT && split[1]) {
              return {
                  left: { filterEvaluator: alwaysTrueFilterEvaluator, raw: '' },
                  joinType: AND,
                  invert: true,
                  right: recursivelyGenerateEvaluators(split[1], facets)
              };
          }
          // Case like (foo:=:bar) which will become ["foo:=:bar"]
          if (split.length === 1) {
              return {
                  left: recursivelyGenerateEvaluators(split[0], facets),
                  joinType: null,
                  invert: false,
                  right: null
              };
          }
          // Explicit join type
          if (split[1] === OR || split[1] === AND) {
              var inverted_1 = split[2] && split[2] === NOT;
              return {
                  left: recursivelyGenerateEvaluators(split[0], facets),
                  joinType: split[1],
                  invert: inverted_1,
                  right: recursivelyGenerateEvaluators(split.slice(inverted_1 ? 3 : 2), facets)
              };
          }
          // Implicit "AND" join type
          var inverted = split[1] && split[1] === NOT;
          return {
              left: recursivelyGenerateEvaluators(split[0], facets),
              joinType: AND,
              invert: inverted,
              right: recursivelyGenerateEvaluators(split.slice(inverted ? 2 : 1), facets)
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
      var evaluationTree = recursivelyGenerateEvaluators(split, facets);
      return evaluationTree;
  };

  var Lapidary = /** @class */ (function () {
      function Lapidary(items, facets, options) {
          var _this = this;
          this.items = items;
          this.facets = facets;
          this.permanentContext = {};
          this.transientContext = {};
          this.defaultFacet = options.defaultFacet;
          this.defaultSuggestion = options.defaultSuggestion;
          this.currentIndex = 0;
          this.options = options;
          this.getFacet = function (key) { return _this.facets[key]; };
          this.setCurrentIndex = function (i) { return (_this.currentIndex = i); };
          this.getCurrentIndex = function () { return _this.currentIndex; };
          this.clearTransientContext = function () { return (_this.transientContext = {}); };
          // this.clearPermanentContext = () => (this.permanentContext = {})
          this.setInTransientContext = function (keyPath, value) {
              return setIn(_this.transientContext, keyPath, value);
          };
          this.getInTransientContext = function (keyPath) { return getIn(_this.transientContext, keyPath); };
          this.setInPermanentContext = function (keyPath, value) {
              return setIn(_this.permanentContext, keyPath, value);
          };
          this.getInPermanentContext = function (keyPath) { return getIn(_this.permanentContext, keyPath); };
          this.parseQuery = function (query) {
              // Reset transient context before each run
              _this.clearTransientContext();
              if (query.trim() === '') {
                  return _this.items;
              }
              var evalutionTree = generateEvaluationTree(query, _this.facets);
              var result = _this.items.filter(function (item, index) {
                  _this.setCurrentIndex(index);
                  return traverseEvaluationTree(item, evalutionTree, _this);
              });
              return result;
          };
          /*
            CASES:
            1) [                ]
            2) [hei             ]
            3) [height:         ]
            4) [height:>        ]
            5) [height:>=       ]
            6) [height:>=:      ]
            7) [height:>=:6     ]
            ----------
            8) [height:>=:6_    ]
            9)
      
          */
          this.getSuggestions = function (query, position) {
              var facetMatch = query.match(FACET_SUGGESTION_REGEX);
              if (facetMatch) {
                  var matchingFacets = Object.keys(_this.facets).filter(function (k) { return k.startsWith(facetMatch[0]); });
                  return matchingFacets;
              }
              return [];
          };
      }
      return Lapidary;
  }());

  exports.default = Lapidary;
  exports.StringOperations = StringOperations;
  exports.NumericOperations = NumericOperations;
  exports.Lapidary = Lapidary;

  return exports;

}({}));
//# sourceMappingURL=lapidary.iife.js.map
