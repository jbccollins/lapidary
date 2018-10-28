import {
  EvaluationTree,
  EvaluationTreeLeaf,
  FilterEvaluator,
  FilterGenerator,
  Facets,
  Item
} from './types'
import Lapidary from './lapidary'
import { AND, OR, NOT } from './constants'
import { splitBalanced, parenthesesAreBalanced } from './utilities'
import { DefaultEvaluationGenerator } from './operations'

const EXPRESSION_REGEX = /.+:.*:/gi
// const EXPRESSION_REGEX = /.+:.*:.+/gi

const alwaysTrueFilterEvaluator: FilterEvaluator = (item: Item, l: Lapidary) => true

const isInterpretable = (str: string) => {
  /* Currently unused because of recursivelySplitString
  if (str.startsWith('(') && str.endsWith(')')) {
    return true
  }
  if (str === AND || str === OR) {
    return true
  }
  */
  if (str.match(EXPRESSION_REGEX)) {
    return true
  }
  return false
}

const stripParens = (s: string) => {
  if (s.startsWith('(') && s.endsWith(')')) {
    return s.slice(1, -1)
  }
  return s
}

// Idk how to Type the return value for recursive functions
// This should ultimately return String[][]
const recursivelySplitString = (input: string, depth: number): any => {
  let strippedInput: string = stripParens(input)
  // Must check for balanced parens. Blindly stripping based on the start and end characters is not safe.
  // e.g: (name:=:james) OR (name:=:jane) would horribly fail
  if (!parenthesesAreBalanced(strippedInput)) {
    strippedInput = input
  }
  const split: string[] = splitBalanced(strippedInput)
  if (split.length === 0 || split.length === 1) {
    if (depth === 0) {
      // If no recursion is needed
      return [strippedInput]
    }
    return strippedInput
  }
  return split.map(s => recursivelySplitString(s, depth + 1))
}

const predicateToFilterEvaluator = (predicate: string, facets: Facets): FilterEvaluator => {
  const [key, operation, expression] = predicate.split(':')
  const facetKey = key as keyof Facets

  // Handle raw queries that don't match lapidary syntax
  if (!isInterpretable(predicate)) {
    return DefaultEvaluationGenerator(facetKey, expression)
  }

  if (expression && facetKey) {
    if (!facets[facetKey]) {
      throw new Error(`Invalid facet key: "${facetKey}". Unable to interpret "${predicate}"`)
    }
  }

  /*// If the regex is ever switched back to /.+:.*:.+/gi this will probably need to be re-enabled
  if (!facets[facetKey]) {
    throw new Error(`Invalid facet ${facetKey}. Unable to interpret "${predicate}"`)
  }
  */

  const filterGenerator: FilterGenerator = facets[facetKey].operations[operation]

  if (!filterGenerator) {
    throw new Error(`Invalid operation ${operation} for ${facetKey}`)
  }

  return filterGenerator(facetKey, expression)
}

export const traverseEvaluationTree = (
  item: Item,
  evalutionTree: EvaluationTree | EvaluationTreeLeaf | null,
  l: Lapidary
): boolean => {
  if (!evalutionTree) {
    return false
  }
  // TODO: I have no idea how to do typechecking on union types. Maybe refactor the EvaluationTree and EvaluationTreeLeaf to be the same type.
  if (evalutionTree.hasOwnProperty('filterEvaluator')) {
    return (evalutionTree as EvaluationTreeLeaf).filterEvaluator(item, l)
  }
  const tree = evalutionTree as EvaluationTree

  // TODO: This is kinda messy.... And I'm not even sure the last case is necessary
  if (tree.left && tree.right) {
    if (tree.joinType === AND) {
      return (
        traverseEvaluationTree(item, tree.left, l) &&
        !tree.invert === traverseEvaluationTree(item, tree.right, l)
      )
    }
    return (
      traverseEvaluationTree(item, tree.left, l) ||
      !tree.invert === traverseEvaluationTree(item, tree.right, l)
    )
  }
  return traverseEvaluationTree(item, tree.left, l)
}

export const recursivelyGenerateEvaluators = (
  split: any,
  facets: Facets
): EvaluationTree | EvaluationTreeLeaf => {
  if (Array.isArray(split)) {
    if (split.length < 1) {
      throw new Error('Invalid syntax')
    }
    // Special case for when the query string starts with NOT. e.g. "NOT (is::duplicate)"
    if (split[0] === NOT && split[1]) {
      return {
        left: { filterEvaluator: alwaysTrueFilterEvaluator, raw: '' }, // Make a dummy left side that will always return true
        joinType: AND,
        invert: true,
        right: recursivelyGenerateEvaluators(split[1], facets)
      }
    }
    // Case like (foo:=:bar) which will become ["foo:=:bar"]
    if (split.length === 1) {
      return {
        left: recursivelyGenerateEvaluators(split[0], facets),
        joinType: null,
        invert: false,
        right: null
      }
    }
    // Explicit join type
    if (split[1] === OR || split[1] === AND) {
      const inverted = split[2] && split[2] === NOT
      return {
        left: recursivelyGenerateEvaluators(split[0], facets),
        joinType: split[1],
        invert: inverted, // "foo:=:bar AND NOT bar:=:foo"
        right: recursivelyGenerateEvaluators(split.slice(inverted ? 3 : 2), facets)
      }
    }
    // Implicit "AND" join type
    const inverted = split[1] && split[1] === NOT
    return {
      left: recursivelyGenerateEvaluators(split[0], facets),
      joinType: AND,
      invert: inverted, // "foo:=:bar NOT bar:=:foo"
      right: recursivelyGenerateEvaluators(split.slice(inverted ? 2 : 1), facets)
    }
  }
  // String as EvaluationLeaf
  return {
    filterEvaluator: predicateToFilterEvaluator(split, facets),
    raw: split
  }
}

const generateEvaluationTree = (
  input: string,
  facets: Facets
): EvaluationTree | EvaluationTreeLeaf => {
  // Replace instances of multiple spaces with a single space
  const squashedInput = input.replace(/\s\s+/g, ' ').trim()
  const split: String[] = recursivelySplitString(squashedInput, 0)
  const evaluationTree = recursivelyGenerateEvaluators(split, facets)
  return evaluationTree
}

export { generateEvaluationTree }
