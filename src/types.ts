import Lapidary from './lapidary'
/*** TYPES ***/
export type FilterEvaluator = (item: Item, l: Lapidary) => boolean
export type FilterGenerator = (facetKey: keyof Facets, expression: any) => FilterEvaluator
export type Facets = {
  [key: string]: Facet
}
export type Facet = {
  operations: OperationMapping
  objectKey: string
}

export type EvaluationTree = {
  left: EvaluationTree | EvaluationTreeLeaf | null
  right: EvaluationTree | EvaluationTreeLeaf | null
  invert: boolean // Should the bool returned by the RHS of the evaluation tree be negated?
  joinType: string | null
}

export type EvaluationTreeLeaf = {
  filterEvaluator: FilterEvaluator
  raw: string // Unused by lapidary directly. But useful for parsing out the evaluation tree to generate SQL.
}

export type Item = { [k in keyof Facets]: any }

export type ImplicitComparator = (expression: string, item: Item, l: Lapidary) => boolean

/*** END TYPES ***/

/*** INTERFACES ***/
export interface OperationMapping {
  [key: string]: FilterGenerator
}
/*** END INTERFACES ***/
