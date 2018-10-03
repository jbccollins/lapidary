import { StringOperations, NumericOperations, AbstractOperations } from './operations'
import { EvaluationTree, EvaluationTreeLeaf, Item, Facets } from './types'
import { generateEvaluationTree, traverseEvaluationTree } from './helpers'

export default class Lapidary {
  items: Item[]
  facets: Facets
  context: {}
  transientContext: object
  setTransientContext: (c: object) => void
  parseQuery: (query: string) => Item[]
  defaultFacet: (i: Item, s: string | number) => boolean
  public getCurrentIndex: () => number
  private currentIndex: number
  private setCurrentIndex: (i: number) => void

  constructor(
    items: Item[],
    facets: Facets,
    context: {},
    defaultFacet: (i: Item, s: string | number) => boolean
  ) {
    this.items = items
    this.facets = facets
    this.context = context
    this.transientContext = {}
    this.defaultFacet = defaultFacet
    this.currentIndex = 0
    this.setCurrentIndex = (i: number) => (this.currentIndex = i)
    this.getCurrentIndex = () => this.currentIndex
    this.setTransientContext = (newContext: object) => (this.transientContext = newContext)
    this.parseQuery = (query: string): Item[] => {
      if (query.trim() === '') {
        return this.items
      }
      const evalutionTree: EvaluationTree | EvaluationTreeLeaf = generateEvaluationTree(
        query,
        this.facets
      )
      const result: Item[] = this.items.filter((item, index) => {
        this.setCurrentIndex(index)
        return traverseEvaluationTree(item, evalutionTree, this)
      })
      // Reset transient context after each run
      this.setTransientContext({})
      return result
    }
  }
}

export { StringOperations, NumericOperations, AbstractOperations, Lapidary }
