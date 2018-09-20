import {
  EvaluationTree,
  EvaluationTreeLeaf,
  FilterEvaluator,
  FilterGenerator,
  Facets,
  Item
} from './types'
import Lapidary from './lapidary'
import { AND, OR } from './constants'
// https://gist.github.com/scottrippey/1349099
const splitBalanced = (
  input: string,
  split: string = ' ',
  open: string = '',
  close: string = '',
  toggle: string = '',
  escape: string = ''
): string[] => {
  // Build the pattern from params with defaults:
  const pattern = '([\\s\\S]*?)(e)?(?:(o)|(c)|(t)|(sp)|$)'
    .replace('sp', split)
    .replace('o', open || '[\\(\\{\\[]')
    .replace('c', close || '[\\)\\}\\]]')
    .replace('t', toggle || '[\'"]')
    .replace('e', escape || '[\\\\]')
  const r = new RegExp(pattern, 'gi')
  const stack: string[] = []
  let buffer: string[] = []
  const results: string[] = []
  // Clone the input string
  const clonedInput = '' + input
  clonedInput.replace(r, ($0, $1, $e, $o, $c, $t, $s, i) => {
    if ($e) {
      // Escape
      buffer.push($1, $s || $o || $c || $t)
      return $0 // Does nothing. Just satisfies Typescript's insatiable thirst for a string return;
    } else if ($o) {
      // Open
      stack.push($o)
    } else if ($c) {
      // Close
      stack.pop()
    } else if ($t) {
      // Toggle
      if (stack[stack.length - 1] !== $t) stack.push($t)
      else stack.pop()
    } else {
      // Split (if no stack) or EOF
      if ($s ? !stack.length : !$1) {
        buffer.push($1)
        results.push(buffer.join(''))
        buffer = []
        return $0 // Does nothing. Just satisfies Typescript's insatiable thirst for a string return;
      }
    }
    buffer.push($0)
    return $0 // Does nothing. Just satisfies Typescript's insatiable thirst for a string return;
  })
  return results
}

// Idk how to Type the return value for recursive functions
// This should ultimately return String[][]
const recursivelySplitString = (input: string, depth: number): any => {
  let strippedInput: string = input
  if (strippedInput.startsWith('(') && strippedInput.endsWith(')')) {
    strippedInput = strippedInput.slice(1, -1)
  }
  const split: string[] = splitBalanced(strippedInput)
  if (split.length === 0 || split.length === 1) {
    if (depth === 0) {
      // If no recursion is needed
      return [input]
    }
    return input
  }
  return split.map(s => recursivelySplitString(s, depth + 1))
}

const predicateToFilterEvaluator = (predicate: string, facets: Facets): FilterEvaluator => {
  // \w+:\w*:\w+ Should be the regex I need I think...
  const [key, operation, expression] = predicate.split(':')
  const facetKey = key as keyof Facets
  if (expression && facetKey) {
    if (!facets[facetKey]) {
      throw new Error(`Invalid facet key: ${facetKey}`)
    }
  }
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
        traverseEvaluationTree(item, tree.left, l) && traverseEvaluationTree(item, tree.right, l)
      )
    }
    return traverseEvaluationTree(item, tree.left, l) || traverseEvaluationTree(item, tree.right, l)
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
    // Case like (foo:=:bar) which will become ["foo:=bar"]
    if (split.length === 1) {
      return {
        left: recursivelyGenerateEvaluators(split[0], facets),
        joinType: null,
        right: null
      }
    }
    // Explicit join type
    if (split[1] === OR || split[1] === AND) {
      return {
        left: recursivelyGenerateEvaluators(split[0], facets),
        joinType: split[1],
        right: recursivelyGenerateEvaluators(split.slice(2), facets)
      }
    }
    // Implicit "AND" join type
    return {
      left: recursivelyGenerateEvaluators(split[0], facets),
      joinType: AND,
      right: recursivelyGenerateEvaluators(split.slice(1), facets)
    }
  }
  // String as EvaluationLeaf
  return {
    filterEvaluator: predicateToFilterEvaluator(split, facets)
  }
}

const generateEvaluationTree = (
  input: string,
  facets: Facets
): EvaluationTree | EvaluationTreeLeaf => {
  const split: String[] = recursivelySplitString(input, 0)
  const evaluationTree = recursivelyGenerateEvaluators(split, facets)
  return evaluationTree
}

export { generateEvaluationTree }
