import { FilterEvaluator, FilterGenerator, Facet, Item, Facets, OperationMapping } from './types'

import Lapidary from './lapidary'
import { EQUAL, COMPARISONS, STRING, NUMERIC } from './constants'

export const StringEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  // String quotes when doing string operations
  const value = expression.replace(/['"]+/g, '')
  return (item: Item, l: Lapidary, {}) => {
    return item[facetKey] === value
  }
}

export const NumericEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  // Interpret string as number
  const value = Number(expression)
  if (isNaN(value)) {
    throw new Error(`Expected a numeric value for ${facetKey}. Received "${expression}"`)
  }
  return (item: Item, l: Lapidary, {}) => {
    return item[facetKey] === value
  }
}

export const StringOperations: OperationMapping = {
  [EQUAL]: StringEqualityEvaluationGenerator
}

export const NumericOperations: OperationMapping = {
  [EQUAL]: NumericEqualityEvaluationGenerator
}

//export const DefaultFilterGenerator:FilterGenerator = StringOperations[EQUAL];
