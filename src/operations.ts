import { FilterEvaluator, FilterGenerator, Item, Facets, OperationMapping } from './types'

import Lapidary from './lapidary'
import {
  BETWEEN,
  CASE_INSENSITIVE_EQUAL,
  CASE_INSENSITIVE_NOT_EQUAL,
  CASE_SENSITIVE_EQUAL,
  CASE_SENSITIVE_NOT_EQUAL,
  CONTAINS,
  EQUAL,
  GREATER_THAN,
  GREATER_THAN_OR_EQUAL,
  INCLUSIVE_BETWEEN,
  LESS_THAN,
  LESS_THAN_OR_EQUAL,
  NOT_EQUAL
} from './constants'

const checkValue = (v: any, facetKey: string | number) => {
  if (typeof v === 'undefined' || v === '') {
    throw new Error(`Expected a value for "${facetKey}"`)
  }
}

// String quotes when doing string operations
const cleanString = (s: string, facetKey: string | number) => {
  checkValue(s, facetKey)
  return s.replace(/['"]+/g, '')
}
// Interpret string value as number
const cleanNumber = (n: string, facetKey: string | number) => {
  checkValue(n, facetKey)
  const num = Number(n)
  if (isNaN(num)) {
    throw new Error(`Expected a numeric value for "${facetKey}". Received "${n}"`)
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

const StringCaseInsensetiveEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey].toLowerCase() === cleanString(expression, facetKey).toLowerCase()
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

const StringNegativeCaseInsensitiveEqualityEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    const objectKey = l.getFacet(facetKey).objectKey
    return item[objectKey].toLowerCase() !== cleanString(expression, facetKey).toLowerCase()
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
  [CASE_SENSITIVE_EQUAL]: StringEqualityEvaluationGenerator,
  [CASE_SENSITIVE_NOT_EQUAL]: StringNegativeEqualityEvaluationGenerator,
  [CASE_INSENSITIVE_EQUAL]: StringCaseInsensetiveEqualityEvaluationGenerator,
  [CASE_INSENSITIVE_NOT_EQUAL]: StringNegativeCaseInsensitiveEqualityEvaluationGenerator,
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
