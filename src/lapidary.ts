import { StringOperations, NumericOperations } from './operations'
import { EvaluationTree, EvaluationTreeLeaf, Item, Facets, Facet } from './types'
import { generateEvaluationTree, traverseEvaluationTree } from './helpers'
import { setIn, getIn } from './utilities'

export default class Lapidary {
  items: Item[]
  facets: Facets
  context: { [key: string]: any }
  options: { [key: string]: any }
  transientContext: { [key: string]: any }
  setInTransientContext: (keyPath: string[], value: any) => void
  getInTransientContext: (keyPath: string[]) => any
  parseQuery: (query: string) => Item[]
  defaultFacet: (i: Item, s: string | number) => boolean
  getCurrentIndex: () => number
  getFacet: (key: keyof Facets) => Facet
  private clearTransientContext: () => void
  private currentIndex: number
  private setCurrentIndex: (i: number) => void

  constructor(
    items: Item[],
    facets: Facets,
    options: {
      defaultFacet: (i: Item, s: string | number) => boolean
      aliases: { [key: string]: keyof Facets }
    }
  ) {
    this.items = items
    this.facets = facets
    this.context = {}
    this.transientContext = {}
    this.defaultFacet = options.defaultFacet
    this.currentIndex = 0
    this.options = options
    this.getFacet = (key: keyof Facets) => this.facets[key]
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
