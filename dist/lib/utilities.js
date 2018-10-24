"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://gist.github.com/scottrippey/1349099
exports.splitBalanced = function (input, 
/* istanbul ignore next */
split, open, close, toggle, escape) {
    if (split === void 0) { 
    /* istanbul ignore next */
    split = ' '; }
    if (open === void 0) { open = ''; }
    if (close === void 0) { close = ''; }
    if (toggle === void 0) { toggle = ''; }
    if (escape === void 0) { escape = ''; }
    // Build the pattern from params with defaults:
    var pattern = '([\\s\\S]*?)(e)?(?:(o)|(c)|(t)|(sp)|$)'
        .replace('sp', split)
        .replace('o', open || '[\\(\\{\\[]')
        .replace('c', close || '[\\)\\}\\]]')
        .replace('t', toggle || '[\'"]')
        .replace('e', escape || '[\\\\]');
    var r = new RegExp(pattern, 'gi');
    var stack = [];
    var buffer = [];
    var results = [];
    // Clone the input string
    var clonedInput = '' + input;
    clonedInput.replace(r, function ($0, $1, $e, $o, $c, $t, $s, i) {
        if ($e) {
            // Escape
            buffer.push($1, $s || $o || $c || $t);
            return $0; // Does nothing. Just satisfies Typescript's insatiable thirst for a string return;
        }
        else if ($o) {
            // Open
            stack.push($o);
        }
        else if ($c) {
            // Close
            stack.pop();
        }
        else if ($t) {
            // Toggle
            if (stack[stack.length - 1] !== $t)
                stack.push($t);
            else
                stack.pop();
        }
        else {
            // Split (if no stack) or EOF
            if ($s ? !stack.length : !$1) {
                buffer.push($1);
                results.push(buffer.join(''));
                buffer = [];
                return $0; // Does nothing. Just satisfies Typescript's insatiable thirst for a string return;
            }
        }
        buffer.push($0);
        return $0; // Does nothing. Just satisfies Typescript's insatiable thirst for a string return;
    });
    return results;
};
exports.setIn = function (target, keyPath, value) {
    if (keyPath.length === 0) {
        throw new Error('No keys provided in "keyPath" for "setIn"');
    }
    var i = 0;
    while (i < keyPath.length - 1) {
        target = target[keyPath[i]];
        i++;
    }
    target[keyPath[i]] = value;
};
exports.getIn = function (target, keyPath) {
    if (keyPath.length === 0) {
        return target;
    }
    if (keyPath.length === 1) {
        return target[keyPath[0]];
    }
    return exports.getIn(target[keyPath[0]], keyPath.slice(1));
};
// https://codereview.stackexchange.com/questions/45991/balanced-parentheses
exports.parenthesesAreBalanced = function (s) {
    var parentheses = '()';
    var stack = [];
    var i = 0;
    var character = null;
    var bracePosition = 0;
    for (i = 0; i < s.length; i++) {
        character = s[i];
        bracePosition = parentheses.indexOf(character);
        if (bracePosition === -1) {
            continue;
        }
        if (bracePosition % 2 === 0) {
            stack.push(bracePosition + 1); // push next expected brace position
        }
        else {
            if (stack.length === 0 || stack.pop() !== bracePosition) {
                return false;
            }
        }
    }
    return stack.length === 0;
};
//# sourceMappingURL=utilities.js.map