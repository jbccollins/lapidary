// Consider abstract facets like "in:cart", "is:duplicate"
// countof:>=20 // Are there at least 20 of this thing in the list of items?
// in:cart would require passing a scoped context object to Lapidary
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

const LESS_THAN = ':<'
const GREATER_THAN = ':>'
const LESS_THAN_OR_EQUAL = ':<='
const GREATHER_THAN_OR_EQUAL = ':>='
const EQUAL = ':='
export const COMPARISONS = [
  LESS_THAN,
  GREATER_THAN,
  LESS_THAN_OR_EQUAL,
  GREATHER_THAN_OR_EQUAL,
  EQUAL
]

type QueryEvaluator = (item: Item, l: Lapidary, evaluatorContext: any) => boolean
type FilterGenerator = (facetKey: keyof Item, expectedFacetValue: string) => QueryEvaluator

interface OperationMapping {
  [key: string]: FilterGenerator
}

const StringOperations: OperationMapping = {
  // Strip double quotes when evaluating strings
  [EQUAL]: (facetKey: keyof Item, expectedFacetValue: string) => (
    item: Item,
    l: Lapidary,
    evaluatorContext: any
  ) => item[facetKey] === expectedFacetValue.replace(/['"]+/g, '')
}

export const JOINS = [' :and: ', ' :or: ']

export interface Item {
  name: string
}

export default class Lapidary {
  items: Item[]
  facets: {}
  context: {}

  constructor(items: Item[], facets: {}, context: {}) {
    this.items = items
    this.facets = facets
    this.context = context
  }

  parseQuery(query: string): Item[] {
    // https://stackoverflow.com/a/16261693
    const searchTerms = query.match(/(?:[^\s"]+|"[^"]*")+/g) || []
    const filters: QueryEvaluator[] = []
    searchTerms.forEach(s => {
      COMPARISONS.forEach(c => {
        const [key, expectedFacetValue] = s.split(c)
        const facetKey = key as keyof Item
        if (facetKey && expectedFacetValue) {
          filters.push(StringOperations[c](facetKey, expectedFacetValue))
        }
      })
    })

    const result = this.items.filter(item => {
      return filters.every(f => f(item, this, {}))
    })
    console.log(result)
    return result
  }
}
