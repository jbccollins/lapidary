"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = require("./operations");
exports.StringOperations = operations_1.StringOperations;
exports.NumericOperations = operations_1.NumericOperations;
var helpers_1 = require("./helpers");
var utilities_1 = require("./utilities");
// import { FACET_SUGGESTION_REGEX } from './constants'
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
            return utilities_1.setIn(_this.transientContext, keyPath, value);
        };
        this.getInTransientContext = function (keyPath) { return utilities_1.getIn(_this.transientContext, keyPath); };
        this.setInPermanentContext = function (keyPath, value) {
            return utilities_1.setIn(_this.permanentContext, keyPath, value);
        };
        this.getInPermanentContext = function (keyPath) { return utilities_1.getIn(_this.permanentContext, keyPath); };
        this.parseQuery = function (query) {
            // Reset transient context before each run
            _this.clearTransientContext();
            if (query.trim() === '') {
                return _this.items;
            }
            var evalutionTree = helpers_1.generateEvaluationTree(query, _this.facets);
            var result = _this.items.filter(function (item, index) {
                _this.setCurrentIndex(index);
                return helpers_1.traverseEvaluationTree(item, evalutionTree, _this);
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
        // this.getSuggestions = (query: string, position: number): string[] => {
        //   const facetMatch = query.match(FACET_SUGGESTION_REGEX);
        //   if (facetMatch) {
        //     console.log(facetMatch);
        //   }
        //   return [];
        // }
    }
    return Lapidary;
}());
exports.Lapidary = Lapidary;
exports.default = Lapidary;
//# sourceMappingURL=lapidary.js.map