import { StringOperations, NumericOperations } from './operations'
import { EvaluationTree, EvaluationTreeLeaf, Item, Facets, Facet } from './types'
import { generateEvaluationTree, traverseEvaluationTree } from './helpers'
import { setIn, getIn } from './utilities'
import { FACET_SUGGESTION_REGEX } from './constants'

export default class Lapidary {
  items: Item[]
  facets: Facets
  options: { [key: string]: any }
  setInTransientContext: (keyPath: string[], value: any) => void
  getInTransientContext: (keyPath: string[]) => any
  setInPermanentContext: (keyPath: string[], value: any) => void
  getInPermanentContext: (keyPath: string[]) => any
  parseQuery: (query: string) => Item[]
  getSuggestions: (query: string, position: number) => string[]
  defaultFacet: (i: Item, s: string | number) => boolean
  defaultSuggestion: string
  getCurrentIndex: () => number
  getFacet: (key: keyof Facets) => Facet
  // clearPermanentContext: () => void
  private permanentContext: { [key: string]: any }
  private transientContext: { [key: string]: any }
  private clearTransientContext: () => void
  private currentIndex: number
  private setCurrentIndex: (i: number) => void

  constructor(
    items: Item[],
    facets: Facets,
    options: {
      defaultFacet: (i: Item, s: string | number) => boolean
      aliases: { [key: string]: keyof Facets }
      defaultSuggestion: string
    }
  ) {
    this.items = items
    this.facets = facets
    this.permanentContext = {}
    this.transientContext = {}
    this.defaultFacet = options.defaultFacet
    this.defaultSuggestion = options.defaultSuggestion
    this.currentIndex = 0
    this.options = options
    this.getFacet = (key: keyof Facets) => this.facets[key]
    this.setCurrentIndex = (i: number) => (this.currentIndex = i)
    this.getCurrentIndex = () => this.currentIndex
    this.clearTransientContext = () => (this.transientContext = {})
    // this.clearPermanentContext = () => (this.permanentContext = {})
    this.setInTransientContext = (keyPath: string[], value: any) =>
      setIn(this.transientContext, keyPath, value)
    this.getInTransientContext = (keyPath: string[]) => getIn(this.transientContext, keyPath)
    this.setInPermanentContext = (keyPath: string[], value: any) =>
      setIn(this.permanentContext, keyPath, value)
    this.getInPermanentContext = (keyPath: string[]) => getIn(this.permanentContext, keyPath)

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
    this.getSuggestions = (query: string, position: number): string[] => {
      const facetMatch = query.match(FACET_SUGGESTION_REGEX)
      if (facetMatch) {
        const matchingFacets = Object.keys(this.facets).filter(k => k.startsWith(facetMatch[0]))
        return matchingFacets
      }
      return []
    }
  }
}

export { StringOperations, NumericOperations, Lapidary }
