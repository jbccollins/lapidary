import { FilterEvaluator, FilterGenerator, Facet, Item, Facets, OperationMapping } from './types'

import Lapidary from './lapidary'
import {
  EQUAL,
  NOT_EQUAL,
  COMPARISONS,
  STRING,
  NUMERIC,
  GREATER_THAN_OR_EQUAL,
  LESS_THAN_OR_EQUAL,
  CONTAINS
} from './constants'

// String quotes when doing string operations
const cleanString = (s: string) => s.replace(/['"]+/g, '')
// Interpret string value as number
const cleanNumber = (n: string, facetKey: string | number) => {
  const num = Number(n)
  if (isNaN(num)) {
    throw new Error(`Expected a numeric value for ${facetKey}. Received "${n}"`)
  }
  return num
}

const StringEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] === cleanString(expression)
  }
}

const StringContainsEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey].indexOf(cleanString(expression)) >= 0
  }
}

const NegativeStringEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] !== cleanString(expression)
  }
}

const NumericEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] === cleanNumber(expression, facetKey)
  }
}

const NegativeNumericEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] !== cleanNumber(expression, facetKey)
  }
}

const NumericLTEEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] <= cleanNumber(expression, facetKey)
  }
}

const NumericGTEEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] >= cleanNumber(expression, facetKey)
  }
}

const StringOperations: OperationMapping = {
  [EQUAL]: StringEqualityEvaluationGenerator,
  [NOT_EQUAL]: NegativeStringEqualityEvaluationGenerator,
  [CONTAINS]: StringContainsEvaluationGenerator
}

const NumericOperations: OperationMapping = {
  [EQUAL]: NumericEqualityEvaluationGenerator,
  [NOT_EQUAL]: NegativeNumericEqualityEvaluationGenerator,
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
