const LESS_THAN = '<'
const GREATER_THAN = '>'
const LESS_THAN_OR_EQUAL = '<='
const GREATER_THAN_OR_EQUAL = '>='
const EQUAL = '='
const NOT_EQUAL = '!='
const CONTAINS = 'contains'

const STRING = 'string'
const NUMERIC = 'numeric'

const COMPARISONS = [
  NOT_EQUAL,
  LESS_THAN,
  GREATER_THAN,
  LESS_THAN_OR_EQUAL,
  GREATER_THAN_OR_EQUAL,
  EQUAL,
  CONTAINS
]

const AND = 'AND'
const OR = 'OR'

const JOINS = [AND, OR]

export {
  STRING,
  NUMERIC,
  LESS_THAN,
  GREATER_THAN,
  LESS_THAN_OR_EQUAL,
  GREATER_THAN_OR_EQUAL,
  EQUAL,
  COMPARISONS,
  AND,
  OR,
  NOT_EQUAL,
  JOINS,
  CONTAINS
}