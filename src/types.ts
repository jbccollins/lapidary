import Lapidary from './lapidary'
/*** TYPES ***/
export type FilterEvaluator = (item: Item, l: Lapidary) => boolean
export type FilterGenerator = (facetKey: keyof Facets, expression: any) => FilterEvaluator
export type Facets = {
  [key: string]: Facet
}
export type Facet = {
  operations: OperationMapping
}

export type EvaluationTree = {
  left: EvaluationTree | EvaluationTreeLeaf | null
  right: EvaluationTree | EvaluationTreeLeaf | null
  joinType: string | null
}

export type EvaluationTreeLeaf = {
  filterEvaluator: FilterEvaluator
}

export type Item = { [k in keyof Facets]: any }

export type AbstractComparator = (expression: string, item: Item, l: Lapidary) => boolean

/*** END TYPES ***/

/*** INTERFACES ***/
export interface OperationMapping {
  [key: string]: FilterGenerator
}
/*** END INTERFACES ***/
