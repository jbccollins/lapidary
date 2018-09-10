import { StringOperations, NumericOperations } from './operations'
import { EvaluationTree, EvaluationTreeLeaf, Item, Facets } from './types'
import { generateEvaluationTree, traverseEvaluationTree } from './helpers'

const parseQuery = (query: string, l: Lapidary): Item[] => {
  if (query.trim() === '') {
    return l.items
  }
  const evalutionTree: EvaluationTree | EvaluationTreeLeaf = generateEvaluationTree(query, l.facets)
  const result: Item[] = l.items.filter(item => traverseEvaluationTree(item, evalutionTree, l))
  return result
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
}

export { parseQuery, StringOperations, NumericOperations, Lapidary }
