import {
  EvaluationTree,
  EvaluationTreeLeaf,
  FilterEvaluator,
  FilterGenerator,
  Facets,
  Item
} from './types'
import Lapidary from './lapidary'
import { AND, OR, XOR, NOT } from './constants'
import { splitBalanced, parenthesesAreBalanced } from './utilities'
import { DefaultEvaluationGenerator } from './operations'

const FILTER_STRING_REGEX = /.+:.*:/gi
// const FILTER_STRING_REGEX = /.+:.*:.+/gi

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
  if (str.match(FILTER_STRING_REGEX)) {
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

const stringToFilterEvaluator = (filterString: string, facets: Facets): FilterEvaluator => {
  const [key, operation, parameters] = filterString.split(':')
  const facetKey = key as keyof Facets

  // Handle raw queries that don't match lapidary syntax
  if (!isInterpretable(filterString)) {
    return DefaultEvaluationGenerator(facetKey, parameters)
  }

  if (!facetKey || !facets[facetKey]) {
    throw new Error(`Invalid facet key: "${facetKey}". Unable to interpret "${filterString}"`)
  }

  /*// If the regex is ever switched back to /.+:.*:.+/gi this will probably need to be re-enabled
  if (!facets[facetKey]) {
    throw new Error(`Invalid facet ${facetKey}. Unable to interpret "${filterString}"`)
  }
  */

  const filterGenerator: FilterGenerator = facets[facetKey].operations[operation]

  if (!filterGenerator) {
    throw new Error(`Invalid operation "${operation}" for "${facetKey}"`)
  }

  return filterGenerator(facetKey, parameters)
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

  switch (tree.joinType) {
    case AND:
      return (
        traverseEvaluationTree(item, tree.left, l) &&
        !tree.invert === traverseEvaluationTree(item, tree.right, l)
      )
    case OR:
      return (
        traverseEvaluationTree(item, tree.left, l) ||
        !tree.invert === traverseEvaluationTree(item, tree.right, l)
      )
    case XOR:
      /* // from: http://www.howtocreate.co.uk/xor.html
        if( !foo != !bar ) {
          ...
        }
      */
      return (
        !traverseEvaluationTree(item, tree.left, l) !==
        !(!tree.invert === traverseEvaluationTree(item, tree.right, l))
      )
    default:
      throw new Error(`Unrecognized join type "${tree.joinType}"`)
  }
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
    // TODO: Is the boolean check for && split[1] really necessary? I don't think so...
    // TODO: This does not support leading "OR NOT" queries. Which I don't think are valid anyway given that
    // the alwaysTrueFilterEvaluator will cause them to always be true.
    // TODO: WTF does OR NOT do anyway??? test it!
    // "first:=:james OR NOT last:=:collins" is the inverse of "(NOT first:=:james) AND last:=:collins"

    if (split[0] === NOT && split[1]) {
      return {
        left: { filterEvaluator: alwaysTrueFilterEvaluator, raw: 'TRUE' }, // Make a dummy left side that will always return true
        joinType: AND,
        invert: true,
        right: recursivelyGenerateEvaluators(split.slice(1), facets)
      }
    }
    // Case like (foo:=:bar) which will become ["foo:=:bar"]
    if (split.length === 1) {
      return recursivelyGenerateEvaluators(split[0], facets)
    }
    // Explicit join type
    if (split[1] === OR || split[1] === AND || split[1] === XOR) {
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
    filterEvaluator: stringToFilterEvaluator(split, facets),
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
