import { EQUAL, COMPARISONS, STRING, NUMERIC, AND, OR } from './constants'
import { FilterEvaluator, FilterGenerator, Item, Facets } from './types'
import { SplitBalanced, generateEvaluationTree, traverseEvaluationTree } from './helpers'

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
    const evalutionTree = generateEvaluationTree(query, this.facets)
    //console.log(searchTerms);
    searchTerms.forEach(s => {
      COMPARISONS.forEach(c => {
        const [key, expression] = s.split(c)
        const facetKey = key as keyof Facets

        if (expression && facetKey) {
          if (!this.facets[facetKey]) {
            throw new Error(`Invalid facet key: ${facetKey}`)
          }
          const filterGenerator: FilterGenerator = this.facets[facetKey].operations[c]
          filters.push(filterGenerator(facetKey, expression))
        }
      })
    })

    const result = this.items.filter(item => {
      return filters.every(f => f(item, this, {}))
    })

    console.log('result', result)
    return result
  }
}
