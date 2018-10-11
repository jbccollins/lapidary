// https://gist.github.com/scottrippey/1349099
export const splitBalanced = (
  input: string,
  /* istanbul ignore next */
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

export const setIn = (target: { [key: string]: any }, keyPath: string[], value: any) => {
  if (keyPath.length === 0) {
    throw new Error('No keys provided in "keyPath" for "setIn"')
  }
  let i = 0
  while (i < keyPath.length - 1) {
    target = target[keyPath[i]]
    i++
  }
  target[keyPath[i]] = value
}

export const getIn = (target: { [key: string]: any }, keyPath: string[]): any => {
  if (keyPath.length === 0) {
    return target
  }
  if (keyPath.length === 1) {
    return target[keyPath[0]]
  }
  return getIn(target[keyPath[0]], keyPath.slice(1))
}

// https://codereview.stackexchange.com/questions/45991/balanced-parentheses
export const parenthesesAreBalanced = (s: string) => {
  const parentheses = '()'
  const stack = []
  let i = 0
  let character = null
  let bracePosition = 0

  for (i = 0; i < s.length; i++) {
    character = s[i]
    bracePosition = parentheses.indexOf(character)

    if (bracePosition === -1) {
      continue
    }

    if (bracePosition % 2 === 0) {
      stack.push(bracePosition + 1) // push next expected brace position
    } else {
      if (stack.length === 0 || stack.pop() !== bracePosition) {
        return false
      }
    }
  }

  return stack.length === 0
}
