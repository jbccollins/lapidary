import Lapidary from '../src/lapidary'
import { STRING } from '../src/constants'

import { Item, Facets } from '../src/types'

import { StringOperations, NumericOperations } from '../src/operations'

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
  name: "It's spelled just like escape",
  edition: 1
}

const items: Item[] = [WP_1ST, WP_2ND, MDT_1ST, MDT_2ND, HP_1ST]

const facets: Facets = {
  name: {
    operations: StringOperations
  },
  edition: {
    operations: NumericOperations
  }
}

const context = {}
// describe('Instantiation', () => {
//   it('Lapidary is instantiable', () => {
//     expect(new Lapidary(items, facets, context)).toBeInstanceOf(Lapidary)
//   }),
//   it('Returns all results given an empty query', () => {
//     const lapidary = new Lapidary(items, facets, context)
//     const results = lapidary.parseQuery('')
//     expect(results).toEqual(items)
//   }),
//   it('Fails given invalid facet key', () => {
//     const lapidary = new Lapidary(items, facets, context)
//     expect(() => lapidary.parseQuery('derp:=:"War and Peace"')).toThrow(`Invalid facet key: derp`)
//   })
//   // it('Handles escaped characters correctly', () => {
//   //   const lapidary = new Lapidary(items, facets, context)
//   //   const results = lapidary.parseQuery('name:=:"It\\\'s spelled just like escape"')
//   //   expect(results).toEqual([ESCAPED])
//   // })
// })
// describe('String Queries', () => {
//   it('Returns one result given a single queried name', () => {
//     const lapidary = new Lapidary(items, facets, context)
//     const results = lapidary.parseQuery('name:=:"Harry Potter and the Sorcerers Stone"')
//     expect(results).toEqual([HP_1ST])
//   })
// })

// describe('Numeric Queries', () => {
//   it('Fails on NaN', () => {
//     const lapidary = new Lapidary(items, facets, context)
//     expect(() => lapidary.parseQuery('edition:=:LMAO')).toThrow(`Expected a numeric value for edition. Received "LMAO"`)
//   }),
//   it('Returns correctly given a valid number', () => {
//     const lapidary = new Lapidary(items, facets, context)
//     const results = lapidary.parseQuery('edition:=:2')
//     expect(results).toEqual([WP_2ND, MDT_2ND])
//   })
// })

describe('Join Queries', () => {
  // it('Handles implicit AND', () => {
  //   const lapidary = new Lapidary(items, facets, context)
  //   const results = lapidary.parseQuery('name:=:"My Derpy Turtle" edition:=:2')
  //   expect(results).toEqual([MDT_2ND])
  // }),
  // it('Handles explicit AND', () => {
  //   const lapidary = new Lapidary(items, facets, context)
  //   const results = lapidary.parseQuery('name:=:"My Derpy Turtle" AND edition:=:2')
  //   expect(results).toEqual([MDT_2ND])
  // }),
  it('Handles nested joins', () => {
    const lapidary = new Lapidary(items, facets, context)
    const results = lapidary.parseQuery('name:=:"My Derpy Turtle" AND (edition:=:2 OR edition:=:3)')
    expect(results).toEqual([MDT_2ND])
  })
})
