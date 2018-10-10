import { FilterEvaluator, FilterGenerator, Item, Facets, OperationMapping } from './types'

import Lapidary from './lapidary'
import {
  EQUAL,
  NOT_EQUAL,
  GREATER_THAN_OR_EQUAL,
  LESS_THAN_OR_EQUAL,
  LESS_THAN,
  GREATER_THAN,
  CONTAINS,
  BETWEEN,
  INCLUSIVE_BETWEEN
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
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey] === cleanString(expression, facetKey)
  }
}

const StringContainsEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey].indexOf(cleanString(expression, facetKey)) >= 0
  }
}

const StringNegativeEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey] !== cleanString(expression, facetKey)
  }
}

const NumericEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey] === cleanNumber(expression, facetKey)
  }
}

const NumericNegativeEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey] !== cleanNumber(expression, facetKey)
  }
}

const NumericLTEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey] < cleanNumber(expression, facetKey)
  }
}

const NumericLTEEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey] <= cleanNumber(expression, facetKey)
  }
}

const NumericGTEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey] > cleanNumber(expression, facetKey)
  }
}

const NumericGTEEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey] >= cleanNumber(expression, facetKey)
  }
}

const NumericBetweenEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    const [lower, upper] = expression.split(',')
    return (
      item[objectKey] > cleanNumber(lower, facetKey) &&
      item[objectKey] < cleanNumber(upper, facetKey)
    )
  }
}

const NumericInclusiveBetweenEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    const [lower, upper] = expression.split(',')
    return (
      item[objectKey] >= cleanNumber(lower, facetKey) &&
      item[objectKey] <= cleanNumber(upper, facetKey)
    )
  }
}

const DefaultEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => l.defaultFacet(item, facetKey)
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
  [LESS_THAN_OR_EQUAL]: NumericLTEEvaluationGenerator,
  [BETWEEN]: NumericBetweenEvaluationGenerator,
  [INCLUSIVE_BETWEEN]: NumericInclusiveBetweenEvaluationGenerator
}

export { StringOperations, NumericOperations, DefaultEvaluationGenerator }
