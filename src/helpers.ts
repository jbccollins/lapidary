// https://gist.github.com/scottrippey/1349099
const SplitBalanced = (input, split, open, close, toggle, escape) => {
  // Build the pattern from params with defaults:
  var pattern = '([\\s\\S]*?)(e)?(?:(o)|(c)|(t)|(sp)|$)'
    .replace('sp', split)
    .replace('o', open || '[\\(\\{\\[]')
    .replace('c', close || '[\\)\\}\\]]')
    .replace('t', toggle || '[\'"]')
    .replace('e', escape || '[\\\\]')
  var r = new RegExp(pattern, 'gi')
  var stack = []
  var buffer = []
  var results = []
  input.replace(r, function($0, $1, $e, $o, $c, $t, $s, i) {
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

export { SplitBalanced }
