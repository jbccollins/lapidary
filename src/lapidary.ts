import { StringOperations, NumericOperations, AbstractOperations } from './operations'
import { EvaluationTree, EvaluationTreeLeaf, Item, Facets } from './types'
import { generateEvaluationTree, traverseEvaluationTree } from './helpers'

export default class Lapidary {
  items: Item[]
  facets: Facets
  context: {}
  parseQuery: (query: string) => Item[]
  defaultFacet: (i: Item, s: string | number) => boolean

  constructor(
    items: Item[],
    facets: Facets,
    context: {},
    defaultFacet: (i: Item, s: string | number) => boolean
  ) {
    this.items = items
    this.facets = facets
    this.context = context
    this.defaultFacet = defaultFacet
    this.parseQuery = (query: string): Item[] => {
      if (query.trim() === '') {
        return this.items
      }
      const evalutionTree: EvaluationTree | EvaluationTreeLeaf = generateEvaluationTree(
        query,
        this.facets
      )
      const result: Item[] = this.items.filter(item =>
        traverseEvaluationTree(item, evalutionTree, this)
      )
      return result
    }
  }
}

export { StringOperations, NumericOperations, AbstractOperations, Lapidary }
