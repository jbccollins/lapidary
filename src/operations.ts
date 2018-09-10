import { FilterEvaluator, FilterGenerator, Facet, Item, Facets, OperationMapping } from './types'

import Lapidary from './lapidary'
import {
  EQUAL,
  NOT_EQUAL,
  COMPARISONS,
  STRING,
  NUMERIC,
  GREATER_THAN_OR_EQUAL,
  LESS_THAN_OR_EQUAL
} from './constants'

const StringEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  // String quotes when doing string operations
  const value = expression.replace(/['"]+/g, '')
  return (item: Item, l: Lapidary) => {
    return item[facetKey] === value
  }
}

const NegativeStringEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  // String quotes when doing string operations
  const value = expression.replace(/['"]+/g, '')
  return (item: Item, l: Lapidary) => {
    return item[facetKey] !== value
  }
}

const NumericEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  // Interpret string as number
  const value = Number(expression)
  if (isNaN(value)) {
    throw new Error(`Expected a numeric value for ${facetKey}. Received "${expression}"`)
  }
  return (item: Item, l: Lapidary) => {
    return item[facetKey] === value
  }
}

const NumericLTEEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  // Interpret string as number
  const value = Number(expression)
  if (isNaN(value)) {
    throw new Error(`Expected a numeric value for ${facetKey}. Received "${expression}"`)
  }
  return (item: Item, l: Lapidary) => {
    return item[facetKey] <= value
  }
}

const NumericGTEEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  // Interpret string as number
  const value = Number(expression)
  if (isNaN(value)) {
    throw new Error(`Expected a numeric value for ${facetKey}. Received "${expression}"`)
  }
  return (item: Item, l: Lapidary) => {
    return item[facetKey] >= value
  }
}

const StringOperations: OperationMapping = {
  [EQUAL]: StringEqualityEvaluationGenerator,
  [NOT_EQUAL]: NegativeStringEqualityEvaluationGenerator
}

const NumericOperations: OperationMapping = {
  [EQUAL]: NumericEqualityEvaluationGenerator,
  [GREATER_THAN_OR_EQUAL]: NumericGTEEvaluationGenerator,
  [LESS_THAN_OR_EQUAL]: NumericLTEEvaluationGenerator
}

export {
  StringEqualityEvaluationGenerator,
  NumericEqualityEvaluationGenerator,
  StringOperations,
  NumericOperations
}

//export const DefaultFilterGenerator:FilterGenerator = StringOperations[EQUAL];
