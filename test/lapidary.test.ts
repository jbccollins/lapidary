import Lapidary from '../src/lapidary'
import { STRING } from '../src/constants'

import { Item, Facets } from '../src/types'

import { StringOperations, NumericOperations, AbstractOperations } from '../src/operations'
import { traverseEvaluationTree, recursivelyGenerateEvaluators } from '../src/helpers'

const WP_1ST = {
  name: 'War and Peace',
  edition: 1
}

const WP_2ND = {
  name: 'War and Peace',
  edition: 2
}

const MDT_1ST = {
  name: 'My Derpy Turtle',
  edition: 1
}

const MDT_2ND = {
  name: 'My Derpy Turtle',
  edition: 2
}

const HP_1ST = {
  name: 'Harry Potter and the Sorcerers Stone',
  edition: 1
}

const ESCAPED = {
  name: 'Its \\ spelled just like escape',
  edition: 1
}

const items: Item[] = [WP_1ST, WP_2ND, MDT_1ST, MDT_2ND, HP_1ST]

const facets: Facets = {
  name: {
    operations: StringOperations
  },
  edition: {
    operations: NumericOperations
  },
  is: {
    operations: AbstractOperations
  }
}

const context = {}
const defaultFacet = (item: Item, value: string | number) =>
  item.name.toLowerCase().indexOf(String(value).toLowerCase()) > -1

describe('Instantiation', () => {
  it('Lapidary is instantiable', () => {
    expect(new Lapidary(items, facets, context, defaultFacet)).toBeInstanceOf(Lapidary)
  }),
    it('Returns all results given an empty query', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('')
      expect(results).toEqual(items)
    })
})

describe('Generic Malformed Queries', () => {
  it('Fails given invalid facet key', () => {
    const lapidary = new Lapidary(items, facets, context, defaultFacet)
    expect(() => lapidary.parseQuery('derp:=:"War and Peace"')).toThrow(
      `Invalid facet key: "derp". Unable to interpret "derp:=:"War and Peace""`
    )
  }),
    it('Fails given invalid operation', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      expect(() => lapidary.parseQuery('name:DERPS:"War and Peace"')).toThrow(
        `Invalid operation DERPS for name`
      )
    }),
    // This is now interpreted as a raw query since it doesn't match the regex
    it('Fails given empty right hand side', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      expect(() => lapidary.parseQuery('name:=:')).toThrow(`Expected a value for name`)
    })
})

describe('String Queries', () => {
  it('Evaluates equality', () => {
    const lapidary = new Lapidary(items, facets, context, defaultFacet)
    const results = lapidary.parseQuery('name:=:"Harry Potter and the Sorcerers Stone"')
    expect(results).toEqual([HP_1ST])
  }),
    it('Evaluates negative equality', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('name:!=:"Harry Potter and the Sorcerers Stone"')
      expect(results).toEqual([WP_1ST, WP_2ND, MDT_1ST, MDT_2ND])
    }),
    it('Evaluates contains', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('name:contains:"Harry"')
      expect(results).toEqual([HP_1ST])
    }),
    it('Handles escaped characters', () => {
      const lapidary = new Lapidary([ESCAPED], facets, context, defaultFacet)
      const results = lapidary.parseQuery(`name:=:"Its \\ spelled just like escape"`)
      expect(results).toEqual([ESCAPED])
    })
})

describe('Numeric Queries', () => {
  it('Fails on NaN', () => {
    const lapidary = new Lapidary(items, facets, context, defaultFacet)
    expect(() => lapidary.parseQuery('edition:=:LMAO')).toThrow(
      `Expected a numeric value for edition. Received "LMAO"`
    )
  }),
    it('Evaluates equality', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('edition:=:2')
      expect(results).toEqual([WP_2ND, MDT_2ND])
    }),
    it('Evaluates negative equality', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('edition:!=:1')
      expect(results).toEqual([WP_2ND, MDT_2ND])
    }),
    // TODO the <= and >= are shitty tests rn.
    it('Evaluates <=', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('edition:<=:2')
      expect(results).toEqual(items)
    }),
    it('Evaluates >=', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('edition:>=:1')
      expect(results).toEqual(items)
    }),
    it('Evaluates <', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('edition:<:2')
      expect(results).toEqual([WP_1ST, MDT_1ST, HP_1ST])
    }),
    it('Evaluates >', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('edition:>:1')
      expect(results).toEqual([WP_2ND, MDT_2ND])
    })
})

describe('Join Queries', () => {
  it('Handles implicit AND', () => {
    const lapidary = new Lapidary(items, facets, context, defaultFacet)
    const results = lapidary.parseQuery('name:=:"My Derpy Turtle" edition:=:2')
    expect(results).toEqual([MDT_2ND])
  }),
    it('Handles explicit AND', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle" AND edition:=:2')
      expect(results).toEqual([MDT_2ND])
    }),
    it('Handles nested joins', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery(
        'name:=:"My Derpy Turtle" AND (edition:=:2 OR edition:=:3)'
      )
      expect(results).toEqual([MDT_2ND])
    }),
    it('Handles extraneous parens', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery(
        '(name:=:"My Derpy Turtle" AND (edition:=:2 OR edition:=:3))'
      )
      expect(results).toEqual([MDT_2ND])
    }),
    it('Handles nested parens', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery(
        '(name:=:"My Derpy Turtle" AND (edition:=:2 OR (edition:=:3 AND edition:!=:1)))'
      )
      expect(results).toEqual([MDT_2ND])
    })
})

describe('Raw Queries', () => {
  it('Handles raw queries', () => {
    const lapidary = new Lapidary(items, facets, context, defaultFacet)
    const results = lapidary.parseQuery(`Harry Potter`)
    expect(results).toEqual([HP_1ST])
  })
})

describe('Abstract Queries', () => {
  it('Handles duplicate', () => {
    const lapidary = new Lapidary([WP_1ST, HP_1ST, WP_1ST], facets, context, defaultFacet)
    const results = lapidary.parseQuery(`is::duplicate`)
    expect(results).toEqual([WP_1ST, WP_1ST])
  }),
    it('Fails given invalid existential usage', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      expect(() => lapidary.parseQuery(`is::derp`)).toThrow(
        `Invalid expression "derp" given to ExistentialComparator "is"`
      )
    })
})

describe('Miscellaneous', () => {
  it('Handles a null evaluation tree', () => {
    const lapidary = new Lapidary(items, facets, context, defaultFacet)
    const r = traverseEvaluationTree(WP_1ST, null, lapidary)
    expect(r).toBe(false)
  }),
    it('Handles extra spaces', () => {
      const lapidary = new Lapidary(items, facets, context, defaultFacet)
      const results = lapidary.parseQuery('name:=:"My Derpy Turtle"            edition:=:2')
      expect(results).toEqual([MDT_2ND])
    }),
    it('Fails on an empty split', () => {
      expect(() => recursivelyGenerateEvaluators([], facets)).toThrow(`Invalid syntax`)
    })
})
