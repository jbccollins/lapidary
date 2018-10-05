import { StringOperations, NumericOperations } from './operations'
import { EvaluationTree, EvaluationTreeLeaf, Item, Facets } from './types'
import { generateEvaluationTree, traverseEvaluationTree } from './helpers'
import { setIn, getIn } from './utilities'

export default class Lapidary {
  items: Item[]
  facets: Facets
  context: { [key: string]: any }
  transientContext: { [key: string]: any }
  setInTransientContext: (keyPath: string[], value: any) => void
  getInTransientContext: (keyPath: string[]) => any
  parseQuery: (query: string) => Item[]
  defaultFacet: (i: Item, s: string | number) => boolean
  getCurrentIndex: () => number
  private clearTransientContext: () => void
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
    this.clearTransientContext = () => (this.transientContext = {})
    this.setInTransientContext = (keyPath: string[], value: any) =>
      setIn(this.transientContext, keyPath, value)
    this.getInTransientContext = (keyPath: string[]) => getIn(this.transientContext, keyPath)
    this.parseQuery = (query: string): Item[] => {
      // Reset transient context before each run
      this.clearTransientContext()
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
      return result
    }
  }
}

export { StringOperations, NumericOperations, Lapidary }
