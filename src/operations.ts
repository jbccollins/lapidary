import {
  FilterEvaluator,
  FilterGenerator,
  Item,
  Facets,
  OperationMapping,
  AbstractComparator
} from './types'

import Lapidary from './lapidary'
import {
  EQUAL,
  NOT_EQUAL,
  GREATER_THAN_OR_EQUAL,
  LESS_THAN_OR_EQUAL,
  LESS_THAN,
  GREATER_THAN,
  CONTAINS,
  ABSTRACT
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
  return (item: Item, l: Lapidary) => l.defaultFacet(item, facetKey)
}

// TODO: Extract this to utility or something
const isDuplicate = (expression: string, item: Item, l: Lapidary) => {
  let count = 0
  for (let i in l.items) {
    if (l.items[i].name === item.name) {
      count++
    }
    if (count > 1) {
      return true
    }
  }
  return false
}

// handle "is"
// TODO: This is super inefficient. Use transientContext and currentIndex to store know duplicates and search the remainder of possible duplicates
const ExistentialComparator: AbstractComparator = (expression: string, item: Item, l: Lapidary) => {
  switch (expression) {
    case 'duplicate':
      return isDuplicate(expression, item, l)
    default:
      throw `Invalid expression "${expression}" given to ExistentialComparator "is"`
  }
}

const AbstractEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  expression: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    switch (facetKey) {
      case 'is':
        return ExistentialComparator(expression, item, l)
      default:
        throw 'Unknown usage of AbstractEvaluationGenerator'
    }
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

const AbstractOperations: OperationMapping = {
  [ABSTRACT]: AbstractEvaluationGenerator
}

export { StringOperations, NumericOperations, AbstractOperations, DefaultEvaluationGenerator }
