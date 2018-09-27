import { FilterEvaluator, FilterGenerator, Item, Facets, OperationMapping } from './types'

import Lapidary from './lapidary'
import {
  EQUAL,
  NOT_EQUAL,
  GREATER_THAN_OR_EQUAL,
  LESS_THAN_OR_EQUAL,
  LESS_THAN,
  GREATER_THAN,
  CONTAINS
} from './constants'

// String quotes when doing string operations
const cleanString = (s: string | undefined, facetKey: string | number) => {
  if (typeof s === 'undefined' || s === '') {
    throw new Error(`Expected a value for ${facetKey}`)
  }
  return s.replace(/['"]+/g, '')
}
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
    return item[facetKey] === cleanString(expression, facetKey)
  }
}

const StringContainsEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey].indexOf(cleanString(expression, facetKey)) >= 0
  }
}

const StringNegativeEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] !== cleanString(expression, facetKey)
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

const NumericNegativeEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] !== cleanNumber(expression, facetKey)
  }
}

const NumericLTEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] < cleanNumber(expression, facetKey)
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

const NumericGTEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return item[facetKey] > cleanNumber(expression, facetKey)
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

const DefaultEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    return l.defaultFacet(item).indexOf(String(facetKey)) >= 0
  }
}

const StringOperations: OperationMapping = {
  [EQUAL]: StringEqualityEvaluationGenerator,
  [NOT_EQUAL]: StringNegativeEqualityEvaluationGenerator,
  [CONTAINS]: StringContainsEvaluationGenerator
}

const NumericOperations: OperationMapping = {
  [EQUAL]: NumericEqualityEvaluationGenerator,
  [NOT_EQUAL]: NumericNegativeEqualityEvaluationGenerator,
  [GREATER_THAN]: NumericGTEvaluationGenerator,
  [LESS_THAN]: NumericLTEvaluationGenerator,
  [GREATER_THAN_OR_EQUAL]: NumericGTEEvaluationGenerator,
  [LESS_THAN_OR_EQUAL]: NumericLTEEvaluationGenerator
}

export { StringOperations, NumericOperations, DefaultEvaluationGenerator }
