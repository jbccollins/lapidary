import Lapidary from '../src/lapidary'
import { STRING, IS, IMPLICIT } from '../src/constants'

import {
  Item,
  Facets,
  ImplicitComparator,
  FilterEvaluator,
  FilterGenerator,
  EvaluationTree
} from '../src/types'

import { StringOperations, NumericOperations, DateOperations } from '../src/operations'
import { traverseEvaluationTree, recursivelyGenerateEvaluators } from '../src/helpers'

const DUPLICATE = 'duplicate'
const DUPE = 'dupe'
const TRANSIENT_DUPLICATE = 'transdupe'
const isDuplicate = (filterString: string, item: Item, l: Lapidary): boolean => {
  if (!l.getInPermanentContext([DUPLICATE])) {
    let name = ''
    const duplicateContext: { [key: string]: any } = {}
    for (let i = 0; i < l.items.length; i++) {
      name = l.items[i].name
      if (duplicateContext[name]) {
        continue
      }
      if (i < items.length) {
        for (let j = i + 1; j < l.items.length; j++) {
          if (items[j].name == name) {
            duplicateContext[name] = true
          }
        }
      }
    }
    l.setInPermanentContext([DUPLICATE], duplicateContext)
  }
  return l.getInPermanentContext([DUPLICATE, item.name]) === true
}

const isTransientDuplicate = (filterString: string, item: Item, l: Lapidary): boolean => {
  if (!l.getInTransientContext([DUPLICATE])) {
    let name = ''
    const duplicateContext: { [key: string]: any } = {}
    for (let i = 0; i < l.items.length; i++) {
      name = l.items[i].name
      if (duplicateContext[name]) {
        continue
      }
      if (i < items.length) {
        for (let j = i + 1; j < l.items.length; j++) {
          if (items[j].name == name) {
            duplicateContext[name] = true
          }
        }
      }
    }
    l.setInTransientContext([DUPLICATE], duplicateContext)
  }
  return l.getInTransientContext([DUPLICATE, item.name]) === true
}
const ExistentialComparator: ImplicitComparator = (parameters: string, item: Item, l: Lapidary) => {
  switch (parameters) {
    case DUPLICATE:
    case DUPE:
      return isDuplicate(parameters, item, l)
    case TRANSIENT_DUPLICATE:
      return isTransientDuplicate(parameters, item, l)
    default:
      throw new Error(`Invalid parameters "${parameters}" given to ExistentialComparator "is"`)
  }
}

const ImplicitEvaluationGenerator: FilterGenerator = (
  facetKey: keyof Facets,
  filterString: string
): FilterEvaluator => {
  return (item: Item, l: Lapidary) => {
    switch (facetKey) {
      case IS:
        return ExistentialComparator(filterString, item, l)
      default:
        throw new Error('Unknown usage of ImplicitEvaluationGenerator')
    }
  }
}

const WP_1ST = {
  name: 'War and Peace',
  edition: 1,
  date: '2015-07-12'
}

const WP_2ND = {
  name: 'War and Peace',
  edition: 2,
  date: '2018-06-12'
}

const MDT_1ST = {
  name: 'My Derpy Turtle',
  edition: 1,
  date: '2020-06-12'
}

const MDT_2ND = {
  name: 'My Derpy Turtle',
  edition: 2,
  date: '06/12/2016'
}

const HP_1ST = {
  name: 'Harry Potter and the Sorcerers Stone',
  edition: 1,
  date: '2012-06-12'
}

const ESCAPED = {
  name: 'Its \\ spelled just like escape',
  edition: 1,
  date: '1922-06-12'
}

const items: Item[] = [WP_1ST, WP_2ND, MDT_1ST, MDT_2ND, HP_1ST]

const EDITION_FACET = {
  operations: NumericOperations,
  objectKey: 'edition'
}

const facets: Facets = {
  name: {
    operations: StringOperations,
    objectKey: 'name'
  },
  date: {
    operations: DateOperations,
    objectKey: 'date'
  },
  edition: EDITION_FACET,
  ed: EDITION_FACET,
  is: {
    operations: {
      [IMPLICIT]: ImplicitEvaluationGenerator
    },
    objectKey: ''
  }
}

const defaultFacet = (item: Item, value: string | number) => {
  return item.name.toLowerCase().indexOf(String(value).toLowerCase()) > -1
}

const aliases = {
  first: 'firstName',
  last: 'lastName'
}

const options = {
  defaultFacet,
  aliases,
  defaultSuggestion: "Try 'edition:=:2' OR name:contains:Harry"
}

describe('Instantiation', () => {
  it('Lapidary is instantiable', () => {
    expect(new Lapidary(items, facets, options)).toBeInstanceOf(Lapidary)
  }),
    it('Returns all results given an empty query', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('')
      expect(results).toEqual(items)
    })
  it('Returns 0 for currentIndex', () => {
    const lapidary = new Lapidary(items, facets, options)
    const index = lapidary.getCurrentIndex()
    expect(index).toEqual(0)
  })
})

describe('Generic Malformed Queries', () => {
  it('Fails given invalid facet key', () => {
    const lapidary = new Lapidary(items, facets, options)
    expect(() => lapidary.parseQuery('derp:=:"War and Peace"')).toThrow(
      `Invalid facet key: "derp". Unable to interpret "derp:=:"War and Peace""`
    )
  }),
    it('Fails given invalid operation', () => {
      const lapidary = new Lapidary(items, facets, options)
      expect(() => lapidary.parseQuery('name:DERPS:"War and Peace"')).toThrow(
        `Invalid operation "DERPS" for "name"`
      )
    }),
    // This is now interpreted as a raw query since it doesn't match the regex
    it('Fails given empty right hand side (string)', () => {
      const lapidary = new Lapidary(items, facets, options)
      expect(() => lapidary.parseQuery('name:=:')).toThrow(`Expected a value for "name"`)
    })
  it('Fails given empty right hand side (numeric)', () => {
    const lapidary = new Lapidary(items, facets, options)
    expect(() => lapidary.parseQuery('edition:=:')).toThrow(`Expected a value for "edition"`)
  })
})

describe('String Queries', () => {
  it('Evaluates case sensitive equality', () => {
    const lapidary = new Lapidary(items, facets, options)
    const results = lapidary.parseQuery('name:==:"Harry Potter and the Sorcerers Stone"')
    expect(results).toEqual([HP_1ST])
  }),
    it('Evaluates case sensitive negative equality', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:!==:"Harry Potter and the Sorcerers Stone"')
      expect(results).toEqual([WP_1ST, WP_2ND, MDT_1ST, MDT_2ND])
    }),
    it('Evaluates case insensitive equality', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:=:"harry Potter and the Sorcerers Stone"')
      expect(results).toEqual([HP_1ST])
    }),
    it('Evaluates case insensitive negative equality', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:!=:"harry Potter and the Sorcerers Stone"')
      expect(results).toEqual([WP_1ST, WP_2ND, MDT_1ST, MDT_2ND])
    }),
    it('Evaluates contains', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:contains:"Harry"')
      expect(results).toEqual([HP_1ST])
    }),
    it('Handles escaped characters', () => {
      const lapidary = new Lapidary([ESCAPED], facets, options)
      const results = lapidary.parseQuery(`name:=:"Its \\ spelled just like escape"`)
      expect(results).toEqual([ESCAPED])
    })
})

describe('Numeric Queries', () => {
  it('Fails on NaN', () => {
    const lapidary = new Lapidary(items, facets, options)
    expect(() => lapidary.parseQuery('edition:=:LMAO')).toThrow(
      `Expected a numeric value for "edition". Received "LMAO"`
    )
  }),
    it('Evaluates equality', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('edition:=:2')
      expect(results).toEqual([WP_2ND, MDT_2ND])
    }),
    it('Evaluates negative equality', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('edition:!=:1')
      expect(results).toEqual([WP_2ND, MDT_2ND])
    }),
    // TODO the <= and >= are shitty tests rn.
    it('Evaluates <=', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('edition:<=:2')
      expect(results).toEqual(items)
    }),
    it('Evaluates >=', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('edition:>=:1')
      expect(results).toEqual(items)
    }),
    it('Evaluates <', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('edition:<:2')
      expect(results).toEqual([WP_1ST, MDT_1ST, HP_1ST])
    }),
    it('Evaluates >', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('edition:>:1')
      expect(results).toEqual([WP_2ND, MDT_2ND])
    }),
    it('Evaluates between', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('edition:between:1,100')
      expect(results).toEqual([WP_2ND, MDT_2ND])
    }),
    it('Evaluates inbetween', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('edition:inbetween:2,100')
      expect(results).toEqual([WP_2ND, MDT_2ND])
    })
})

describe('Date Queries', () => {
  it('Evaluates equality', () => {
    const lapidary = new Lapidary(items, facets, options)
    const results = lapidary.parseQuery('date:=:2016-06-12')
    expect(results).toEqual([MDT_2ND])
  }),
    it('Evaluates negative equality', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('date:!=:2016-06-12')
      expect(results).toEqual([WP_1ST, WP_2ND, MDT_1ST, HP_1ST])
    }),
    it('Evaluates <=', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('date:<=:2016-06-12')
      expect(results).toEqual([WP_1ST, MDT_2ND, HP_1ST])
    }),
    it('Evaluates >=', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('date:>=:2016-06-12')
      expect(results).toEqual([WP_2ND, MDT_1ST, MDT_2ND])
    }),
    it('Evaluates <', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('date:<:2016-06-12')
      expect(results).toEqual([WP_1ST, HP_1ST])
    }),
    it('Evaluates >', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('date:>:2016-06-12')
      expect(results).toEqual([WP_2ND, MDT_1ST])
    }),
    it('Evaluates between', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('date:between:2016-06-12,2020-06-12')
      expect(results).toEqual([WP_2ND])
    }),
    it('Evaluates inbetween', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('date:inbetween:2016-06-12,2020-06-12')
      expect(results).toEqual([WP_2ND, MDT_1ST, MDT_2ND])
    })
})

describe('Join Queries', () => {
  it('Handles implicit AND', () => {
    const lapidary = new Lapidary(items, facets, options)
    const results = lapidary.parseQuery('name:=:"My Derpy Turtle" edition:=:2')
    expect(results).toEqual([MDT_2ND])
  }),
    it('Handles explicit AND', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle" AND edition:=:2')
      expect(results).toEqual([MDT_2ND])
    }),
    it('Handles explicit OR', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle" OR edition:=:1')
      expect(results).toEqual([WP_1ST, MDT_1ST, MDT_2ND, HP_1ST])
    }),
    it('Handles explicit XOR', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle" XOR edition:=:2')
      expect(results).toEqual([WP_2ND, MDT_1ST])
    }),
    it('Handles nested joins', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery(
        'name:=:"My Derpy Turtle" AND (edition:=:2 OR edition:=:3)'
      )
      expect(results).toEqual([MDT_2ND])
    }),
    it('Handles extraneous parens', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery(
        '(name:=:"My Derpy Turtle" AND (edition:=:2 OR edition:=:3))'
      )
      expect(results).toEqual([MDT_2ND])
    }),
    it('Handles nested parens', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery(
        '(name:=:"My Derpy Turtle" AND (edition:=:2 OR (edition:=:3 AND edition:!=:1)))'
      )
      expect(results).toEqual([MDT_2ND])
    }),
    it('Handles sibling parens', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery(
        '(name:=:"My Derpy Turtle") AND (edition:=:2 OR edition:=:3)'
      )
      expect(results).toEqual([MDT_2ND])
    }),
    it('Handles extraneous, nested and sibling parens combined', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery(
        '(((name:=:"My Derpy Turtle") AND (edition:=:2 OR edition:=:3)) AND name:contains:Derpy)'
      )
      expect(results).toEqual([MDT_2ND])
    })
})

describe('Raw Queries', () => {
  it('Handles raw queries', () => {
    const lapidary = new Lapidary(items, facets, options)
    const results = lapidary.parseQuery(`Harry Potter`)
    expect(results).toEqual([HP_1ST])
  })
})

describe('Abstract Queries', () => {
  it('Handles permanent duplicate', () => {
    const lapidary = new Lapidary([WP_1ST, HP_1ST, WP_1ST], facets, options)
    const results = lapidary.parseQuery(`is::duplicate`)
    expect(results).toEqual([WP_1ST, WP_1ST])
  }),
    it('Handles transient duplicate', () => {
      const lapidary = new Lapidary([WP_1ST, HP_1ST, WP_1ST], facets, options)
      const results = lapidary.parseQuery(`is::transdupe`)
      expect(results).toEqual([WP_1ST, WP_1ST])
    }),
    it('Fails given invalid existential usage', () => {
      const lapidary = new Lapidary(items, facets, options)
      expect(() => lapidary.parseQuery(`is::derp`)).toThrow(
        `Invalid parameters "derp" given to ExistentialComparator "is"`
      )
    })
})

describe('Miscellaneous', () => {
  it('Handles a null evaluation tree', () => {
    const lapidary = new Lapidary(items, facets, options)
    const r = traverseEvaluationTree(WP_1ST, null, lapidary)
    expect(r).toBe(false)
  }),
    it('Handles an evaluation tree with an invalid join type', () => {
      const lapidary = new Lapidary(items, facets, options)
      const badEvaluationTree: EvaluationTree = {
        joinType: 'LOL',
        left: null,
        right: null,
        invert: false
      }
      expect(() => traverseEvaluationTree(WP_1ST, badEvaluationTree, lapidary)).toThrow(
        `Unrecognized join type "LOL"`
      )
    }),
    it('Handles extra spaces between expressions', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle"            edition:=:2        ')
      expect(results).toEqual([MDT_2ND])
    }),
    it('Handles extra spaces after parentheses expressions', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery(
        '(  name:=:"My Derpy Turtle" AND (  edition:=:2 OR (    edition:=:3 AND edition:!=:1      ) )  )  '
      )
      expect(results).toEqual([MDT_2ND])
    }),
    it('Fails on an empty split', () => {
      expect(() => recursivelyGenerateEvaluators([], facets)).toThrow(`Invalid syntax`)
    })
  it('Generates an evaluation tree when asked for one', () => {
    const lapidary = new Lapidary(items, facets, options)
    // TODO: This is a shitty test
    expect(lapidary.getEvaluationTree('name:=:"My Derpy Turtle" edition:=:2')).not.toBe(null)
  })
})

describe('Suggestions', () => {
  it('Handles empty facet key suggestions', () => {
    const lapidary = new Lapidary(items, facets, options)
    const suggestions = lapidary.getSuggestions('', 0)
    expect(suggestions).toEqual([])
  }),
    it('Handles unknown facet key suggestions', () => {
      const lapidary = new Lapidary(items, facets, options)
      const suggestions = lapidary.getSuggestions('derp', 0)
      expect(suggestions).toEqual([])
    }),
    it('Handles valid facet key suggestions', () => {
      const lapidary = new Lapidary(items, facets, options)
      const suggestions = lapidary.getSuggestions('nam', 0)
      expect(suggestions).toEqual(['name'])
    })
})

describe('Negation', () => {
  it('Handles leading negation', () => {
    const lapidary = new Lapidary(items, facets, options)
    const results = lapidary.parseQuery('NOT name:=:"My Derpy Turtle"')
    expect(results).toEqual([WP_1ST, WP_2ND, HP_1ST])
  }),
    it('Handles leading negation with multiple cuts', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('NOT name:=:"My Derpy Turtle" OR name:=:"War and Peace"')
      expect(results).toEqual([HP_1ST])
    }),
    it('Handles scoped negation with multiple cuts', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('(NOT name:=:"My Derpy Turtle") OR edition:=:1')
      expect(results).toEqual([WP_1ST, WP_2ND, MDT_1ST, HP_1ST])
    }),
    it('Handles leading negation with parentheses', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('NOT (name:=:"My Derpy Turtle")')
      expect(results).toEqual([WP_1ST, WP_2ND, HP_1ST])
    }),
    it('Handles nested negation with explicit AND', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle" AND NOT edition:=:2')
      expect(results).toEqual([MDT_1ST])
    }),
    it('Handles nested negation with explicit AND and parentheses', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle" AND NOT (edition:=:2)')
      expect(results).toEqual([MDT_1ST])
    }),
    it('Handles nested negation with implicit AND', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle" NOT edition:=:2')
      expect(results).toEqual([MDT_1ST])
    }),
    it('Handles nested negation with implicit AND and parentheses', () => {
      const lapidary = new Lapidary(items, facets, options)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle" NOT (edition:=:2)')
      expect(results).toEqual([MDT_1ST])
    }),
    it('Handles negation with abstract queries', () => {
      const lapidary = new Lapidary([WP_1ST, HP_1ST, WP_1ST], facets, options)
      const results = lapidary.parseQuery(`NOT is::duplicate`)
      expect(results).toEqual([HP_1ST])
    })
})
