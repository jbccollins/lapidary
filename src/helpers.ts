import {
  EvaluationTree,
  EvaluationTreeLeaf,
  FilterEvaluator,
  FilterGenerator,
  Facets,
  Item
} from './types'
import { AND, OR, COMPARISONS } from './constants'
// https://gist.github.com/scottrippey/1349099
const SplitBalanced = (
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
  input.replace(r, ($0, $1, $e, $o, $c, $t, $s, i) => {
    if ($e) {
      // Escape
      buffer.push($1, $s || $o || $c || $t)
      return
    } else if ($o)
      // Open
      stack.push($o)
    else if ($c)
      // Close
      stack.pop()
    else if ($t) {
      // Toggle
      if (stack[stack.length - 1] !== $t) stack.push($t)
      else stack.pop()
    } else {
      // Split (if no stack) or EOF
      if ($s ? !stack.length : !$1) {
        buffer.push($1)
        results.push(buffer.join(''))
        buffer = []
        return
      }
    }
    buffer.push($0)
  })
  return results
}

const DELIMITER = ' '

// Idk how to Type the return value for recursive functions
// This should ultimately return String[][]
const recursivelySplitString = (input: string): any => {
  let strippedInput: string = input
  if (strippedInput.startsWith('(') && strippedInput.endsWith(')')) {
    strippedInput = strippedInput.slice(1, -1)
  }
  const split: string[] = SplitBalanced(strippedInput)
  if (split.length === 0 || split.length === 1) {
    return input // TODO This will fail for basic queries that do not require recursion
  }
  return split.map(s => recursivelySplitString(s))
}

const predicateToFilterEvaluator = (predicate: string, facets: Facets): FilterEvaluator => {
  for (let c of COMPARISONS) {
    const [key, expression] = predicate.split(c)
    const facetKey = key as keyof Facets
    if (expression && facetKey) {
      console.log(c, facetKey, expression)
      if (!facets[facetKey]) {
        throw new Error(`Invalid facet key: ${facetKey}`)
      }
      const filterGenerator: FilterGenerator = facets[facetKey].operations[c]
      console.log(facets[facetKey].operations[c])
      return filterGenerator(facetKey, expression)
    }
  }
  return null // TODO: Gonna need a default FilterEvaluator
}

export const traverseEvaluationTree = (
  item: Item,
  evalutionTree: EvaluationTree | EvaluationTreeLeaf
): boolean => {
  return false
}

const recursivelyGenerateEvaluators = (
  split: any,
  facets: Facets
): EvaluationTree | EvaluationTreeLeaf => {
  if (Array.isArray(split)) {
    if (split.length === 0) {
      return {
        left: null,
        joinType: null,
        right: null
      }
    }
    //Case like ((foo:=:bar)) which will become [["foo:=bar"]]
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
  const split: String[] = recursivelySplitString(input)
  console.log(split)
  const evaluationTree = recursivelyGenerateEvaluators(split, facets)
  console.log(evaluationTree)
  return evaluationTree
}

export { SplitBalanced, generateEvaluationTree }
