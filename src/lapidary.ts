// https://gist.github.com/scottrippey/1349099/cd6b993f0cc8595fd231594576d7c4b0a6d611d2
// Consider abstract facets like "in:cart", "is:duplicate"
// countof:>=20 // Are there at least 20 of this thing in the list of items?
// in:cart would require passing a scoped context object to Lapidary

/*

    Consider using one global and one transient context associated with each Lapidary() instead of using context as a parameter to FilterEvaluators
*/

/*
const inventory = {
    items: [
        {
            id: 2397jg,
            name: War and Peace,
            sellerId: 99slsls9897,
            price: 25.45,
        }
    ]
};
const cart = {
    items: [
        {
            id: 2397jg,
            shippingFee: 2.00,
        }
    ],
    status: 'in progress',
};
const favorites = [2397jg];
Lapidary ({
    context: {
        cart,
        favorites,
    },
    items: inventory.items,
    facets: {
        name: {
            type: string,
            evaluator: Lapidary.fuzzyStringEvaluator,
            priority: 1,
        },
        price: {
            type: number,
            evaluator: Lapidary.numericEvaluator,
            priority: 2,
        },
        is:duplicate {
            aliases: [is:dupe],
            type: custom,
            priority: 3,
            evaluator: (item, self, evaluatorContext) => {
                if (evaluatorContext[item.id]) {
                    return ({
                        value: true,
                        evaluatorContext,
                    })
                } else if(self.context.items.contains(item)) {
                    return ({
                        value: true,
                        evaluatorContext: {
                            ...evaluatorContext,
                            [item.id]: true
                        }
                    })
                } else {
                    return ({
                        value: false
                        evaluatorcontext
                    })
                }
            }
            comparator: Lapidary.booleanComparator,
        }
    }
})
*/

// Recursively generate nested arrays of filter generation functions based on parentheses
// BuildFilterGenerators(queryString) {
//     const queryStringsArr = splitQuery(queryString);
//     if (len(queryStringsArr) > 1) {
//         return queryStringsArr.map(qs => generate(qs))
//     }
//     const FilterGenerator = FilterGenerator(queryStringsArr[0]);
//     return [FilterGenerator];
// }

import { EQUAL, COMPARISONS, STRING, NUMERIC } from './constants'

/*** TYPES ***/
export type FilterEvaluator = (item: Item, l: Lapidary, evaluatorContext: any) => boolean
export type FilterGenerator = (facetKey: keyof Facets, expression: any) => FilterEvaluator
export type Facets = {
  [key: string]: Facet
}
export type Facet = {
  //type: string, // TODO: Make this enum from [STRING, NUMERIC],
  operations: OperationMapping
  //evaluationGenerator: FilterGenerator,
  //evaluator: FilterEvaluator,
}
export type Item = {
  [k in keyof Facets]: string
  //[k: string]: string
}

/*** END TYPES ***/

/*** INTERFACES ***/
export interface OperationMapping {
  [key: string]: FilterGenerator
}
/*** END INTERFACES ***/

export const StringEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  // String quotes when doing string operations
  const value = expression.replace(/['"]+/g, '')
  return (item: Item, l: Lapidary, {}) => {
    return item[facetKey] === value
  }
}

export const StringOperations: OperationMapping = {
  [EQUAL]: StringEqualityEvaluationGenerator
}

export default class Lapidary {
  items: Item[]
  facets: Facets
  context: {}

  constructor(items: Item[], facets: Facets, context: {}) {
    this.items = items
    this.facets = facets
    this.context = context
  }

  parseQuery(query: string): Item[] {
    // https://stackoverflow.com/a/16261693
    const searchTerms = query.match(/(?:[^\s"]+|"[^"]*")+/g) || []
    const filters: FilterEvaluator[] = []
    searchTerms.forEach(s => {
      COMPARISONS.forEach(c => {
        const [key, expression] = s.split(c)
        const facetKey = key as keyof Facets

        if (expression && facetKey) {
          if (!this.facets[facetKey]) {
            console.warn('Invalid Facet Key', facetKey)
            throw new Error(`Invalid facet key: ${facetKey}`)
            return
          }
          const filterGenerator: FilterGenerator = this.facets[facetKey].operations[c]
          filters.push(filterGenerator(facetKey, expression))
        }
      })
    })

    const result = this.items.filter(item => {
      // TODO: Does .every short circuit?
      return filters.every(f => f(item, this, {}))
    })

    console.log('result', result)
    return result
  }
}
